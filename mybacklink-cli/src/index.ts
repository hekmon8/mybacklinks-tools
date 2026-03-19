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
} from "./command-registry.js";
import {
	type StoredCredentials,
	requireCredentials,
	saveCredentials,
} from "./credentials.js";
import { printOutput } from "./format.js";
import { invokeTool, validateCredentials } from "./http.js";
import { loginWithOAuth } from "./oauth.js";

async function main() {
	const parsed = parseArgv(process.argv.slice(2));
	const commandName = parsed.command;
	const json = getBooleanFlag(parsed.flags, "json");
	const baseUrl = getStringFlag(parsed.flags, "base-url");

	if (
		!commandName ||
		commandName === "help" ||
		getBooleanFlag(parsed.flags, "help")
	) {
		renderHelp();
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
			json,
		);
		return;
	}

	const definition = getCommandDefinition(commandName);
	if (!definition?.toolName) {
		throw new Error(`Unknown command: ${commandName}`);
	}

	const credentials = await requireCredentials();
	const input = await buildInput(commandName, parsed.flags);
	const result = await invokeTool({
		commandName,
		input,
		baseUrl,
		credentials,
	});

	printOutput(transformResult(commandName, result), json);
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
	if (
		commandName !== "fetch-dr-by-domain" &&
		commandName !== "fetch-traffic-by-domain"
	) {
		return result;
	}

	if (
		!result ||
		typeof result !== "object" ||
		!("metrics" in result) ||
		typeof result.metrics !== "object" ||
		!result.metrics
	) {
		return result;
	}

	const metrics = result.metrics as Record<string, unknown>;
	return commandName === "fetch-dr-by-domain"
		? {
				domain: (result as Record<string, unknown>).domain,
				dr: metrics.dr,
				creditCost: (result as Record<string, unknown>).creditCost,
				creditBalance: (result as Record<string, unknown>).creditBalance,
			}
		: {
				domain: (result as Record<string, unknown>).domain,
				traffic: metrics.traffic,
				creditCost: (result as Record<string, unknown>).creditCost,
				creditBalance: (result as Record<string, unknown>).creditBalance,
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

function renderHelp() {
	process.stdout.write("MyBacklinks CLI\n\n");
	process.stdout.write("Usage:\n");
	process.stdout.write("  mybacklinks <command> [options]\n\n");
	process.stdout.write("Global Options:\n");
	process.stdout.write("  --json       Output as JSON\n");
	process.stdout.write(
		"  --base-url   Override server URL (default: https://mybacklinks.app)\n\n",
	);
	process.stdout.write("Commands:\n");

	for (const command of getCommandDefinitions()) {
		process.stdout.write(
			`  ${command.name.padEnd(26)} ${command.description}\n`,
		);
	}

	process.stdout.write("\nExamples:\n");
	process.stdout.write("  mybacklinks login\n");
	process.stdout.write("  mybacklinks login --api-key mbk_xxxxx\n");
	process.stdout.write("  mybacklinks status\n");
	process.stdout.write(
		"  mybacklinks fetch-project-backlinks --project-id <id> --status indexed\n",
	);
	process.stdout.write(
		"  mybacklinks fetch-dr-by-domain --domain example.com\n",
	);
}

await main().catch((error) => {
	process.stderr.write(
		`${error instanceof Error ? error.message : "Command failed."}\n`,
	);
	process.exitCode = 1;
});
