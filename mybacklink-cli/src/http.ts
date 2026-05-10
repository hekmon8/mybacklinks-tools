import { getCommandDefinition } from "./command-registry.js";
import { type StoredCredentials, saveCredentials } from "./credentials.js";
import {
	CLIENT_ID,
	DEFAULT_BASE_URL,
	type TokenResponse,
	USER_AGENT,
} from "./shared.js";

const DEFAULT_REQUEST_TIMEOUT_MS = 120_000;

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

	const response = await fetch(`${resolvedBaseUrl}${definition.toolPath}`, {
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

	const payload = (await response.json().catch(() => {
		throw new Error(`Server returned an unparseable response (status ${response.status})`);
	})) as ToolSuccessResponse & ToolErrorResponse;

	if (!response.ok) {
		throw new Error(formatToolErrorMessage(response.status, payload));
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
