export type ParsedArgv = {
	command?: string;
	positionals: string[];
	flags: Record<string, string | boolean>;
};

export function parseArgv(argv: string[]): ParsedArgv {
	const positionals: string[] = [];
	const flags: Record<string, string | boolean> = {};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];

		if (!token.startsWith("--")) {
			positionals.push(token);
			continue;
		}

		if (token.startsWith("--no-")) {
			flags[token.slice(5)] = false;
			continue;
		}

		const [rawKey, inlineValue] = token.slice(2).split("=", 2);
		if (inlineValue !== undefined) {
			flags[rawKey] = inlineValue;
			continue;
		}

		const next = argv[index + 1];
		if (next !== undefined && !next.startsWith("--")) {
			flags[rawKey] = next;
			index += 1;
			continue;
		}

		flags[rawKey] = true;
	}

	const [command, ...rest] = positionals;

	return {
		command,
		positionals: rest,
		flags,
	};
}

export function getStringFlag(
	flags: ParsedArgv["flags"],
	name: string,
): string | undefined {
	const value = flags[name];
	return typeof value === "string" ? value : undefined;
}

export function getBooleanFlag(
	flags: ParsedArgv["flags"],
	name: string,
): boolean {
	const value = flags[name];
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		return ["1", "true", "yes", "on"].includes(value.toLowerCase());
	}

	return false;
}

export function getNumberFlag(
	flags: ParsedArgv["flags"],
	name: string,
): number | undefined {
	const value = getStringFlag(flags, name);
	if (!value) {
		return undefined;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}
