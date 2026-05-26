import { readFile } from "node:fs/promises";

type ResourceFileRow = Record<string, unknown>;

const FIELD_ALIASES: Record<string, string> = {
	"submission-url": "submissionUrl",
	submission_url: "submissionUrl",
	"payment-type": "paymentType",
	payment_type: "paymentType",
	"submission-method": "submissionMethod",
	submission_method: "submissionMethod",
	"how-to-submit": "howToSubmit",
	how_to_submit: "howToSubmit",
};

export async function buildResourceFileInput(file: string) {
	const content = await readFile(file, "utf8");
	const items = parseResourceFileContent(content, file);
	if (items.length === 0) {
		throw new Error("--file must contain at least one resource item.");
	}

	return { items };
}

export function parseResourceFileContent(content: string, fileName = "") {
	const trimmed = content.trim();
	if (!trimmed) return [];

	const rawItems = shouldParseCsv(trimmed, fileName)
		? parseCsv(trimmed)
		: parseJsonItems(trimmed);

	return rawItems.map(normalizeResourceRow);
}

function shouldParseCsv(content: string, fileName: string) {
	return fileName.toLowerCase().endsWith(".csv") && !content.startsWith("{");
}

function parseJsonItems(content: string): ResourceFileRow[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error("--file must be valid JSON or a CSV file.");
	}

	if (Array.isArray(parsed)) {
		return parsed.filter(isRecord);
	}

	if (isRecord(parsed)) {
		if (Array.isArray(parsed.items)) return parsed.items.filter(isRecord);
		if (Array.isArray(parsed.resources)) return parsed.resources.filter(isRecord);
		return [parsed];
	}

	throw new Error("--file must contain a JSON object, JSON array, or CSV rows.");
}

function normalizeResourceRow(row: ResourceFileRow) {
	const normalized: ResourceFileRow = {};
	for (const [key, value] of Object.entries(row)) {
		const normalizedKey = FIELD_ALIASES[key] ?? key;
		normalized[normalizedKey] = normalizeValue(value);
	}

	return compactObject({
		domain: stringValue(normalized.domain),
		type: stringValue(normalized.type),
		submissionUrl: stringValue(normalized.submissionUrl),
		paymentType: stringValue(normalized.paymentType),
		submissionMethod: stringValue(normalized.submissionMethod),
		howToSubmit: stringValue(normalized.howToSubmit),
		dr: numberValue(normalized.dr),
		traffic: numberValue(normalized.traffic),
		notes: stringValue(normalized.notes),
	});
}

function parseCsv(content: string): ResourceFileRow[] {
	const lines = content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	if (lines.length < 2) return [];

	const headers = parseCsvLine(lines[0]).map((header) => header.trim());
	return lines.slice(1).map((line) => {
		const values = parseCsvLine(line);
		return Object.fromEntries(
			headers.map((header, index) => [header, values[index] ?? ""]),
		);
	});
}

function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const next = line[index + 1];

		if (char === '"' && inQuotes && next === '"') {
			current += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			values.push(current);
			current = "";
			continue;
		}

		current += char;
	}

	values.push(current);
	return values.map((value) => value.trim());
}

function normalizeValue(value: unknown) {
	return typeof value === "string" ? value.trim() : value;
}

function stringValue(value: unknown) {
	if (typeof value !== "string") return undefined;
	return value.length > 0 ? value : undefined;
}

function numberValue(value: unknown) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value !== "string" || value.length === 0) return undefined;

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => item !== undefined),
	);
}

function isRecord(value: unknown): value is ResourceFileRow {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
