function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown) {
	return (
		["string", "number", "boolean"].includes(typeof value) || value === null
	);
}

export function printOutput(data: unknown, asJson: boolean) {
	if (asJson) {
		process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
		return;
	}

	process.stdout.write(formatMarkdown(data));
}

function formatMarkdown(data: unknown, depth = 0): string {
	if (isPrimitive(data)) {
		return `${String(data)}\n`;
	}

	if (Array.isArray(data)) {
		return formatArray(data);
	}

	if (!isPlainObject(data)) {
		return `${String(data)}\n`;
	}

	return formatObject(data, depth);
}

function formatObject(obj: Record<string, unknown>, depth: number): string {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (isPrimitive(value)) {
			lines.push(`- **${key}**: ${formatValue(value)}`);
		} else if (Array.isArray(value)) {
			if (depth === 0) {
				lines.push("");
				lines.push(`### ${key}`);
				lines.push("");
			} else {
				lines.push(`- **${key}**:`);
			}
			lines.push(formatArray(value).trimEnd());
		} else if (isPlainObject(value)) {
			if (depth === 0) {
				lines.push("");
				lines.push(`### ${key}`);
				lines.push("");
			} else {
				lines.push(`- **${key}**:`);
			}
			const nested = formatObject(value, depth + 1);
			if (depth > 0) {
				lines.push(
					...nested
						.split("\n")
						.filter((l) => l.length > 0)
						.map((l) => `  ${l}`),
				);
			} else {
				lines.push(nested.trimEnd());
			}
		} else {
			lines.push(`- **${key}**: ${String(value)}`);
		}
	}

	return `${lines.join("\n")}\n`;
}

function formatValue(value: unknown): string {
	if (value === null) return "–";
	if (typeof value === "boolean") return value ? "yes" : "no";
	if (typeof value === "number" && Number.isFinite(value)) {
		return value.toLocaleString("en-US");
	}
	return String(value);
}

function formatArray(arr: unknown[]): string {
	if (arr.length === 0) {
		return "_No items_\n";
	}

	if (arr.every(isPrimitive)) {
		return arr.map((item) => `- ${formatValue(item)}`).join("\n") + "\n";
	}

	if (!arr.every(isPlainObject)) {
		return arr.map((item) => `- ${JSON.stringify(item)}`).join("\n") + "\n";
	}

	const objects = arr as Record<string, unknown>[];
	const columns = collectColumns(objects);

	if (columns.length === 0) {
		return "_No items_\n";
	}

	const header = `| ${columns.join(" | ")} |`;
	const separator = `| ${columns.map(() => "---").join(" | ")} |`;
	const rows = objects.map(
		(row) =>
			`| ${columns.map((col) => formatCell(row[col])).join(" | ")} |`,
	);

	return [header, separator, ...rows].join("\n") + "\n";
}

function collectColumns(objects: Record<string, unknown>[]): string[] {
	const seen = new Set<string>();
	for (const obj of objects) {
		for (const key of Object.keys(obj)) {
			seen.add(key);
		}
	}
	return [...seen];
}

function formatCell(value: unknown): string {
	if (value === undefined || value === null) return "–";
	if (typeof value === "boolean") return value ? "yes" : "no";
	if (typeof value === "object") {
		const json = JSON.stringify(value);
		return json.length > 60 ? `${json.slice(0, 57)}...` : json;
	}
	const str = String(value);
	return str.includes("|") ? str.replace(/\|/g, "\\|") : str;
}
