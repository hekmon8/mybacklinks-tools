import { type StoredCredentials } from "./credentials.js";
import {
	type RateLimitRetryEvent,
	invokeToolWithRateLimitRetry,
} from "./rate-limit-retry.js";

const MAX_BATCH_ITEMS = 100;

type InvokeToolLike = Parameters<
	typeof invokeToolWithRateLimitRetry
>[0]["invoke"];

export type ProjectBacklinkBatchInput = {
	items: Record<string, unknown>[];
};

export type ProjectBacklinkBatchRetryEvent = RateLimitRetryEvent & {
	index: number;
};

export function isProjectBacklinkBatchInput(
	input: Record<string, unknown>,
): input is ProjectBacklinkBatchInput {
	return (
		Array.isArray(input.items) &&
		input.items.every((item) => isRecord(item))
	);
}

export async function invokeProjectBacklinkBatchUpdate(params: {
	input: ProjectBacklinkBatchInput;
	baseUrl?: string;
	credentials: StoredCredentials;
	invoke?: InvokeToolLike;
	sleep?: (ms: number) => Promise<void>;
	onRetry?: (event: ProjectBacklinkBatchRetryEvent) => void;
}) {
	if (params.input.items.length === 0) {
		throw new Error("At least one backlink update is required");
	}
	if (params.input.items.length > MAX_BATCH_ITEMS) {
		throw new Error("Cannot update more than 100 backlinks at once");
	}

	const results: unknown[] = [];
	const errors: { index: number; error: string }[] = [];
	let rateLimitRetries = 0;
	let retryWaitMs = 0;

	for (let index = 0; index < params.input.items.length; index += 1) {
		try {
			const result = await invokeToolWithRateLimitRetry({
				commandName: "update-project-backlinks",
				input: params.input.items[index],
				baseUrl: params.baseUrl,
				credentials: params.credentials,
				invoke: params.invoke,
				sleep: params.sleep,
				onRetry: (event) => {
					rateLimitRetries += 1;
					retryWaitMs += event.delayMs;
					params.onRetry?.({ ...event, index });
				},
			});
			results.push(result);
		} catch (error) {
			errors.push({
				index,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	return {
		updated: results.length,
		failed: errors.length,
		results,
		...(errors.length > 0 && { errors }),
		trackingWriteback: {
			attempted: params.input.items.length,
			succeeded: results.length,
			failed: errors.length,
			rateLimitRetries,
			retryWaitMs,
		},
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
