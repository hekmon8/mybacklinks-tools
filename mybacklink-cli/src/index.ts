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

		await validateCredentials(credentials, baseUrl);
		await saveCredentials(credentials);

		printOutput(
			{
				message:
					credentials.authMode === "api_key"
						? "API Key 登录成功"
						: "OAuth 登录成功",
				authMode: credentials.authMode,
				baseUrl: credentials.baseUrl,
			},
			json,
		);
		return;
	}

	const definition = getCommandDefinition(commandName);
	if (!definition?.toolName) {
		throw new Error(`未知命令: ${commandName}`);
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
					"请至少提供一个待更新字段，例如 `--name` 或 `--status`。",
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
			throw new Error(`命令尚未实现: ${commandName}`);
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
			throw new Error(`--file "${file}" 不是有效的 JSON 文件。`);
		}
		if (Array.isArray(parsed)) {
			return { items: parsed };
		}
		if (isRecord(parsed)) {
			if (!parsed.projectId && !Array.isArray(parsed.items)) {
				throw new Error(
					"`--file` JSON 对象需要包含 `projectId` 或 `items` 字段。",
				);
			}
			return parsed;
		}
		throw new Error("`--file` 必须是 JSON 对象或 JSON 数组。");
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
		throw new Error(`缺少必填参数 --${name}`);
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
	process.stdout.write("用法:\n");
	process.stdout.write("  mybacklinks <command> [options]\n\n");
	process.stdout.write("全局参数:\n");
	process.stdout.write("  --json       输出 JSON\n");
	process.stdout.write(
		"  --base-url   覆盖服务端地址，默认 https://mybacklinks.app\n\n",
	);
	process.stdout.write("命令:\n");

	for (const command of getCommandDefinitions()) {
		process.stdout.write(
			`  ${command.name.padEnd(26)} ${command.description}\n`,
		);
	}

	process.stdout.write("\n示例:\n");
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
		`${error instanceof Error ? error.message : "命令执行失败。"}\n`,
	);
	process.exitCode = 1;
});
