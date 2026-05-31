import { type StoredCredentials } from "./credentials.js";
import { ToolRequestError, invokeTool } from "./http.js";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 65_000;

export type RateLimitRetryEvent = {
	commandName: string;
	attempt: number;
	maxRetries: number;
	delayMs: number;
	error: ToolRequestError;
};

type InvokeToolLike = typeof invokeTool;

export async function invokeToolWithRateLimitRetry(params: {
	commandName: string;
	input: Record<string, unknown>;
	baseUrl?: string;
	credentials: StoredCredentials;
	invoke?: InvokeToolLike;
	sleep?: (ms: number) => Promise<void>;
	onRetry?: (event: RateLimitRetryEvent) => void;
	maxRetries?: number;
}) {
	const invoke = params.invoke ?? invokeTool;
	const sleep = params.sleep ?? sleepMs;
	const maxRetries = params.maxRetries ?? DEFAULT_MAX_RETRIES;
	let attempt = 0;

	while (true) {
		try {
			return await invoke({
				commandName: params.commandName,
				input: params.input,
				baseUrl: params.baseUrl,
				credentials: params.credentials,
			});
		} catch (error) {
			if (!isWriteRateLimitError(error) || attempt >= maxRetries) {
				throw error;
			}

			attempt += 1;
			const delayMs = getRetryDelayMs(error);
			params.onRetry?.({
				commandName: params.commandName,
				attempt,
				maxRetries,
				delayMs,
				error,
			});
			await sleep(delayMs);
		}
	}
}

function isWriteRateLimitError(error: unknown): error is ToolRequestError {
	return (
		error instanceof ToolRequestError &&
		error.status === 429 &&
		(error.code === "too_many_requests" ||
			error.message.includes("Write rate limit exceeded"))
	);
}

function getRetryDelayMs(error: ToolRequestError) {
	const retryAfter = getRetryAfterSeconds(error.details);
	if (retryAfter !== undefined) {
		return Math.min(Math.max(retryAfter * 1_000, 0), MAX_RETRY_DELAY_MS);
	}

	return DEFAULT_RETRY_DELAY_MS;
}

function getRetryAfterSeconds(details: unknown) {
	if (!details || typeof details !== "object") {
		return undefined;
	}

	const retryAfter = (details as Record<string, unknown>).retryAfter;
	return typeof retryAfter === "number" && Number.isFinite(retryAfter)
		? retryAfter
		: undefined;
}

async function sleepMs(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}
