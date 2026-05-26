# mybacklinks-mcp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | [中文](./README.zh-CN.md) | [📖 博客/教程](https://hekmon8.github.io/mybacklinks-tools/)

---

**mybacklinks-mcp** 提供将 AI 助手（Claude Code、Cursor、Codex、Kelivo）连接到 [MyBacklinks](https://mybacklinks.app) MCP 服务器的配置指南和示例。

> 🆕 **新上线！** 查看我们的[详细教程](https://hekmon8.github.io/mybacklinks-tools/)，了解如何使用 AI Agent 自动化管理外链！

## MyBacklinks 是什么？

MyBacklinks 是一个为独立开发者和 Side Project 创建者设计的外链管理平台，帮助你：

- 📊 **项目追踪**：在一处管理多个 Side Project
- 🔗 **外链管理**：追踪已提交的外链、状态和锚文本
- 📈 **SEO 监控**：分析域名评级、链接表现和提交历史
- 🌐 **资源发现**：发现高质量的外链提交网站

## 可用工具

连接后，你的 AI 助手可以使用以下 MCP 工具：

| 工具 | 描述 |
|------|------|
| `listProjects` | 列出所有项目及基本统计 |
| `getProject` | 获取项目详情和链接数量 |
| `listProjectLinks` | 浏览特定项目的外链 |
| `getLink` | 查看完整的外链详情和历史 |
| `upsertProjectLink` | 创建或更新外链记录 |
| `listLinkResources` | 发现潜在的外链资源 |
| `discoverBacklinkOpportunities` | 发现项目的外链提交机会（未使用的资源） |
| `addBacklinkResource` | 新增外链资源（域名重复时拒绝） |
| `updateBacklinkResource` | 更新已有外链资源（提交 URL、类型、DR、备注等） |
| `getProjectAnalytics` | 获取项目的 SEO 分析数据 |

## 快速开始

### 支持的客户端

| 客户端 | 传输协议 | OAuth |
|--------|----------|-------|
| Claude Code | Streamable HTTP | ✅ 内置 |
| Cursor | Streamable HTTP | ✅ 内置 |
| OpenAI Codex | Streamable HTTP | ✅ 内置 |
| Kelivo（移动端）| Streamable HTTP | ✅ 内置 |

### 配置

只需将 MCP 服务器 URL 添加到客户端配置中：

**Claude Code** (`~/.claude/claude_desktop_config.json`)：

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

**Cursor** (项目中的 `.cursor/mcp.json`)：

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

**Codex CLI** (`~/.codex/mcp.toml`)：

```toml
[[mcp_servers]]
name = "mybacklinks"
url = "https://mybacklinks.app/mcp"
```

查看 [`examples/`](./examples/) 目录获取完整的配置模板。

### 命令行集成

你也可以使用 CLI 命令快速添加 MCP 服务器：

**Claude Code**（通过 `claude` 命令行）：

```bash
# 添加 MyBacklinks MCP 服务器（user 范围 - 所有项目可用）
claude mcp add --transport http --scope user mybacklinks https://mybacklinks.app/mcp

# 或仅添加到当前项目（local 范围）
claude mcp add --transport http mybacklinks https://mybacklinks.app/mcp

# 验证是否添加成功
claude mcp list
```

**Codex CLI**（通过 `codex` 命令行）：

```bash
# 添加 MyBacklinks MCP 服务器
codex mcp add mybacklinks --url https://mybacklinks.app/mcp

# 验证是否添加成功
codex mcp list
```

这些命令会自动更新相应的配置文件。

### 认证

首次使用 MCP 服务器时，你的 AI 客户端会自动：

1. 从 `/.well-known/oauth-authorization-server` 发现 OAuth 元数据
2. 打开浏览器让你使用 MyBacklinks 账户登录
3. 安全存储 token 供后续请求使用

无需手动设置——只需配置 URL 即可开始使用！

## 使用场景

### 追踪外链提交状态

问你的 AI 助手：
> "显示我 SaaS 项目的所有待提交外链"

助手会使用 `listProjectLinks` 配合状态过滤来显示未提交的链接。

### 添加新外链

> "从 producthunt.com 添加一个指向我落地页 https://myapp.com 的外链，锚文本是 'AI 驱动的工具'"

助手会使用 `upsertProjectLink` 创建记录。

### 分析 SEO 表现

> "我项目过去 30 天的 SEO 表现如何？"

助手会使用 `getProjectAnalytics` 获取指标。

### 发现外链机会

> "找一些高 DR 的网站，我可以提交我的项目"

助手会使用 `listLinkResources` 配合 DR 过滤器。

### 添加新外链资源

> "添加 indiehackers.com 作为论坛类型的外链资源，DR 70"

助手会使用 `addBacklinkResource` 添加资源。如果域名已存在会拒绝添加。

### 更新外链资源

> "更新 indiehackers.com 资源的提交说明：前往 /new 页面，填写表单，然后点击 Post"

助手会使用 `updateBacklinkResource` 更新资源的 `howToSubmit` 字段。

## API 端点

| 端点 | 用途 |
|------|------|
| `https://mybacklinks.app/mcp` | MCP Streamable HTTP 端点 |
| `https://mybacklinks.app/.well-known/oauth-authorization-server` | OAuth 2.0 元数据发现 |
| `https://mybacklinks.app/api/oauth/authorize` | OAuth 授权 |
| `https://mybacklinks.app/api/oauth/token` | OAuth Token 交换 |

## 许可证

MIT 许可证 - 详见 [LICENSE](./LICENSE)。

## 支持

- 🐛 [报告 Bug](https://github.com/hekmon8/ai-cf-mybacklinks/issues)
- 💡 [功能建议](https://github.com/hekmon8/ai-cf-mybacklinks/issues)
- 📧 联系邮箱: support@mybacklinks.app
