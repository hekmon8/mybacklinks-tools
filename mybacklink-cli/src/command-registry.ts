export type ParamDef = {
	name: string;
	type: "string" | "number" | "boolean";
	required?: boolean;
	description: string;
	defaultValue?: string;
};

export type CliCommandDefinition = {
	name: string;
	toolName?: string;
	toolPath?: string;
	description: string;
	params?: ParamDef[];
	examples?: string[];
};

const GLOBAL_PARAMS: ParamDef[] = [
	{
		name: "json",
		type: "boolean",
		description: "Output as JSON",
	},
	{
		name: "base-url",
		type: "string",
		description: "Override server URL",
		defaultValue: "https://mybacklinks.app",
	},
];

const commandDefinitions: CliCommandDefinition[] = [
	{
		name: "login",
		description:
			"Authenticate with MyBacklinks using OAuth portal flow or an API key",
		params: [
			{
				name: "api-key",
				type: "string",
				description: "Log in with an API key instead of OAuth",
			},
			{
				name: "port",
				type: "number",
				description: "Local port for OAuth callback server",
			},
		],
		examples: [
			"mybacklinks login",
			"mybacklinks login --api-key mbk_xxxxx",
		],
	},
	{
		name: "logout",
		description: "Revoke current credentials and log out",
		examples: ["mybacklinks logout"],
	},
	{
		name: "status",
		toolName: "getStatus",
		toolPath: "/api/mcp/tools/status/get",
		description: "Show current auth mode, subscription summary, and credits",
		examples: ["mybacklinks status", "mybacklinks status --json"],
	},
	{
		name: "list-projects",
		toolName: "listProjects",
		toolPath: "/api/mcp/tools/projects/list",
		description: "List all projects in the current account",
		params: [
			{
				name: "limit",
				type: "number",
				description: "Max number of projects to return per page",
			},
			{
				name: "cursor",
				type: "string",
				description: "Pagination cursor from a previous response",
			},
			{
				name: "all",
				type: "boolean",
				description: "Fetch all pages automatically",
			},
		],
		examples: [
			"mybacklinks list-projects",
			"mybacklinks list-projects --limit 5",
			"mybacklinks list-projects --all",
		],
	},
	{
		name: "list-backlink-resources",
		toolName: "listBacklinkResources",
		toolPath: "/api/mcp/tools/link-resources/list",
		description: "List saved backlink resources",
		params: [
			{
				name: "limit",
				type: "number",
				description: "Max number of resources to return per page",
			},
			{
				name: "cursor",
				type: "string",
				description: "Pagination cursor from a previous response",
			},
			{
				name: "all",
				type: "boolean",
				description: "Fetch all pages automatically",
			},
			{
				name: "type",
				type: "string",
				description: "Filter by resource type",
			},
			{
				name: "payment-type",
				type: "string",
				description: "Filter by payment type",
			},
			{
				name: "dr-min",
				type: "number",
				description: "Minimum domain rating filter",
			},
			{
				name: "dr-max",
				type: "number",
				description: "Maximum domain rating filter",
			},
		],
		examples: [
			"mybacklinks list-backlink-resources",
			"mybacklinks list-backlink-resources --type guest_post --dr-min 30",
			"mybacklinks list-backlink-resources --all",
		],
	},
	{
		name: "add-backlink-resource",
		toolName: "addBacklinkResource",
		toolPath: "/api/mcp/tools/link-resources/add",
		description: "Create a backlink resource",
		params: [
			{
				name: "domain",
				type: "string",
				required: true,
				description: "Domain of the resource",
			},
			{
				name: "type",
				type: "string",
				required: true,
				description: "Resource type (e.g. guest_post, directory, forum)",
			},
			{
				name: "submission-url",
				type: "string",
				description: "URL for submitting content",
			},
			{
				name: "payment-type",
				type: "string",
				description: "Payment type (e.g. free, paid, exchange)",
			},
			{
				name: "submission-method",
				type: "string",
				description: "How to submit (e.g. form, email, api)",
			},
			{
				name: "how-to-submit",
				type: "string",
				description: "Human-readable submission instructions",
			},
			{
				name: "dr",
				type: "number",
				description: "Domain rating of the resource",
			},
			{
				name: "traffic",
				type: "number",
				description: "Monthly traffic of the resource",
			},
			{
				name: "notes",
				type: "string",
				description: "Additional notes",
			},
		],
		examples: [
			"mybacklinks add-backlink-resource --domain blog.example.com --type guest_post",
			"mybacklinks add-backlink-resource --domain dir.example.com --type directory --payment-type free --dr 45",
		],
	},
	{
		name: "update-backlink-resource",
		toolName: "updateBacklinkResource",
		toolPath: "/api/mcp/tools/link-resources/update",
		description: "Update an existing backlink resource",
		params: [
			{
				name: "id",
				type: "string",
				required: true,
				description: "Resource ID to update",
			},
			{
				name: "submission-url",
				type: "string",
				description: "Updated submission URL",
			},
			{
				name: "type",
				type: "string",
				description: "Updated resource type",
			},
			{
				name: "payment-type",
				type: "string",
				description: "Updated payment type",
			},
			{
				name: "submission-method",
				type: "string",
				description: 'Updated submission method (use "null" to clear)',
			},
			{
				name: "how-to-submit",
				type: "string",
				description: 'Updated instructions (use "null" to clear)',
			},
			{
				name: "dr",
				type: "number",
				description: 'Updated domain rating (use "null" to clear)',
			},
			{
				name: "traffic",
				type: "number",
				description: 'Updated monthly traffic (use "null" to clear)',
			},
			{
				name: "notes",
				type: "string",
				description: 'Updated notes (use "null" to clear)',
			},
		],
		examples: [
			"mybacklinks update-backlink-resource --id res_abc --dr 52",
			'mybacklinks update-backlink-resource --id res_abc --notes "null"',
		],
	},
	{
		name: "fetch-project-info",
		toolName: "getProject",
		toolPath: "/api/mcp/tools/projects/get",
		description: "Fetch detailed project information",
		params: [
			{
				name: "project-id",
				type: "string",
				description: "Project ID (provide this or --domain)",
			},
			{
				name: "domain",
				type: "string",
				description: "Project domain (provide this or --project-id)",
			},
		],
		examples: [
			"mybacklinks fetch-project-info --project-id proj_abc",
			"mybacklinks fetch-project-info --domain example.com",
		],
	},
	{
		name: "update-project-info",
		toolName: "updateProject",
		toolPath: "/api/mcp/tools/projects/update",
		description: "Update project metadata",
		params: [
			{
				name: "project-id",
				type: "string",
				required: true,
				description: "Project ID to update",
			},
			{
				name: "name",
				type: "string",
				description: "New project name",
			},
			{
				name: "description",
				type: "string",
				description: "New project description",
			},
			{
				name: "url",
				type: "string",
				description: "New project URL",
			},
			{
				name: "status",
				type: "string",
				description: "New project status",
			},
		],
		examples: [
			'mybacklinks update-project-info --project-id proj_abc --name "My Site"',
			"mybacklinks update-project-info --project-id proj_abc --status active",
		],
	},
	{
		name: "fetch-project-backlinks",
		toolName: "listProjectBacklinks",
		toolPath: "/api/mcp/tools/links/list",
		description: "Fetch backlinks for a project with optional filters",
		params: [
			{
				name: "project-id",
				type: "string",
				required: true,
				description: "Project ID",
			},
			{
				name: "status",
				type: "string",
				description: "Filter by status (e.g. indexed, pending)",
			},
			{
				name: "resource-domain",
				type: "string",
				description: "Filter by resource domain",
			},
			{
				name: "anchor-text",
				type: "string",
				description: "Filter by anchor text",
			},
			{
				name: "target-url",
				type: "string",
				description: "Filter by target URL",
			},
			{
				name: "limit",
				type: "number",
				description: "Max number of backlinks to return per page",
			},
			{
				name: "cursor",
				type: "string",
				description: "Pagination cursor from a previous response",
			},
			{
				name: "all",
				type: "boolean",
				description: "Fetch all pages automatically",
			},
		],
		examples: [
			"mybacklinks fetch-project-backlinks --project-id proj_abc",
			"mybacklinks fetch-project-backlinks --project-id proj_abc --status indexed --limit 20",
			"mybacklinks fetch-project-backlinks --project-id proj_abc --all",
		],
	},
	{
		name: "update-project-backlinks",
		toolName: "updateProjectBacklinks",
		toolPath: "/api/mcp/tools/links/update",
		description: "Create or update one or more project backlinks",
		params: [
			{
				name: "project-id",
				type: "string",
				required: true,
				description: "Project ID (not needed when using --file with projectId in JSON)",
			},
			{
				name: "backlink-id",
				type: "string",
				description: "Existing backlink ID to update",
			},
			{
				name: "resource-id",
				type: "string",
				description: "Backlink resource ID to link",
			},
			{
				name: "target-url",
				type: "string",
				description: "Target URL on your site",
			},
			{
				name: "backlink-url",
				type: "string",
				description: "URL where the backlink is placed",
			},
			{
				name: "anchor",
				type: "string",
				description: "Anchor text",
			},
			{
				name: "status",
				type: "string",
				description: "Backlink status",
			},
			{
				name: "utm-source",
				type: "string",
				description: "UTM source tag",
			},
			{
				name: "notes",
				type: "string",
				description: "Additional notes",
			},
			{
				name: "file",
				type: "string",
				description: "JSON file with batch update data (array or object with items)",
			},
		],
		examples: [
			"mybacklinks update-project-backlinks --project-id proj_abc --target-url https://mysite.com/page --anchor \"my keyword\"",
			"mybacklinks update-project-backlinks --file backlinks.json",
		],
	},
	{
		name: "fetch-backlinks-by-domain",
		toolName: "getDomainBacklinks",
		toolPath: "/api/mcp/tools/domain-backlinks/discover",
		description: "Fetch discovered backlinks for any domain",
		params: [
			{
				name: "domain",
				type: "string",
				required: true,
				description: "Domain to look up",
			},
			{
				name: "mode",
				type: "string",
				description: "Discovery mode",
			},
			{
				name: "dofollow",
				type: "boolean",
				description: "Only return dofollow links",
			},
			{
				name: "min-dr",
				type: "number",
				description: "Minimum domain rating filter",
			},
			{
				name: "anchor-text",
				type: "string",
				description: "Filter by anchor text",
			},
			{
				name: "limit",
				type: "number",
				description: "Max number of backlinks to return",
			},
		],
		examples: [
			"mybacklinks fetch-backlinks-by-domain --domain example.com",
			"mybacklinks fetch-backlinks-by-domain --domain example.com --dofollow --min-dr 30 --limit 50",
		],
	},
	{
		name: "fetch-dr-by-domain",
		toolName: "getDomainMetrics",
		toolPath: "/api/mcp/tools/domain-metrics/get",
		description: "Fetch only the DR metric for a domain",
		params: [
			{
				name: "domain",
				type: "string",
				required: true,
				description: "Domain to look up",
			},
		],
		examples: ["mybacklinks fetch-dr-by-domain --domain example.com"],
	},
	{
		name: "fetch-traffic-by-domain",
		toolName: "getDomainMetrics",
		toolPath: "/api/mcp/tools/domain-metrics/get",
		description: "Fetch only the traffic metric for a domain",
		params: [
			{
				name: "domain",
				type: "string",
				required: true,
				description: "Domain to look up",
			},
		],
		examples: ["mybacklinks fetch-traffic-by-domain --domain example.com"],
	},
];

export function getGlobalParams() {
	return GLOBAL_PARAMS;
}

export function getPublicCommandNames() {
	return commandDefinitions.map((command) => command.name);
}

export function getCommandDefinition(name: string) {
	return commandDefinitions.find((command) => command.name === name);
}

export function getCommandDefinitions() {
	return [...commandDefinitions];
}
