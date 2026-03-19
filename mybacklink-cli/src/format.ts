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

	if (Array.isArray(data)) {
		console.table(data);
		return;
	}

	if (!isPlainObject(data)) {
		process.stdout.write(`${String(data)}\n`);
		return;
	}

	const scalarEntries = Object.entries(data).filter(([, value]) =>
		isPrimitive(value),
	);

	if (scalarEntries.length > 0) {
		for (const [key, value] of scalarEntries) {
			process.stdout.write(`${key}: ${String(value)}\n`);
		}
	}

	for (const [key, value] of Object.entries(data)) {
		if (isPrimitive(value)) {
			continue;
		}

		process.stdout.write(`\n${key}:\n`);

		if (Array.isArray(value)) {
			console.table(value);
			continue;
		}

		if (isPlainObject(value)) {
			const nestedScalarEntries = Object.entries(value).filter(([, nested]) =>
				isPrimitive(nested),
			);
			if (nestedScalarEntries.length > 0) {
				for (const [nestedKey, nestedValue] of nestedScalarEntries) {
					process.stdout.write(`  ${nestedKey}: ${String(nestedValue)}\n`);
				}
			} else {
				process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
			}
			continue;
		}

		process.stdout.write(`${String(value)}\n`);
	}
}
