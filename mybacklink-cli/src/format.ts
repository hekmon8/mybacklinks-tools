function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(value: unknown) {
	return (
		["string", "number", "boolean"].includes(typeof value) || value === null
	);
}

export type OutputFormat = "json" | "md" | "csv";

const MAX_TABLE_CELL_WIDTH = 80;

function isEnabledFlag(value: string | boolean | undefined) {
	if (value === true) {
		return true;
	}

	if (typeof value === "string") {
		return ["1", "true", "yes", "on"].includes(value.toLowerCase());
	}

	return false;
}

export function resolveOutputFormat(
	flags: Record<string, string | boolean>,
): OutputFormat {
	const enabled = ["json", "md", "csv"].filter((name) =>
		isEnabledFlag(flags[name]),
	);
	if (enabled.length > 1) {
		throw new Error("Options --json, --md, and --csv cannot be used together.");
	}

	if (isEnabledFlag(flags.csv)) return "csv";
	return isEnabledFlag(flags.md) ? "md" : "json";
}

export function renderOutput(data: unknown, format: OutputFormat): string {
	if (format === "json") {
		return `${JSON.stringify(data, null, 2)}\n`;
	}

	if (format === "csv") {
		return formatCsv(data);
	}

	return formatMarkdown(data);
}

export function printOutput(data: unknown, format: OutputFormat) {
	process.stdout.write(renderOutput(data, format));
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

	const formattedRows = objects.map((row) =>
		columns.map((col) => formatCell(row[col])),
	);
	const widths = columns.map((column, index) =>
		Math.max(
			column.length,
			3,
			...formattedRows.map((row) => visibleLength(row[index] ?? "")),
		),
	);

	const header = `| ${columns
		.map((column, index) => padCell(column, widths[index]))
		.join(" | ")} |`;
	const separator = `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;
	const rows = formattedRows.map(
		(row) =>
			`| ${row
				.map((cell, index) => padCell(cell, widths[index]))
				.join(" | ")} |`,
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
		return truncateCell(json);
	}
	const str = String(value);
	return truncateCell(str).replace(/\|/g, "\\|");
}

function truncateCell(value: string): string {
	if (value.length <= MAX_TABLE_CELL_WIDTH) return value;
	return `${value.slice(0, MAX_TABLE_CELL_WIDTH - 3)}...`;
}

function visibleLength(value: string): number {
	return value.replace(/\\\|/g, "|").length;
}

function padCell(value: string, width: number): string {
	const padding = Math.max(0, width - visibleLength(value));
	return `${value}${" ".repeat(padding)}`;
}

function formatCsv(data: unknown): string {
	const rows = extractRows(data);
	if (rows.length === 0) return "";

	const columns = collectColumns(rows);
	const lines = [
		columns.map(escapeCsvValue).join(","),
		...rows.map((row) =>
			columns.map((column) => escapeCsvValue(row[column])).join(","),
		),
	];

	return `${lines.join("\n")}\n`;
}

function extractRows(data: unknown): Record<string, unknown>[] {
	if (Array.isArray(data)) {
		return data.filter(isPlainObject);
	}

	if (!isPlainObject(data)) {
		return [];
	}

	const arrayValue = Object.values(data).find(
		(value): value is Record<string, unknown>[] =>
			Array.isArray(value) && value.every(isPlainObject),
	);

	if (arrayValue) {
		return arrayValue;
	}

	return [data];
}

function escapeCsvValue(value: unknown): string {
	if (value === undefined || value === null) return "";
	const raw = isPrimitive(value) ? String(value) : JSON.stringify(value);
	const needsQuoting = /[",\n\r]/.test(raw);
	const escaped = raw.replace(/"/g, '""');
	return needsQuoting ? `"${escaped}"` : escaped;
}
