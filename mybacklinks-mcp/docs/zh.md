---
layout: default
title: 用 AI Agent 自动化 SEO 外链管理
description: 通过 Model Context Protocol (MCP) 将 Claude、Cursor 和 Codex 连接到你的 SEO 数据。
permalink: /zh/
lang: zh-CN
show_hero: true
---

## SEO 缺失的一环

手动管理外链既繁琐又分散，难以追踪。**MyBacklinks + MCP** 将你的 SEO 数据直接带入你最喜欢的 AI 编程工具中，把你的 IDE 变成 SEO 指挥中心。

### 为什么选择 MyBacklinks MCP？

*   🔐 **安全 OAuth 2.0**：企业级安全性，采用动态客户端注册和 PKCE 流程。数据绝对安全。
*   🚀 **零配置**：只需添加 URL。支持的客户端无需复杂的 API 密钥或手动设置。
*   🤖 **Agent Ready**：专为 Claude、Cursor 和 Codex 构建。让 AI 分析机会并管理提交。

---

## 什么是 MCP？

**Model Context Protocol (MCP)** 是一个开放标准，允许 AI 助手安全地连接到外部工具。MyBacklinks MCP 服务器让你的 AI 助手能够：

1.  **读取** 你的项目和外链数据。
2.  **分析** SEO 性能指标。
3.  **执行** 外链提交和更新。

---

<h2 id="quick-start">快速开始</h2>

### 1. 选择客户端

| 客户端 | 传输协议 | 认证 |
| :--- | :--- | :--- |
| **Claude Code** | HTTP | ✅ 内置 |
| **Cursor** | HTTP | ✅ 内置 |
| **OpenAI Codex** | HTTP | ✅ 内置 |

### 2. 配置

只需添加 MCP 服务器 URL：`https://mybacklinks.app/mcp`

#### Claude Code (CLI)

```bash
claude mcp add --transport http --scope user mybacklinks https://mybacklinks.app/mcp
```

#### Cursor

在 `.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

### 3. 认证

首次使用工具时，客户端会提示你通过浏览器登录。认证后，Token 将被安全存储。

---

## 可用工具

你的 AI Agent 将获得 **9 个强大工具** 的使用权：

*   `listProjects`：查看所有 SEO 项目。
*   `getProjectAnalytics`：获取 GSC 点击、展示和 DR 统计。
*   `listProjectBacklinks`：追踪提交和状态。
*   `upsertProjectBacklink`：添加或更新外链记录。
*   `listBacklinkResources`：发现新的提交机会。

---

## 实战场景

### 📊 每日报告
> "生成我所有项目的状态报告，包含外链数量统计和近期增长。"

### 🔍 审计与修复
> "检查我 SaaS 项目的所有 pending 状态外链，告诉我哪些需要手动验证。"

### 🎯 发现机会
> "找一些 DR 在 40-60 之间可以为我的 AI 工具投稿的网站。"

### ⚡ 批量导入
> "把这 5 个 Reddit 帖子作为外链添加到我的 'Launch' 项目中。"

---

## 资源与支持

*   📖 **[阅读完整教程](https://mybacklinks.app/blog/mcp-client-tutorial)** - 深入了解参数和架构。
*   📂 **[配置示例](https://github.com/hekmon8/mybacklinks-tools)** - 复制粘贴配置。
*   📧 **支持** - support@mybacklinks.app
