import { getCommandDefinition } from "./command-registry.js";
import { type StoredCredentials, saveCredentials } from "./credentials.js";
import {
	CLIENT_ID,
	DEFAULT_BASE_URL,
	type TokenResponse,
	USER_AGENT,
} from "./shared.js";

const DEFAULT_REQUEST_TIMEOUT_MS = 120_000;
const RETRYABLE_NETWORK_CODES = new Set([
	"ECONNRESET",
	"ETIMEDOUT",
	"EAI_AGAIN",
	"UND_ERR_CONNECT_TIMEOUT",
	"UND_ERR_HEADERS_TIMEOUT",
	"UND_ERR_BODY_TIMEOUT",
	"UND_ERR_SOCKET",
]);

type ToolSuccessResponse = {
	requestId: string;
	data: unknown;
};

type ToolErrorResponse = {
	requestId?: string;
	error?: {
		code?: string;
		message?: string;
		details?: unknown;
	};
};

export class ToolRequestError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly details?: unknown;
	readonly requestId?: string;

	constructor(params: { status: number; payload: ToolErrorResponse }) {
		super(formatToolErrorMessage(params.status, params.payload));
		this.name = "ToolRequestError";
		this.status = params.status;
		this.code = params.payload.error?.code;
		this.details = params.payload.error?.details;
		this.requestId = params.payload.requestId;
	}
}

export type NetworkErrorCauseSummary = {
	name?: string;
	message?: string;
	code?: string;
	errno?: string | number;
	syscall?: string;
	address?: string;
	port?: string | number;
};

export class NetworkRequestError extends Error {
	readonly commandName: string;
	readonly baseUrl: string;
	readonly path: string;
	readonly timeoutMs: number;
	readonly retryable: boolean;
	readonly causeSummary: NetworkErrorCauseSummary;

	constructor(params: {
		commandName: string;
		baseUrl: string;
		path: string;
		timeoutMs: number;
		cause: unknown;
	}) {
		const causeSummary = summarizeNetworkCause(params.cause);
		const retryable = isLikelyRetryableNetworkFailure(causeSummary);
		super(
			formatNetworkRequestErrorMessage({
				...params,
				causeSummary,
				retryable,
			}),
		);
		this.name = "NetworkRequestError";
		this.commandName = params.commandName;
		this.baseUrl = params.baseUrl;
		this.path = params.path;
		this.timeoutMs = params.timeoutMs;
		this.retryable = retryable;
		this.causeSummary = causeSummary;
		this.cause = params.cause;
	}
}

