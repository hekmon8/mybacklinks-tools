# 博客评论自动化技能

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个用于**自动发布博客评论**的 Claude Code 技能。智能检测各种博客平台（WordPress、Ghost、Disqus 等）的评论表单，并发布与文章内容相关的营销评论。

> **📝 目录站/论坛/社交平台外链请使用 [backlink-submission-skill](../backlink-submission-skill/)** - 它使用 AI + 浏览器自动化处理非博客资源。

## 何时使用此技能

| 资源类型 | 使用此技能? |
|---------|------------|
| `blog` 博客 | ✅ **是** - 专为博客平台优化 |
| `directory` 目录站 | ❌ 使用 backlink-submission-skill |
| `forum` 论坛 | ❌ 使用 backlink-submission-skill |
| `social` 社交平台 | ❌ 使用 backlink-submission-skill |

## 功能特点

- 🔍 **智能表单检测** - 自动检测 WordPress、Ghost 和通用博客的评论表单
- 💬 **上下文评论** - 根据文章内容和项目信息生成相关评论
- 🔐 **登录支持** - 支持表单登录和 OAuth 登录
- 📸 **截图记录** - 记录每次提交用于验证
- 🌐 **多语言支持** - 支持各种语言的博客

## 安装

### 方式 1: Claude Code 插件（推荐）

```bash
# 添加市场
claude mcp add marketplace mybacklinks https://github.com/hekmon8/mybacklinks-tools

# 安装技能
claude skill install blog-commenter-skill
```

### 方式 2: 手动安装

```bash
# 克隆到技能目录
git clone https://github.com/hekmon8/blog-commenter-skill.git ~/.claude/skills/blog-commenter-skill

# 进入目录并安装
cd ~/.claude/skills/blog-commenter-skill
npm run setup
```

## 快速开始

### 作为 Claude 技能使用

直接向 Claude 提问：

```
在 https://blog.example.com/post 为我的项目 AIMCP (aimcp.info) 提交评论
```

### 命令行使用

```bash
# 进入技能目录（安装后）
cd ~/.claude/skills/blog-commenter-skill

# 测试模式（填充表单但不提交）
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "AIMCP" \
  --domain "aimcp.info" \
  --description "AI MCP 服务器目录"

# 实际提交
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "AIMCP" \
  --domain "aimcp.info" \
  --submit
```

## 命令行参数

| 参数 | 必须 | 默认值 | 说明 |
|------|------|--------|------|
| `--url` | ✅ | - | 博客文章 URL |
| `--project` | ✅ | - | 项目名称 |
| `--domain` | ✅ | - | 项目域名 |
| `--description` | ❌ | - | 项目描述 |
| `--email` | ❌ | `cc@{domain}` | 评论者邮箱 |
| `--password` | ❌ | `12345678` | 登录密码 |
| `--submit` | ❌ | false | 实际提交（不加则为测试模式） |
| `--output` | ❌ | - | 保存结果到 JSON 文件 |

## 支持的平台

### 完全支持（匿名评论）

| 平台 | 检测 | 字段 |
|------|------|------|
| WordPress | ✅ | 5/5 |
| Ghost（部分主题） | ✅ | 不定 |
| 自定义 PHP 博客 | ✅ | 不定 |

### 部分支持（需要登录）

| 平台 | 登录方式 |
|------|----------|
| Disqus | OAuth/邮箱 |
| Medium | OAuth |
| Dev.to | OAuth |

## 技能对比

| 特性 | blog-commenter-skill | backlink-submission-skill |
|-----|---------------------|--------------------------|
| **目标** | 仅博客 | 目录站、论坛、社交平台 |
| **方式** | 专用脚本 | AI + 浏览器自动化 |
| **howToSubmit** | 可选 | 建议提供以获得最佳效果 |
| **平台** | WordPress, Ghost, Disqus | 任意网站 |

## API 函数

```javascript
const {
  detectCommentForm,    // 检测评论表单
  fillCommentForm,      // 填充表单
  extractArticleContent,// 提取文章内容
  createCommentData,    // 生成评论数据
  attemptLogin,         // 尝试登录
  takeScreenshot        // 截图
} = require('./lib/helpers');
```

## 与 MyBacklinks MCP 集成

此技能设计用于配合 [MyBacklinks MCP](https://mybacklinks.app/mcp) 实现自动化外链提交工作流：

1. 使用 `discoverBacklinkOpportunities` 发现博客资源
2. 使用此技能提交评论
3. 使用 `upsertProjectBacklink` 记录提交

## 相关项目

- [backlink-submission-skill](../backlink-submission-skill/) - 目录站/论坛/社交平台外链提交
- [mybacklinks-mcp](../../mybacklinks-mcp/) - MyBacklinks MCP 服务
- [commands](../../commands/) - 统一工作流命令

## 依赖

- Node.js >= 16.0.0
- Playwright ^1.48.0

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)

## 贡献

欢迎贡献！请先阅读 [贡献指南](CONTRIBUTING.md)。

## 支持

- [GitHub Issues](https://github.com/hekmon8/blog-commenter-skill/issues)
