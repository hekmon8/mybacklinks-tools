---
layout: default
title: Automate Backlink Management with AI Agents
description: Use MyBacklinks + MCP to let Claude, Cursor, Codex manage your SEO backlinks automatically
lang: en
---

<div class="hero">
  <div class="container">
    <p align="center" style="margin-bottom: 2rem;">
      <span class="badge">🌐 <a href="./" style="color: inherit; text-decoration: none;">English</a> | <a href="./zh" style="color: inherit; text-decoration: none;">中文</a></span>
    </p>
    <h1>Automate Backlink SEO<br>with AI Agents</h1>
    <p>Connect Claude, Cursor, and Codex to your SEO data using the Model Context Protocol (MCP).</p>
    <div class="hero-actions">
      <a href="#quick-start" class="btn btn-primary">Get Started</a>
      <a href="https://github.com/hekmon8/mybacklinks-tools" class="btn btn-secondary">View on GitHub</a>
    </div>
  </div>
</div>

<div class="container content-wrapper">

<div class="text-center" style="margin-bottom: 4rem;">
  <h2>The Missing Link in SEO</h2>
  <p style="max-width: 600px; margin: 0 auto; color: var(--text-muted);">
    Manual backlink management is tedious, scattered, and hard to track. MyBacklinks + MCP brings your SEO data directly into your favorite AI coding tools.
  </p>
</div>

<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-icon">🔐</div>
    <h3>Secure OAuth 2.0</h3>
    <p>Enterprise-grade security with dynamic client registration and PKCE flow. Your data is safe.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🚀</div>
    <h3>Zero-Config</h3>
    <p>Just add the URL. No complex API keys or manual setup required for supported clients.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🤖</div>
    <h3>Agent Ready</h3>
    <p>Built for Claude, Cursor, and Codex. Let AI analyze opportunities and manage submissions.</p>
  </div>
</div>

<div style="margin-top: 4rem;">

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that enables AI assistants to securely connect to external tools. The MyBacklinks MCP server lets your AI assistant:
1. **Read** your project and backlink data
2. **Analyze** SEO performance metrics
3. **Execute** backlink submissions and updates

---

<h2 id="quick-start">Quick Start</h2>

### 1. Choose Your Client

| Client | Transport | Auth |
|--------|-----------|------|
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

## 🛠️ Available Tools

Your AI agent gains access to **9 powerful tools**:

| Tool | Function |
|------|----------|
| `listProjects` | View all SEO projects |
| `getProjectAnalytics` | Get GSC clicks, impressions, and DR stats |
| `listProjectBacklinks` | Track submissions and statuses |
| `upsertProjectBacklink` | Add or update backlink records |
| `listBacklinkResources` | Find new submission opportunities |
| ...and more | Full CRUD capabilities |

---

## 💡 Use Cases

<div class="feature-grid">
  <div class="feature-card">
    <h3>📊 Daily Reports</h3>
    <p><em>"Generate a status report of all my projects with their backlink counts and recent growth."</em></p>
  </div>
  <div class="feature-card">
    <h3>🔍 Audit & Fix</h3>
    <p><em>"Check all pending links for my SaaS project and tell me which ones need manual verification."</em></p>
  </div>
  <div class="feature-card">
    <h3>🎯 Opportunity Finder</h3>
    <p><em>"Find websites with DR 40-60 where I can submit a guest post for my AI tool."</em></p>
  </div>
  <div class="feature-card">
    <h3>⚡ Bulk Import</h3>
    <p><em>"Add these 5 Reddit threads as backlinks to my 'Launch' project."</em></p>
  </div>
</div>

---

## Resources & Support

- 📖 **[Read the Full Tutorial](https://mybacklinks.app/blog/mcp-client-tutorial)** - Deep dive into parameters and architecture.
- 📂 **[Configuration Examples](https://github.com/hekmon8/mybacklinks-tools)** - Copy-paste configs.
- 📧 **Support** - support@mybacklinks.app

</div>
</div>