export function normalizeBaseUrl(baseUrl?: string) {
	return (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export async function validateCredentials(
	credentials: StoredCredentials,
	baseUrl?: string,
) {
	await invokeTool({
		commandName: "status",
		input: {},
		baseUrl,
		credentials,
	});
}

export async function invokeTool(params: {
	commandName: string;
	input: Record<string, unknown>;
	baseUrl?: string;
	credentials: StoredCredentials;
}) {
	const definition = getCommandDefinition(params.commandName);
	if (!definition?.toolPath) {
		throw new Error(`Unknown command: ${params.commandName}`);
	}

	const resolvedBaseUrl = normalizeBaseUrl(
		params.baseUrl || params.credentials.baseUrl,
	);
	const credentials = await ensureFreshCredentials(
		params.credentials,
		resolvedBaseUrl,
	);

	let response: Response;
	try {
		response = await fetch(`${resolvedBaseUrl}${definition.toolPath}`, {
			method: "POST",
			signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${getBearerToken(credentials)}`,
				"user-agent": USER_AGENT,
				"x-mybacklinks-cli-command": params.commandName,
				"x-mybacklinks-auth-mode": credentials.authMode,
			},
			body: JSON.stringify(params.input),
		});
	} catch (error) {
		throw new NetworkRequestError({
			commandName: params.commandName,
			baseUrl: resolvedBaseUrl,
			path: definition.toolPath,
			timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
			cause: error,
		});
	}

	const payload = (await response.json().catch(() => {
		throw new Error(`Server returned an unparseable response (status ${response.status})`);
	})) as ToolSuccessResponse & ToolErrorResponse;

	if (!response.ok) {
		throw new ToolRequestError({ status: response.status, payload });
	}

	return payload.data;
}

export function formatToolErrorMessage(
	status: number,
	payload: ToolErrorResponse,
) {
	const base = payload.error?.message || `Command failed (status ${status}).`;
	const details = formatValidationDetails(payload.error?.details);
	return details ? `${base}: ${details}` : base;
}

function formatValidationDetails(details: unknown) {
	if (!details || typeof details !== "object") {
		return undefined;
	}

	const record = details as Record<string, unknown>;
	const fieldErrors = record.fieldErrors;
	const parts: string[] = [];

	if (fieldErrors && typeof fieldErrors === "object") {
		for (const [field, messages] of Object.entries(
			fieldErrors as Record<string, unknown>,
		)) {
			if (!Array.isArray(messages) || messages.length === 0) {
				continue;
			}
			parts.push(`${field}: ${messages.join(", ")}`);
		}
	}

	if (Array.isArray(record.formErrors) && record.formErrors.length > 0) {
		parts.push(record.formErrors.join(", "));
	}

	return parts.length > 0 ? parts.join("; ") : undefined;
}

function formatNetworkRequestErrorMessage(params: {
	commandName: string;
	baseUrl: string;
	path: string;
	timeoutMs: number;
	causeSummary: NetworkErrorCauseSummary;
	retryable: boolean;
}) {
	const cause = formatNetworkCauseSummary(params.causeSummary);
	const retry = params.retryable ? "yes" : "no";
	return [
		`Network request failed while running ${params.commandName}.`,
		`baseUrl: ${params.baseUrl}`,
		`path: ${params.path}`,
		`timeoutMs: ${params.timeoutMs}`,
		`retryable: ${retry}`,
		cause ? `cause: ${cause}` : undefined,
	]
		.filter(Boolean)
		.join("\n");
}

function summarizeNetworkCause(error: unknown): NetworkErrorCauseSummary {
	const cause = getNestedCause(error) ?? error;
	const record = isErrorLike(cause) ? cause : undefined;
	const topRecord = isErrorLike(error) ? error : undefined;

	return compactObject({
		name: getStringProperty(record, "name") ?? getStringProperty(topRecord, "name"),
		message:
			getStringProperty(record, "message") ??
			getStringProperty(topRecord, "message"),
		code: getStringProperty(record, "code") ?? getStringProperty(topRecord, "code"),
		errno:
			getStringOrNumberProperty(record, "errno") ??
			getStringOrNumberProperty(topRecord, "errno"),
		syscall:
			getStringProperty(record, "syscall") ??
			getStringProperty(topRecord, "syscall"),
		address:
			getStringProperty(record, "address") ??
			getStringProperty(topRecord, "address"),
		port:
			getStringOrNumberProperty(record, "port") ??
			getStringOrNumberProperty(topRecord, "port"),
	});
}

function getNestedCause(error: unknown) {
	if (!error || typeof error !== "object" || !("cause" in error)) {
		return undefined;
	}

	return (error as { cause?: unknown }).cause;
}

function isLikelyRetryableNetworkFailure(cause: NetworkErrorCauseSummary) {
	if (cause.code && RETRYABLE_NETWORK_CODES.has(cause.code)) {
		return true;
	}

	return cause.name === "TimeoutError" || cause.name === "AbortError";
}

function formatNetworkCauseSummary(cause: NetworkErrorCauseSummary) {
	const parts = [
		cause.code,
		cause.name,
		cause.message,
		cause.syscall,
		cause.address,
		cause.port === undefined ? undefined : String(cause.port),
	].filter(Boolean);

	return [...new Set(parts)].join(" ");
}

function isErrorLike(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getStringProperty(
	value: Record<string, unknown> | undefined,
	key: string,
) {
	const item = value?.[key];
	return typeof item === "string" && item.length > 0 ? item : undefined;
}

function getStringOrNumberProperty(
	value: Record<string, unknown> | undefined,
	key: string,
) {
	const item = value?.[key];
	return typeof item === "string" || typeof item === "number" ? item : undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => item !== undefined),
	) as Partial<T>;
}

async function ensureFreshCredentials(
	credentials: StoredCredentials,
	baseUrl: string,
) {
	if (credentials.authMode !== "oauth") {
		return credentials;
	}

	const refreshExpiresAt = new Date(
		credentials.refreshTokenExpiresAt,
	).getTime();
	if (refreshExpiresAt <= Date.now()) {
		throw new Error(
			"OAuth refresh token has expired. Please run `mybacklinks login` again.",
		);
	}

	const expiresAt = new Date(credentials.accessTokenExpiresAt).getTime();
	if (expiresAt > Date.now() + 60_000) {
		return credentials;
	}

	const response = await fetch(`${baseUrl}/api/oauth/token`, {
		method: "POST",
		signal: AbortSignal.timeout(30_000),
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"user-agent": USER_AGENT,
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: credentials.refreshToken,
			client_id: credentials.clientId || CLIENT_ID,
		}),
	});

	const payload = (await response.json()) as
		| TokenResponse
		| { error_description?: string };

	if (!response.ok || !("access_token" in payload)) {
		throw new Error(
			getOAuthErrorDescription(payload) ||
				"OAuth token refresh failed. Please run `mybacklinks login` again.",
		);
	}

	const refreshed: StoredCredentials = {
		...credentials,
		clientId: credentials.clientId || CLIENT_ID,
		accessToken: payload.access_token,
		refreshToken: payload.refresh_token,
		accessTokenExpiresAt: new Date(
			Date.now() + payload.expires_in * 1000,
		).toISOString(),
		refreshTokenExpiresAt: new Date(
			Date.now() + payload.refresh_expires_in * 1000,
		).toISOString(),
		apiKey: payload.api_key,
		apiKeyPrefix: payload.api_key_prefix,
	};

	await saveCredentials(refreshed);
	return refreshed;
}

function getBearerToken(credentials: StoredCredentials) {
	if (credentials.authMode === "api_key") {
		return credentials.apiKey;
	}

	return credentials.accessToken;
}

function getOAuthErrorDescription(payload: unknown) {
	if (
		payload &&
		typeof payload === "object" &&
		"error_description" in payload &&
		typeof payload.error_description === "string"
	) {
		return payload.error_description;
	}

	return undefined;
}
