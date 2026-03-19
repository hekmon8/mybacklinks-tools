import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export type StoredCredentials =
	| {
			version: 1;
			profile: "default";
			baseUrl: string;
			authMode: "api_key";
			apiKey: string;
	  }
	| {
			version: 1;
			profile: "default";
			baseUrl: string;
			authMode: "oauth";
			clientId: string;
			accessToken: string;
			refreshToken: string;
			accessTokenExpiresAt: string;
			refreshTokenExpiresAt: string;
			apiKey?: string;
			apiKeyPrefix?: string;
	  };

export const credentialsPath = join(
	homedir(),
	".config",
	"mybacklinks",
	"credentials.json",
);

export async function loadCredentials(): Promise<StoredCredentials | null> {
	try {
		const content = await readFile(credentialsPath, "utf8");
		const parsed = JSON.parse(content);
		if (
			!parsed ||
			typeof parsed !== "object" ||
			parsed.version !== 1 ||
			!parsed.authMode
		) {
			return null;
		}
		return parsed as StoredCredentials;
	} catch {
		return null;
	}
}

export async function saveCredentials(credentials: StoredCredentials) {
	await mkdir(dirname(credentialsPath), { recursive: true, mode: 0o700 });
	await writeFile(
		credentialsPath,
		`${JSON.stringify(credentials, null, 2)}\n`,
		{ encoding: "utf8", mode: 0o600 },
	);
}

export async function requireCredentials() {
	const credentials = await loadCredentials();
	if (!credentials) {
		throw new Error(
			"No credentials found. Please run `mybacklinks login` or `mybacklinks login --api-key <key>` first.",
		);
	}

	return credentials;
}
