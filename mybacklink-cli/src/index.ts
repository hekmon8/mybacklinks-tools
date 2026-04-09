#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import {
	getBooleanFlag,
	getNumberFlag,
	getStringFlag,
	parseArgv,
} from "./argv.js";
import {
	getCommandDefinition,
	getCommandDefinitions,
	getGlobalParams,
} from "./command-registry.js";
import {
	type StoredCredentials,
	deleteCredentials,
	loadCredentials,
	requireCredentials,
	saveCredentials,
} from "./credentials.js";
import { printOutput, resolveOutputFormat } from "./format.js";
import { invokeTool, normalizeBaseUrl, validateCredentials } from "./http.js";
import { loginWithOAuth } from "./oauth.js";
import { USER_AGENT } from "./shared.js";
import { performUpdate, startUpdateCheck } from "./update.js";

const updateCheck = startUpdateCheck();

async function main() {
	const parsed = parseArgv(process.argv.slice(2));
	const commandName = parsed.command;
	const outputFormat = resolveOutputFormat(parsed.flags);
	const baseUrl = getStringFlag(parsed.flags, "base-url");

	if (!commandName || commandName === "help") {
		renderHelp();
		return;
	}

	if (getBooleanFlag(parsed.flags, "help")) {
		const def = getCommandDefinition(commandName);
		if (def) {
			renderCommandHelp(def);
		} else {
			renderHelp();
		}
		return;
	}

	if (commandName === "login") {
		const apiKey = getStringFlag(parsed.flags, "api-key");

		if (apiKey) {
			process.stderr.write("Validating API key...\n");
		}

		const credentials: StoredCredentials = apiKey
			? {
					version: 1,
					profile: "default",
					baseUrl: baseUrl || "https://mybacklinks.app",
					authMode: "api_key",
					apiKey,
				}
			: await loginWithOAuth({
					baseUrl,
					port: getNumberFlag(parsed.flags, "port"),
				});

		process.stderr.write("Verifying credentials...\n");
		await validateCredentials(credentials, baseUrl);
		await saveCredentials(credentials);

		printOutput(
			{
				message:
					credentials.authMode === "api_key"
						? "Logged in with API Key"
						: "Logged in with OAuth",
				authMode: credentials.authMode,
				baseUrl: credentials.baseUrl,
			},
			outputFormat,
		);
		return;
	}

	if (commandName === "logout") {
		const credentials = await loadCredentials();
		if (credentials) {
			await revokeRemoteCredentials(credentials, baseUrl);
			await deleteCredentials();
		}
		printOutput({ message: "Logged out successfully" }, outputFormat);
		return;
	}

	const definition = getCommandDefinition(commandName);
	if (!definition?.toolName) {
		throw new Error(`Unknown command: ${commandName}`);
	}

	const credentials = await requireCredentials();
	validateRequiredParams(commandName, parsed.flags);
	const input = await buildInput(commandName, parsed.flags);

	if (isPaginatedCommand(commandName) && getBooleanFlag(parsed.flags, "all")) {
		const allResults = await fetchAllPages({
			commandName,
			flags: parsed.flags,
			baseUrl,
			credentials,
		});
		printOutput(transformResult(commandName, allResults), outputFormat);
		return;
	}

	const result = await invokeTool({
		commandName,
		input,
		baseUrl,
		credentials,
	});

	const transformed = transformResult(commandName, result);
	printPaginationHint(commandName, result);
	printOutput(transformed, outputFormat);
}

