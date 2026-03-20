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
		throw new Error(tokenPayload.error_description || "OAuth login failed.");
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
					reject(new Error("Timed out waiting for OAuth callback. Please try again."));
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
				response.end(callbackHtml(false));
				return;
			}

			response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
			response.end(callbackHtml(true));

				const address = server.address() as AddressInfo | null;
				clearTimeout(timeout);
				server.close();
				resolve({
					code,
					redirectUri: `http://localhost:${address?.port ?? requestedPort ?? 0}${CALLBACK_PATH}`,
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

					process.stderr.write("Opening browser for authentication...\n");
					const opened = await openBrowser(authorizeUrl.toString());
					if (!opened) {
						process.stderr.write(
							`Could not open browser. Please visit the following URL to log in:\n${authorizeUrl.toString()}\n`,
						);
					}
					process.stderr.write("Waiting for authorization...\n");
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

function callbackHtml(success: boolean) {
	const icon = success
		? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
		: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
	const title = success ? "Login Successful" : "Authorization Failed";
	const message = success
		? "You can close this window and return to the terminal."
		: "State mismatch or missing authorization code. Please try again.";
	const countdown = success
		? '<p class="countdown">This window will close in <span id="sec">5</span>s</p><script>let s=5;const e=document.getElementById("sec");const t=setInterval(()=>{s--;e.textContent=s;if(s<=0){clearInterval(t);window.close();}},1000);</script>'
		: "";

	return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MyBacklinks CLI – ${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f172a;color:#e2e8f0}
.card{text-align:center;padding:3rem 2.5rem;border-radius:1rem;background:linear-gradient(145deg,#1e293b,#0f172a);box-shadow:0 0 0 1px rgba(59,130,246,.15),0 20px 50px rgba(0,0,0,.4);max-width:420px;width:90%;animation:fadeUp .5s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.logo{width:56px;height:56px;margin:0 auto 1.25rem}
.brand{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:1.5rem}
.icon{width:48px;height:48px;margin-bottom:1rem;animation:pop .4s ease .2s both}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
h1{font-size:1.35rem;font-weight:600;margin-bottom:.5rem}
p{color:#94a3b8;font-size:.9rem;line-height:1.5}
.countdown{margin-top:1.25rem;font-size:.8rem;color:#64748b}
@media(prefers-color-scheme:light){
body{background:#f8fafc;color:#0f172a}
.card{background:linear-gradient(145deg,#fff,#f1f5f9);box-shadow:0 0 0 1px rgba(0,0,0,.06),0 20px 50px rgba(0,0,0,.08)}
.brand{color:#64748b}
p{color:#475569}
.countdown{color:#94a3b8}
}
</style></head><body><div class="card">
<svg class="logo" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient><linearGradient id="link" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="url(#bg)"/><g transform="translate(256,256) rotate(-45) translate(-256,-256)"><path d="M226 342H170C122.504 342 84 303.496 84 256C84 208.504 122.504 170 170 170H226" stroke="url(#link)" stroke-width="48" stroke-linecap="round" fill="none"/><path d="M286 170H342C389.496 170 428 208.504 428 256C428 303.496 389.496 342 342 342H286" stroke="url(#link)" stroke-width="48" stroke-linecap="round" fill="none"/><line x1="180" y1="256" x2="332" y2="256" stroke="url(#link)" stroke-width="48" stroke-linecap="round"/></g></svg>
<div class="brand">MyBacklinks CLI</div>
${icon}<h1>${title}</h1><p>${message}</p>${countdown}
</div></body></html>`;
}

function randomBase64Url(size: number) {
	return toBase64Url(randomBytes(size).toString("base64"));
}

function toBase64Url(value: string) {
	return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
