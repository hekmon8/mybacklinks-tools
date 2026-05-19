import {
	getBooleanFlag,
	getStringFlag,
	type ParsedArgv,
} from "./argv.js";

type Flags = ParsedArgv["flags"];

export function buildCreateProjectInput(flags: Flags) {
	return compactObject({
		name: requiredString(flags, "name"),
		url: requiredString(flags, "url"),
		type: requiredString(flags, "type"),
		description: getStringFlag(flags, "description"),
		icon: getStringFlag(flags, "icon"),
		contactEmails: getStringListFlag(flags, [
			"contact-emails",
			"contact-email",
		]),
		longDescriptions: getStringListFlag(flags, [
			"long-descriptions",
			"long-description",
		]),
		commentTemplates: getStringListFlag(flags, [
			"comment-templates",
			"comment-template",
		]),
		socialUrls: getStringListFlag(flags, ["social-urls", "social-url"]),
		sitemapUrl: getStringFlag(flags, "sitemap-url"),
		llmsTxtUrl: getStringFlag(flags, "llms-txt-url"),
		robotsTxtUrl: getStringFlag(flags, "robots-txt-url"),
		status: getStringFlag(flags, "status"),
		groupName: getStringFlag(flags, "group-name"),
		pinned: "pinned" in flags ? getBooleanFlag(flags, "pinned") : undefined,
	});
}

function requiredString(flags: Flags, name: string) {
	const value = getStringFlag(flags, name);
	if (!value) {
		throw new Error(`Missing required option --${name}`);
	}

	return value;
}

function getStringListFlag(flags: Flags, names: string[]) {
	for (const name of names) {
		const value = getStringFlag(flags, name);
		if (value) {
			return value
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean);
		}
	}

	return undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => item !== undefined),
	);
}
