import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };

export const CLIENT_ID = "mcp-cli";
export const USER_AGENT = `@mybacklinks/cli/${packageJson.version}`;
export const DEFAULT_BASE_URL = "https://mybacklinks.app";

export type TokenResponse = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	refresh_expires_in: number;
	api_key?: string;
	api_key_prefix?: string;
	error_description?: string;
};
