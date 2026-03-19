export type CliCommandDefinition = {
	name: string;
	toolName?: string;
	toolPath?: string;
	description: string;
};

const commandDefinitions: CliCommandDefinition[] = [
	{
		name: "login",
		description:
			"Authenticate with MyBacklinks using OAuth portal flow or an API key",
	},
	{
		name: "status",
		toolName: "getStatus",
		toolPath: "/api/mcp/tools/status/get",
		description:
			"Show current auth mode, subscription summary, credits, and upcoming fields",
	},
	{
		name: "list-projects",
		toolName: "listProjects",
		toolPath: "/api/mcp/tools/projects/list",
		description: "List all projects in the current account",
	},
	{
		name: "list-backlink-resources",
		toolName: "listBacklinkResources",
		toolPath: "/api/mcp/tools/link-resources/list",
		description: "List saved backlink resources",
	},
	{
		name: "add-backlink-resource",
		toolName: "addBacklinkResource",
		toolPath: "/api/mcp/tools/link-resources/add",
		description: "Create a backlink resource",
	},
	{
		name: "update-backlink-resource",
		toolName: "updateBacklinkResource",
		toolPath: "/api/mcp/tools/link-resources/update",
		description: "Update an existing backlink resource",
	},
	{
		name: "fetch-project-info",
		toolName: "getProject",
		toolPath: "/api/mcp/tools/projects/get",
		description: "Fetch detailed project information",
	},
	{
		name: "update-project-info",
		toolName: "updateProject",
		toolPath: "/api/mcp/tools/projects/update",
		description: "Update project metadata",
	},
	{
		name: "fetch-project-backlinks",
		toolName: "listProjectBacklinks",
		toolPath: "/api/mcp/tools/links/list",
		description: "Fetch backlinks for a project with optional filters",
	},
	{
		name: "update-project-backlinks",
		toolName: "updateProjectBacklinks",
		toolPath: "/api/mcp/tools/links/update",
		description: "Create or update one or more project backlinks",
	},
	{
		name: "fetch-backlinks-by-domain",
		toolName: "getDomainBacklinks",
		toolPath: "/api/mcp/tools/domain-backlinks/discover",
		description: "Fetch discovered backlinks for any domain",
	},
	{
		name: "fetch-dr-by-domain",
		toolName: "getDomainMetrics",
		toolPath: "/api/mcp/tools/domain-metrics/get",
		description: "Fetch only the DR metric for a domain",
	},
	{
		name: "fetch-traffic-by-domain",
		toolName: "getDomainMetrics",
		toolPath: "/api/mcp/tools/domain-metrics/get",
		description: "Fetch only the traffic metric for a domain",
	},
];

export function getPublicCommandNames() {
	return commandDefinitions.map((command) => command.name);
}

export function getCommandDefinition(name: string) {
	return commandDefinitions.find((command) => command.name === name);
}

export function getCommandDefinitions() {
	return [...commandDefinitions];
}
