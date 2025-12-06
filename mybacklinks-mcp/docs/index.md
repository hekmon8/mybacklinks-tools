---
layout: default
title: Automate Backlink Management with AI Agents
description: Use MyBacklinks + MCP to let Claude, Cursor, Codex manage your SEO backlinks automatically
lang: en
---

<p align="center">
  <strong>🌐 Language / 语言</strong><br>
  <a href="./">English</a> | <a href="./zh">中文</a>
</p>

# Automate Backlink Management with AI Agents

> As an indie hacker, are you tired of managing backlinks manually? Let AI automate it for you.

## The Pain of Backlink Management

Every indie hacker and side project builder knows that SEO is crucial for product promotion. Backlinks, as one of the core SEO factors, directly impact your website's search rankings.

However, backlink management is tedious work:

- 📋 **Hard to track** - Which sites did you submit to? What's the status? Difficult to keep track
- ⏰ **Time-consuming** - Manual submissions across platforms, repetitive work
- 📊 **Hard to evaluate** - Which backlinks are effective? What's the DR? No unified view
- 🔄 **Multi-project chaos** - Managing multiple projects makes it even messier

## The Solution: MyBacklinks + AI Agent

[MyBacklinks](https://mybacklinks.app) is a backlink management platform designed for indie hackers. Through the MCP (Model Context Protocol), you can let AI assistants directly manage your backlink data.

### What is MCP?

MCP (Model Context Protocol) is an open standard developed by Anthropic that allows AI assistants to securely connect to external data sources and tools. The MyBacklinks MCP server implements this protocol using OAuth 2.0 with dynamic client registration for secure authentication.

### Key Features

- 🔐 **Secure OAuth 2.0 Authentication** - Dynamic client registration with PKCE flow
- 🚀 **Zero-Config Setup** - Just add the URL, authentication is automatic
- 🛠️ **9 Powerful Tools** - Manage projects, links, resources, and analytics
- 🔄 **Auto Token Refresh** - Seamless session management
- 🎯 **Multiple AI Platforms** - Claude Code, Cursor, Codex, and more

## Quick Start

### Supported AI Clients

| Client | Transport | OAuth Auth |
|--------|-----------|------------|
| Claude Code | Streamable HTTP | ✅ Built-in |
| Cursor | Streamable HTTP | ✅ Built-in |
| OpenAI Codex | Streamable HTTP | ✅ Built-in |
| Kelivo (Mobile) | Streamable HTTP | ✅ Built-in |

### Configuration

Simply add the MCP server URL to your client's configuration:

#### Claude Code Configuration

**Option 1: CLI (Recommended)**

```bash
# Add globally (available in all projects)
claude mcp add --transport http --scope user mybacklinks https://mybacklinks.app/mcp

# Verify
claude mcp list
```

**Option 2: Config File** (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

#### Cursor Configuration

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

#### OpenAI Codex Configuration

```bash
codex mcp add mybacklinks --url https://mybacklinks.app/mcp
```

### First-Time Authentication

When you first connect, your AI client will automatically:

1. 🔍 Discover OAuth metadata from `/.well-known/oauth-authorization-server`
2. 📝 Register as a dynamic client (RFC 7591)
3. 🌐 Open your browser for login
4. 🔐 Store tokens securely for future requests

**No manual setup required** — just configure the URL and start using it!

## Available MCP Tools

Once connected, these 9 tools are available to your AI assistant:

| Tool Name | Description |
|-----------|-------------|
| `listProjects` | List all projects with metadata |
| `getProjectDetail` | Get detailed project info |
| `listProjectBacklinks` | List all backlinks for a project |
| `getProjectBacklinkDetail` | Get specific backlink details |
| `upsertProjectBacklink` | Create or update backlink records |
| `listBacklinkResources` | List available backlink resource sites |
| `listAvailableResources` | List resources not yet used for a project |
| `addBacklinkResource` | Add a new backlink resource to your database |
| `getProjectAnalytics` | Get project SEO analytics |

## Use Cases

### Use Case 1: Daily SEO Workflow

```
> Generate a status report of all my projects with their backlink counts
```

### Use Case 2: Backlink Auditing

```
> Check all pending links for my SaaS project and list which need attention
```

### Use Case 3: Finding Opportunities

```
> Find websites with DR between 40-60 where I can submit guest posts
```

### Use Case 4: Bulk Operations

```
> Add these backlinks to my project:
> 1. https://reddit.com/r/startups/my-post - anchor: "startup tools"
> 2. https://hackernews.com/item/123 - anchor: "new SaaS tool"
```

### Use Case 5: Adding New Resources

```
> Add a new backlink resource: domain "indiehackers.com", type "forum", free, DR 70
```

## API Rate Limits

The MyBacklinks MCP respects these rate limits based on your subscription:

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise**: Custom limits

## Best Practices

1. **Use Pagination** - For large datasets, use `cursor` and `limit` parameters
2. **Select Fields** - Use the `fields` parameter in `listProjectBacklinks` to reduce response size
3. **Batch Operations** - Group related link updates in a single conversation
4. **Check Status** - Verify link status before taking action

## 📖 Full Documentation

Want to learn more about MCP tools, OAuth architecture, and troubleshooting?

👉 **[Read the Complete Tutorial](https://mybacklinks.app/blog/mcp-client-tutorial)**

The full tutorial includes:
- Detailed parameter documentation for each tool
- OAuth 2.0 architecture and security features
- Troubleshooting guide
- More usage examples

## Get Started

1. **Sign up**: [mybacklinks.app](https://mybacklinks.app)
2. **Configure MCP**: Follow the guide above to configure your AI client
3. **Start chatting**: Manage your backlinks with natural language

---

## Resources

- 📖 [Full MCP Tutorial](https://mybacklinks.app/blog/mcp-client-tutorial)
- 📂 [Configuration Examples](https://github.com/hekmon8/mybacklinks-tools)
- 🐛 [Report Issues](https://github.com/hekmon8/mybacklinks-tools/issues)
- 📧 Contact us: support@mybacklinks.app

---

<p align="center">
  <a href="https://mybacklinks.app">MyBacklinks</a> - Backlink management platform for indie hackers
</p>
