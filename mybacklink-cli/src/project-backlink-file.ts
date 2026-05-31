export function normalizeProjectBacklinkFileInput(parsed: unknown) {
	if (Array.isArray(parsed)) {
		return { items: parsed };
	}

	if (!isRecord(parsed)) {
		throw new Error("--file must be a JSON object or JSON array.");
	}

	const projectId = getStringValue(parsed.projectId);
	if (Array.isArray(parsed.items)) {
		return {
			items: parsed.items.map((item) =>
				projectId && isRecord(item) && !item.projectId
					? { ...item, projectId }
					: item,
			),
		};
	}

	if (!projectId) {
		throw new Error(
			"--file JSON object must contain a `projectId` or `items` field.",
		);
	}

	return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringValue(value: unknown) {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}