async function buildInput(
	commandName: string,
	flags: Record<string, string | boolean>,
): Promise<Record<string, unknown>> {
	switch (commandName) {
		case "status":
			return {};
		case "list-projects":
			return compactObject({
				limit: getNumberFlag(flags, "limit"),
				cursor: getStringFlag(flags, "cursor"),
				filter: compactObject({
					name: getStringFlag(flags, "name"),
					status: getStringFlag(flags, "status"),
				}),
			});
		case "list-backlink-resources":
			return compactObject({
				limit: getNumberFlag(flags, "limit"),
				cursor: getStringFlag(flags, "cursor"),
				filter: compactObject({
					type: getStringFlag(flags, "type"),
					payment: getStringFlag(flags, "payment-type"),
					drMin: getNumberFlag(flags, "dr-min"),
					drMax: getNumberFlag(flags, "dr-max"),
				}),
			});
		case "add-backlink-resource":
			return compactObject({
				domain: requiredString(flags, "domain"),
				type: requiredString(flags, "type"),
				submissionUrl: getStringFlag(flags, "submission-url"),
				paymentType: getStringFlag(flags, "payment-type"),
				submissionMethod: getStringFlag(flags, "submission-method"),
				howToSubmit: getStringFlag(flags, "how-to-submit"),
				dr: getNumberFlag(flags, "dr"),
				traffic: getNumberFlag(flags, "traffic"),
				notes: getStringFlag(flags, "notes"),
			});
		case "update-backlink-resource":
			return compactObject({
				id: requiredString(flags, "id"),
				submissionUrl: getStringFlag(flags, "submission-url"),
				type: getStringFlag(flags, "type"),
				paymentType: getStringFlag(flags, "payment-type"),
				submissionMethod: getNullableStringFlag(flags, "submission-method"),
				howToSubmit: getNullableStringFlag(flags, "how-to-submit"),
				dr: getNullableNumberFlag(flags, "dr"),
				traffic: getNullableNumberFlag(flags, "traffic"),
				notes: getNullableStringFlag(flags, "notes"),
			});
		case "fetch-project-info":
			return compactObject({
				projectId: getStringFlag(flags, "project-id"),
				domain: getStringFlag(flags, "domain"),
			});
		case "update-project-info": {
			const payload = compactObject({
				projectId: requiredString(flags, "project-id"),
				name: getStringFlag(flags, "name"),
				description: getStringFlag(flags, "description"),
				url: getStringFlag(flags, "url"),
				status: getStringFlag(flags, "status"),
			});

			if (Object.keys(payload).length === 1) {
				throw new Error(
					"At least one field to update is required, e.g. --name or --status.",
				);
			}

			return payload;
		}
		case "fetch-project-backlinks":
			return compactObject({
				projectId: requiredString(flags, "project-id"),
				status: getStringFlag(flags, "status"),
				resourceDomain: getStringFlag(flags, "resource-domain"),
				anchorText: getStringFlag(flags, "anchor-text"),
				targetUrl: getStringFlag(flags, "target-url"),
				limit: getNumberFlag(flags, "limit"),
				cursor: getStringFlag(flags, "cursor"),
			});
		case "update-project-backlinks":
			return await buildProjectBacklinkUpdateInput(flags);
		case "fetch-backlinks-by-domain":
			return compactObject({
				domain: requiredString(flags, "domain"),
				mode: getStringFlag(flags, "mode"),
				dofollow:
					"dofollow" in flags ? getBooleanFlag(flags, "dofollow") : undefined,
				minDR: getNumberFlag(flags, "min-dr"),
				anchorText: getStringFlag(flags, "anchor-text"),
				limit: getNumberFlag(flags, "limit"),
			});
		case "fetch-dr-by-domain":
		case "fetch-traffic-by-domain":
			return {
				domain: requiredString(flags, "domain"),
			};
		default:
			throw new Error(`Command not implemented: ${commandName}`);
	}
}

async function buildProjectBacklinkUpdateInput(
	flags: Record<string, string | boolean>,
) {
	const file = getStringFlag(flags, "file");
	if (file) {
		const content = await readFile(file, "utf8");
		let parsed: unknown;
		try {
			parsed = JSON.parse(content);
		} catch {
			throw new Error(`--file "${file}" is not valid JSON.`);
		}
		if (Array.isArray(parsed)) {
			return { items: parsed };
		}
		if (isRecord(parsed)) {
			if (!parsed.projectId && !Array.isArray(parsed.items)) {
			throw new Error(
				"--file JSON object must contain a `projectId` or `items` field.",
			);
			}
			return parsed;
		}
		throw new Error("--file must be a JSON object or JSON array.");
	}

	return compactObject({
		projectId: requiredString(flags, "project-id"),
		backlinkId: getStringFlag(flags, "backlink-id"),
		resourceId: getStringFlag(flags, "resource-id"),
		targetUrl: getStringFlag(flags, "target-url"),
		backlinkUrl: getStringFlag(flags, "backlink-url"),
		anchor: getStringFlag(flags, "anchor"),
		status: getStringFlag(flags, "status"),
		utmSource: getStringFlag(flags, "utm-source"),
		notes: getStringFlag(flags, "notes"),
	});
}

