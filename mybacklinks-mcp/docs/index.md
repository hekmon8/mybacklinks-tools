---
layout: default
title: Automate Backlink SEO with AI Agents
description: Connect Claude, Cursor, and Codex to your SEO data using the Model Context Protocol (MCP).
lang: en
show_hero: true
---

## The Missing Link in SEO

Manual backlink management is tedious, scattered, and hard to track. **MyBacklinks + MCP** brings your SEO data directly into your favorite AI coding tools, turning your IDE into an SEO command center.

### Why MyBacklinks MCP?

*   🔐 **Secure OAuth 2.0**: Enterprise-grade security with dynamic client registration and PKCE flow. Your data is safe.
*   🚀 **Zero-Config**: Just add the URL. No complex API keys or manual setup required for supported clients.
*   🤖 **Agent Ready**: Built for Claude, Cursor, and Codex. Let AI analyze opportunities and manage submissions.

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that enables AI assistants to securely connect to external tools. The MyBacklinks MCP server lets your AI assistant:

1.  **Read** your project and backlink data.
2.  **Analyze** SEO performance metrics.
3.  **Execute** backlink submissions and updates.

---

<h2 id="quick-start">Quick Start</h2>

### 1. Choose Your Client

| Client | Transport | Auth |
| :--- | :--- | :--- |
| **Claude Code** | HTTP | ✅ Built-in |
| **Cursor** | HTTP | ✅ Built-in |
| **OpenAI Codex** | HTTP | ✅ Built-in |

### 2. Configure

Simply add the MCP server URL: `https://mybacklinks.app/mcp`

#### For Claude Code (CLI)

```bash
claude mcp add --transport http --scope user mybacklinks https://mybacklinks.app/mcp
```

#### For Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

### 3. Authenticate

When you first use a tool, the client will prompt you to log in via your browser. Once authenticated, the token is stored securely.

---

## Available Tools

Your AI Agent gains access to **12 powerful tools**:

### Project Management
*   `listProjects`: View all SEO projects.
*   `getProjectAnalytics`: Get GSC clicks, impressions, and DR stats.
*   `listProjectBacklinks`: Track submissions and statuses.
*   `upsertProjectBacklink`: Add or update backlink records.
*   `listBacklinkResources`: Find new submission opportunities.
*   `updateBacklinkResource`: Update resource details like submission instructions, DR, or notes.

### Domain Research (Credits Required)
*   `getDomainMetrics`: Query SEO metrics for any domain - DR, traffic, backlinks count, organic keywords, referring domains, and more. Data source: RapidAPI SEO metrics. **Cost: 1 credit**
*   `discoverDomainBacklinks`: Discover backlinks for any domain. Returns source URL, anchor text, DR, dofollow status, etc. Supports filtering by dofollow, minimum DR, and anchor text. Data source: DataForSEO Backlinks API. **Cost: 10 credits**

---

## Use Cases

### 📊 Daily Reports
> "Generate a status report of all my projects with their backlink counts and recent growth."

### 🔍 Audit & Fix
> "Check all pending links for my SaaS project and tell me which ones need manual verification."

### 🎯 Opportunity Finder
> "Find websites with DR 40-60 where I can submit a guest post for my AI tool."

### ⚡ Bulk Import
> "Add these 5 Reddit threads as backlinks to my 'Launch' project."

### 🔬 Competitor Analysis
> "Get the DR and backlink stats for competitor.com to understand their SEO strength."

### 🔗 Backlink Discovery
> "Find all dofollow backlinks with DR > 50 pointing to example.com."

---

## Resources & Support

*   📖 **[Read the Full Tutorial](https://mybacklinks.app/blog/mcp-client-tutorial)** - Deep dive into parameters and architecture.
*   📂 **[Configuration Examples](https://github.com/hekmon8/mybacklinks-tools)** - Copy-paste configs.
*   📧 **Support** - support@mybacklinks.app
