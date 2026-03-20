import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };

const PACKAGE_NAME = "@mybacklinks/cli";
const NPM_REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;
const CHECK_TIMEOUT_MS = 5_000;

export function getCurrentVersion(): string {
	return packageJson.version;
}

/**
 * Fires a non-blocking npm registry lookup.
 * Returns the latest version string if an update is available, or null.
 */
export function startUpdateCheck(): Promise<string | null> {
	if (isRunningViaNpx()) return Promise.resolve(null);

	const current = getCurrentVersion();

	return fetch(NPM_REGISTRY_URL, {
		signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
		headers: { accept: "application/json" },
	})
		.then((res) => (res.ok ? (res.json() as Promise<{ version?: string }>) : null))
		.then((data) => {
			const latest = data?.version;
			if (latest && isNewerVersion(current, latest)) return latest;
			return null;
		})
		.catch(() => null);
}

export function performUpdate(latestVersion: string): void {
	const pm = detectPackageManager();
	const cmd =
		pm === "yarn"
			? `yarn global add ${PACKAGE_NAME}@${latestVersion}`
			: `${pm} install -g ${PACKAGE_NAME}@${latestVersion}`;

	process.stderr.write(
		`\n⬆ Updating ${PACKAGE_NAME} ${getCurrentVersion()} → ${latestVersion} (${pm})...\n`,
	);

	try {
		execSync(cmd, { stdio: "inherit" });
		process.stderr.write(`✓ Updated to v${latestVersion}.\n`);
	} catch {
		process.stderr.write(
			`✗ Auto-update failed. Run manually:\n  ${cmd}\n`,
		);
	}
}

// --- helpers ---

export function isNewerVersion(current: string, latest: string): boolean {
	const c = parseSemver(current);
	const l = parseSemver(latest);
	if (!c || !l) return false;

	if (l[0] !== c[0]) return l[0] > c[0];
	if (l[1] !== c[1]) return l[1] > c[1];
	return l[2] > c[2];
}

function parseSemver(v: string): [number, number, number] | null {
	const match = v.match(/^(\d+)\.(\d+)\.(\d+)/);
	if (!match) return null;
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function detectPackageManager(): "npm" | "pnpm" | "yarn" {
	const binPath = process.argv[1] ?? "";
	if (binPath.includes("pnpm") || binPath.includes(".pnpm")) return "pnpm";
	if (binPath.includes("yarn")) return "yarn";
	return "npm";
}

function isRunningViaNpx(): boolean {
	const execPath = process.argv[1] ?? "";
	return execPath.includes("_npx") || execPath.includes(".npm/_npx");
}