function transformResult(commandName: string, result: unknown) {
	if (!result || typeof result !== "object") return result;

	// Strip nextCursor from paginated responses (pagination hint is shown separately on stderr)
	if (isPaginatedCommand(commandName)) {
		const { nextCursor: _, ...rest } = result as Record<string, unknown>;
		return rest;
	}

	if (
		commandName !== "fetch-dr-by-domain" &&
		commandName !== "fetch-traffic-by-domain"
	) {
		return result;
	}

	if (
		!("metrics" in result) ||
		typeof (result as Record<string, unknown>).metrics !== "object" ||
		!(result as Record<string, unknown>).metrics
	) {
		return result;
	}

	const r = result as Record<string, unknown>;
	const metrics = r.metrics as Record<string, unknown>;
	return commandName === "fetch-dr-by-domain"
		? {
				domain: r.domain,
				dr: metrics.dr,
				creditCost: r.creditCost,
				creditBalance: r.creditBalance,
			}
		: {
				domain: r.domain,
				traffic: metrics.traffic,
				creditCost: r.creditCost,
				creditBalance: r.creditBalance,
			};
}

function requiredString(flags: Record<string, string | boolean>, name: string) {
	const value = getStringFlag(flags, name);
	if (!value) {
		throw new Error(`Missing required option --${name}`);
	}

	return value;
}

function getNullableStringFlag(
	flags: Record<string, string | boolean>,
	name: string,
) {
	const value = getStringFlag(flags, name);
	return value === "null" ? null : value;
}

