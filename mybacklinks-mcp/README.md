# mybacklinks-mcp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | [中文](./README.zh-CN.md) | [📖 Blog/Guide](https://hekmon8.github.io/mybacklinks-tools/)

---

**mybacklinks-mcp** provides configuration guides and examples for connecting AI assistants (ChatGPT, Claude Code, Cursor, Codex, Kelivo) to the [MyBacklinks](https://mybacklinks.app) MCP server.

> 🆕 **New!** Check out our [detailed guide](https://hekmon8.github.io/mybacklinks-tools/) on automating backlink management with AI agents!

## What is MyBacklinks?

MyBacklinks is a comprehensive backlink management platform designed for indie hackers and side project builders. It helps you:

- 📊 **Track Projects**: Manage multiple side projects in one place
- 🔗 **Manage Backlinks**: Track submitted backlinks, their status, and anchor text
- 📈 **Monitor SEO**: Analyze domain ratings, link performance, and submission history
- 🌐 **Discover Resources**: Find high-quality websites for backlink opportunities

## Available Tools

When connected, your AI assistant can use these MCP tools:

| Tool | Description |
|------|-------------|
| `listProjects` | List all your projects with basic stats |
| `getProject` | Get detailed project info including link counts |
| `listProjectLinks` | Browse backlinks for a specific project |
| `getLink` | View complete link details and history |
| `upsertProjectLink` | Create or update backlink records |
| `listLinkResources` | Discover potential backlink resources |
| `discoverBacklinkOpportunities` | Discover backlink submission opportunities (unused resources) for a project |
| `addBacklinkResource` | Add a new backlink resource (rejects duplicate domains) |
| `updateBacklinkResource` | Update an existing backlink resource (submission URL, type, DR, notes, etc.) |
| `getProjectAnalytics` | Get SEO analytics for your project |

## Quick Start

### Supported Clients

| Client | Transport | OAuth |
|--------|-----------|-------|
| Claude Code | Streamable HTTP | ✅ Built-in |
| Cursor | Streamable HTTP | ✅ Built-in |
| OpenAI Codex | Streamable HTTP | ✅ Built-in |
| ChatGPT Apps / Connectors | Streamable HTTP | ✅ Built-in |
| Kelivo (Mobile) | Streamable HTTP | ✅ Built-in |

### Configuration

Simply add the MCP server URL to your client's configuration:

**Claude Code** (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` in your project):

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

**Codex CLI** (`~/.codex/mcp.toml`):

```toml
[[mcp_servers]]
name = "mybacklinks"
url = "https://mybacklinks.app/mcp"
```

See the [`examples/`](./examples/) directory for complete configuration templates.

### ChatGPT Connector

To test MyBacklinks inside ChatGPT, enable developer mode in ChatGPT, then create a connector with:

- **Connector name**: MyBacklinks
- **Description**: Manage backlink projects, resources, opportunities, submissions, infrastructure servers, and SEO analytics.
- **Connector URL**: `https://mybacklinks.app/mcp`

ChatGPT discovers OAuth metadata from `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server`, then links the user's MyBacklinks account with authorization-code + PKCE OAuth. Use `https://chatgpt.com/connector/oauth/{callback_id}` as the production redirect URI shown in ChatGPT's app management page.

### CLI Integration

For a faster setup, you can use CLI commands to add the MCP server directly:

**Claude Code** (via `claude` CLI):

```bash
# Add MyBacklinks MCP server (user scope - available in all projects)
claude mcp add --transport http --scope user mybacklinks https://mybacklinks.app/mcp

# Or add to current project only (local scope)
claude mcp add --transport http mybacklinks https://mybacklinks.app/mcp

# Verify it was added
claude mcp list
```

**Codex CLI** (via `codex` CLI):

```bash
# Add MyBacklinks MCP server
codex mcp add mybacklinks --url https://mybacklinks.app/mcp

# Verify it was added
codex mcp list
```

These commands automatically update the respective configuration files.

### Authentication

When you first use the MCP server, your AI client will automatically:

1. Discover OAuth metadata from `/.well-known/oauth-authorization-server`
2. Open a browser for you to log in with your MyBacklinks account
3. Store the token securely for future requests

No manual setup required—just configure the URL and start using it!

## Use Cases

### Track Your Backlink Submissions

Ask your AI assistant:
> "Show me all pending backlinks for my SaaS project"

The assistant will use `listProjectLinks` with status filter to show unsubmitted links.

### Add New Backlinks

> "Add a backlink from producthunt.com to my landing page https://myapp.com with anchor text 'AI-powered tool'"

The assistant will use `upsertProjectLink` to create the record.

### Analyze SEO Performance

> "What's the SEO performance of my project over the last 30 days?"

The assistant will use `getProjectAnalytics` to fetch metrics.

### Find Backlink Opportunities

> "Find high DR resources where I can submit my project"

The assistant will use `listLinkResources` with DR filters.

### Add New Backlink Resources

> "Add indiehackers.com as a forum-type backlink resource with DR 70"

The assistant will use `addBacklinkResource` to add the resource. It will reject if the domain already exists.

### Update Backlink Resources

> "Update the indiehackers.com resource with new submission instructions: Go to /new, fill the form, and click Post"

The assistant will use `updateBacklinkResource` to update the resource's `howToSubmit` field.

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `https://mybacklinks.app/mcp` | MCP Streamable HTTP endpoint |
| `https://mybacklinks.app/.well-known/oauth-authorization-server` | OAuth 2.0 metadata discovery |
| `https://mybacklinks.app/api/oauth/authorize` | OAuth authorization |
| `https://mybacklinks.app/api/oauth/token` | OAuth token exchange |

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 🐛 [Report bugs](https://github.com/hekmon8/ai-cf-mybacklinks/issues)
- 💡 [Request features](https://github.com/hekmon8/ai-cf-mybacklinks/issues)
- 📧 Contact: support@mybacklinks.app
