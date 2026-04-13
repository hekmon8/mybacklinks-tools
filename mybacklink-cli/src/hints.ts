const DOMAIN_BACKLINKS_MAX_LIMIT = 500;

export function getCommandResultHint(
	commandName: string,
	result: unknown,
): string | null {
	if (commandName === "fetch-backlinks-by-domain") {
		return getDomainBacklinksHint(result);
	}

	return null;
}

function getDomainBacklinksHint(result: unknown): string | null {
	if (!isRecord(result)) return null;

	const summary = isRecord(result.summary) ? result.summary : null;
	if (!summary || summary.hasMore !== true) return null;

	const totalCount = getFiniteNumber(summary.totalCount);
	const returnedCount = getFiniteNumber(summary.returnedCount);
	const domain = typeof result.domain === "string" ? result.domain : null;
	const pagination = isRecord(result.pagination) ? result.pagination : {};
	const nextOffset = getFiniteNumber(pagination.nextOffset);
	const currentOffset = getFiniteNumber(pagination.offset) ?? 0;
	const currentLimit = getFiniteNumber(pagination.limit);

	if (!domain) {
		return "More backlinks are available. Re-run with a higher --limit value, up to 500.";
	}

	const suggestedLimit =
		currentLimit ??
		(totalCount && totalCount > 0
			? Math.min(totalCount, DOMAIN_BACKLINKS_MAX_LIMIT)
			: DOMAIN_BACKLINKS_MAX_LIMIT);
	const command = buildDomainBacklinksCommand({
		domain,
		limit: suggestedLimit,
		offset:
			nextOffset !== null && totalCount && totalCount > DOMAIN_BACKLINKS_MAX_LIMIT
				? nextOffset
				: undefined,
		filters: isRecord(result.filters) ? result.filters : {},
	});
	const allCommand = buildDomainBacklinksCommand({
		domain,
		limit: Math.min(suggestedLimit, DOMAIN_BACKLINKS_MAX_LIMIT),
		offset: currentOffset > 0 ? currentOffset : undefined,
		all: true,
		filters: isRecord(result.filters) ? result.filters : {},
	});
	const countText =
		totalCount && returnedCount
			? `Showing ${returnedCount} of ${totalCount} backlinks.`
			: "More backlinks are available.";
	const capText =
		totalCount && totalCount > DOMAIN_BACKLINKS_MAX_LIMIT
			? " Current command can return up to 500 backlinks per request."
			: "";
	const allText = ` Or run \`${allCommand}\` to fetch all pages.`;

	return `${countText}${capText} Run \`${command}\` to fetch more.${allText}`;
}

function buildDomainBacklinksCommand(params: {
	domain: string;
	limit: number;
	offset?: number;
	all?: boolean;
	filters: Record<string, unknown>;
}) {
	const parts = [
		"mybacklinks",
		"fetch-backlinks-by-domain",
		"--domain",
		formatShellArg(params.domain),
	];

	if (params.filters.mode === "url") {
		parts.push("--mode", "url");
	}
	if (params.filters.dofollow === true) {
		parts.push("--dofollow");
	}
	const minDR = getFiniteNumber(params.filters.minDR);
	if (minDR !== null) {
		parts.push("--min-dr", String(minDR));
	}
	if (
		typeof params.filters.anchorText === "string" &&
		params.filters.anchorText
	) {
		parts.push("--anchor-text", formatShellArg(params.filters.anchorText));
	}

	if (params.all) {
		parts.push("--all");
	}
	if (typeof params.offset === "number") {
		parts.push("--offset", String(params.offset));
	}
	parts.push("--limit", String(params.limit));
	return parts.join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getFiniteNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatShellArg(value: string) {
	if (/^[a-zA-Z0-9._:/-]+$/.test(value)) {
		return value;
	}

	return JSON.stringify(value);
}
