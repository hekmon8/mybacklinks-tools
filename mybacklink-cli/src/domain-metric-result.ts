/** Preserve real zero estimates only when the provider confirms availability. */
export function transformDomainMetricResult(command: string, result: unknown) {
	const key = command === "fetch-traffic-by-domain" ? "traffic" : "dr";
	const r = result && typeof result === "object" ? result as Record<string, unknown> : {};
	const metrics = r.metrics && typeof r.metrics === "object"
		? r.metrics as Record<string, unknown> : {};
	const availability = r.availability && typeof r.availability === "object"
		? r.availability as Record<string, unknown> : {};
	const value = metrics[key];
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0 ||
		availability[key] === false || (key === "traffic" && value === 0 && availability.traffic !== true)) {
		throw new Error(`data_quality_error: ${key} is unavailable or unverified from the configured provider; no valid estimate was returned.`);
	}
	return { domain: r.domain, [key]: value, creditCost: r.creditCost, creditBalance: r.creditBalance };
}