function getNullableNumberFlag(
	flags: Record<string, string | boolean>,
	name: string,
) {
	const value = getStringFlag(flags, name);
	if (value === "null") {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => item !== undefined),
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function revokeRemoteCredentials(
	credentials: StoredCredentials,
	baseUrlOverride?: string,
) {
	const resolvedBaseUrl = normalizeBaseUrl(
		baseUrlOverride || credentials.baseUrl,
	);

	const token =
		credentials.authMode === "api_key"
			? credentials.apiKey
			: credentials.accessToken;

	try {
		await fetch(`${resolvedBaseUrl}/api/oauth/revoke`, {
			method: "POST",
			signal: AbortSignal.timeout(10_000),
			headers: {
				authorization: `Bearer ${token}`,
				"user-agent": USER_AGENT,
			},
		});
	} catch {
		// Best-effort revoke; proceed with local deletion even if server is unreachable
	}
}

function validateRequiredParams(
	commandName: string,
	flags: Record<string, string | boolean>,
) {
	const definition = getCommandDefinition(commandName);
	if (!definition?.params) return;

	const missing = definition.params
		.filter((p) => p.required && !(p.name in flags))
		.map((p) => `--${p.name}`);

	if (missing.length > 0) {
		throw new Error(
			`Missing required option${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`,
		);
	}

	// Commands that need at least one of a set of params
	const atLeastOneOf: Record<string, string[]> = {
		"fetch-project-info": ["project-id", "domain"],
	};

	const group = atLeastOneOf[commandName];
	if (group && !group.some((name) => name in flags)) {
		throw new Error(
			`At least one of ${group.map((n) => `--${n}`).join(" or ")} is required`,
		);
	}
}

const PAGINATED_COMMANDS = new Set([
	"list-projects",
	"list-backlink-resources",
	"fetch-project-backlinks",
]);

function isPaginatedCommand(name: string) {
	return PAGINATED_COMMANDS.has(name);
}

type PaginatedResult = {
	nextCursor?: string;
	[key: string]: unknown;
};

async function fetchAllPages(params: {
	commandName: string;
	flags: Record<string, string | boolean>;
	baseUrl?: string;
	credentials: StoredCredentials;
}): Promise<unknown> {
	const allItems: unknown[] = [];
	let cursor: string | undefined;
	let pages = 0;

	do {
		const flagsCopy = { ...params.flags };
		if (cursor) {
			flagsCopy.cursor = cursor;
		}
		delete flagsCopy.all;

		const input = await buildInput(params.commandName, flagsCopy);
		const result = (await invokeTool({
			commandName: params.commandName,
			input,
			baseUrl: params.baseUrl,
			credentials: params.credentials,
		})) as PaginatedResult | null;

		if (!result || typeof result !== "object") break;

		const arrayKey = Object.keys(result).find((k) =>
			Array.isArray(result[k]),
		);
		if (arrayKey) {
			allItems.push(...(result[arrayKey] as unknown[]));
		}

		cursor = result.nextCursor;
		pages += 1;

		if (pages > 100) break;
	} while (cursor);

	const listKey = getListKey(params.commandName);
	return { [listKey]: allItems, total: allItems.length };
}

function getListKey(commandName: string) {
	switch (commandName) {
		case "list-projects":
			return "projects";
		case "list-backlink-resources":
			return "resources";
		case "fetch-project-backlinks":
			return "backlinks";
		default:
			return "items";
	}
}

function printPaginationHint(commandName: string, result: unknown) {
	if (!isPaginatedCommand(commandName)) return;
	if (!result || typeof result !== "object") return;

	const r = result as PaginatedResult;
	const arrayKey = Object.keys(r).find((k) => Array.isArray(r[k]));
	if (!arrayKey) return;

	const items = r[arrayKey] as unknown[];
	const count = items.length;

	if (r.nextCursor) {
		process.stderr.write(
			`\nShowing ${count} items. More available — use --all to fetch everything, or --cursor "${r.nextCursor}" for the next page.\n`,
		);
	} else {
		process.stderr.write(`\nShowing all ${count} items.\n`);
	}
}

function renderHelp() {
	const w = process.stdout.write.bind(process.stdout);
	w("MyBacklinks CLI\n\n");
	w("Usage:\n");
	w("  mybacklinks <command> [options]\n\n");

	w("Global Options:\n");
	for (const p of getGlobalParams()) {
		const flag = `--${p.name}`;
		const def = p.defaultValue ? ` (default: ${p.defaultValue})` : "";
		w(`  ${flag.padEnd(16)} ${p.description}${def}\n`);
	}
	w("  --help".padEnd(18) + "Show help for a command\n");

	w("\nCommands:\n");
	for (const command of getCommandDefinitions()) {
		w(`  ${command.name.padEnd(26)} ${command.description}\n`);
	}

	w("\nRun `mybacklinks <command> --help` for detailed usage of any command.\n");
}

function renderCommandHelp(def: ReturnType<typeof getCommandDefinition>) {
	if (!def) return;
	const w = process.stdout.write.bind(process.stdout);

	w(`mybacklinks ${def.name}\n\n`);
	w(`${def.description}\n\n`);
	w("Usage:\n");
	w(`  mybacklinks ${def.name} [options]\n`);

	const allParams = [...(def.params ?? []), ...getGlobalParams()];
	if (allParams.length > 0) {
		w("\nOptions:\n");
		const maxLen = Math.max(...allParams.map((p) => p.name.length + 2));
		for (const p of allParams) {
			const flag = `--${p.name}`;
			const tag = p.required ? " (required)" : "";
			const typeTag = p.type !== "boolean" ? ` <${p.type}>` : "";
			const def_ = p.defaultValue ? `  [default: ${p.defaultValue}]` : "";
			w(`  ${(flag + typeTag).padEnd(maxLen + 12)} ${p.description}${tag}${def_}\n`);
		}
	}

	if (def.examples && def.examples.length > 0) {
		w("\nExamples:\n");
		for (const example of def.examples) {
			w(`  ${example}\n`);
		}
	}
}

await main().catch((error) => {
	process.stderr.write(
		`${error instanceof Error ? error.message : "Command failed."}\n`,
	);
	process.exitCode = 1;
});

const latestVersion = await updateCheck;
if (latestVersion) {
	performUpdate(latestVersion);
}
