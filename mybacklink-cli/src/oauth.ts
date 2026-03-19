import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { StoredCredentials } from "./credentials.js";
import { normalizeBaseUrl } from "./http.js";
import { CLIENT_ID, type TokenResponse, USER_AGENT } from "./shared.js";

const CALLBACK_PATH = "/oauth/callback";

export async function loginWithOAuth(params: {
	baseUrl?: string;
	port?: number;
}) {
	const baseUrl = normalizeBaseUrl(params.baseUrl);
	const state = randomBase64Url(24);
	const verifier = randomBase64Url(48);
	const challenge = toBase64Url(
		createHash("sha256").update(verifier).digest("base64"),
	);

	const callback = await waitForAuthorizationCode({
		baseUrl,
		state,
		verifier,
		challenge,
		requestedPort: params.port,
	});

	const tokenResponse = await fetch(`${baseUrl}/api/oauth/token`, {
		method: "POST",
		signal: AbortSignal.timeout(30_000),
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"user-agent": USER_AGENT,
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code: callback.code,
			redirect_uri: callback.redirectUri,
			code_verifier: verifier,
			client_id: CLIENT_ID,
		}),
	});

	const tokenPayload = (await tokenResponse.json()) as TokenResponse;
	if (!tokenResponse.ok || !tokenPayload.access_token) {
		throw new Error(tokenPayload.error_description || "OAuth 登录失败。");
	}

	const credentials: StoredCredentials = {
		version: 1,
		profile: "default",
		baseUrl,
		authMode: "oauth",
		clientId: CLIENT_ID,
		accessToken: tokenPayload.access_token,
		refreshToken: tokenPayload.refresh_token,
		accessTokenExpiresAt: new Date(
			Date.now() + tokenPayload.expires_in * 1000,
		).toISOString(),
		refreshTokenExpiresAt: new Date(
			Date.now() + tokenPayload.refresh_expires_in * 1000,
		).toISOString(),
		apiKey: tokenPayload.api_key,
		apiKeyPrefix: tokenPayload.api_key_prefix,
	};

	return credentials;
}

async function waitForAuthorizationCode(params: {
	baseUrl: string;
	state: string;
	verifier: string;
	challenge: string;
	requestedPort?: number;
}) {
	const { baseUrl, state, challenge, requestedPort } = params;

	return await new Promise<{ code: string; redirectUri: string }>(
		(resolve, reject) => {
			const timeout = setTimeout(
				() => {
					server.close();
					reject(new Error("等待 OAuth 回调超时，请重试。"));
				},
				5 * 60 * 1000,
			);

			const server = createServer((request, response) => {
				const callbackUrl = new URL(
					request.url || "/",
					"http://localhost",
				);
				if (callbackUrl.pathname !== CALLBACK_PATH) {
					response.writeHead(404);
					response.end("Not Found");
					return;
				}
				const code = callbackUrl.searchParams.get("code");
				const callbackState = callbackUrl.searchParams.get("state");

				if (!code || callbackState !== state) {
					response.writeHead(400, {
						"content-type": "text/html; charset=utf-8",
					});
					response.end(
						"<h1>MyBacklinks CLI</h1><p>授权失败，state 不匹配或 code 缺失。</p>",
					);
					return;
				}

				response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
				response.end(
					"<h1>MyBacklinks CLI</h1><p>登录完成，可以关闭这个窗口并返回终端。</p>",
				);

				clearTimeout(timeout);
				server.close();
				const address = server.address() as AddressInfo;
				resolve({
					code,
					redirectUri: `http://localhost:${address.port}${CALLBACK_PATH}`,
				});
			});

			server.listen(requestedPort ?? 0, "127.0.0.1", async () => {
				try {
					const address = server.address() as AddressInfo;
					const redirectUri = `http://localhost:${address.port}${CALLBACK_PATH}`;
					const authorizeUrl = new URL(`${baseUrl}/api/oauth/authorize`);
					authorizeUrl.searchParams.set("client_id", CLIENT_ID);
					authorizeUrl.searchParams.set("redirect_uri", redirectUri);
					authorizeUrl.searchParams.set("code_challenge", challenge);
					authorizeUrl.searchParams.set("code_challenge_method", "S256");
					authorizeUrl.searchParams.set("state", state);

					const opened = await openBrowser(authorizeUrl.toString());
					if (!opened) {
						process.stdout.write(
							`请在浏览器中打开以下地址完成登录：\n${authorizeUrl.toString()}\n`,
						);
					}
				} catch (error) {
					clearTimeout(timeout);
					server.close();
					reject(error);
				}
			});

			server.on("error", (error) => {
				clearTimeout(timeout);
				reject(error);
			});
		},
	);
}

async function openBrowser(url: string) {
	const command =
		process.platform === "darwin"
			? { cmd: "open", args: [url] }
			: process.platform === "win32"
				? { cmd: "cmd", args: ["/c", "start", "", url] }
				: { cmd: "xdg-open", args: [url] };

	return await new Promise<boolean>((resolve) => {
		const child = spawn(command.cmd, command.args, {
			stdio: "ignore",
			detached: true,
		});
		let settled = false;
		child.once("error", () => {
			settled = true;
			resolve(false);
		});
		child.once("spawn", () => {
			if (!settled) {
				resolve(true);
			}
		});
		child.unref();
	});
}

function randomBase64Url(size: number) {
	return toBase64Url(randomBytes(size).toString("base64"));
}

function toBase64Url(value: string) {
	return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
