# MyBacklinks Open Source

[English](#english) | [中文](#中文)

---

## English

This directory contains open source packages from [MyBacklinks](https://mybacklinks.app).

### Packages

| Package | Description | Use Case |
|---------|-------------|----------|
| [../cli](../cli) | Official npm CLI package | Command-line automation |
| [mybacklinks-mcp](./mybacklinks-mcp) | MCP server for AI assistants | Backend API integration |
| [skills/blog-commenter-skill](./skills/blog-commenter-skill) | Automated blog comment posting | **Blog** backlinks |
| [skills/backlink-submission-skill](./skills/backlink-submission-skill) | AI + browser automation | **Directory/Forum/Social** backlinks |
| [skills/seo-research-skill](./skills/seo-research-skill) | CLI-driven SEO research workflow | **Domain metrics / backlink audits** |
| [commands](./commands) | Unified workflow commands | Orchestration |

### Skill Selection Guide

| Resource Type | Recommended Skill | Method |
|---------------|------------------|--------|
| `blog` | **blog-commenter-skill** | Scripts (WordPress, Ghost, Disqus) |
| `directory` | **backlink-submission-skill** | AI + Browser automation |
| `forum` | **backlink-submission-skill** | AI + Browser automation |
| `social` | **backlink-submission-skill** | AI + Browser automation |
| `other` | **backlink-submission-skill** | AI + Browser automation |

### Quick Start

#### Option 1: Use the Unified Workflow

See [commands/submit-backlinks.md](./commands/submit-backlinks.md) for the complete workflow that automatically routes to the right skill based on resource type.

```
/submit-backlinks aimcp.info
/submit-backlinks lovemoney.app blog
/submit-backlinks myproject.com directory
```

#### Option 2: Use Skills Directly

**For CLI-based SEO Research:**
```bash
npm install -g @mybacklinks/cli
mybacklinks login
mybacklinks fetch-dr-by-domain --domain example.com
```

**For Blog Comments:**
```bash
cd skills/blog-commenter-skill
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "MyProject" \
  --domain "myproject.com" \
  --submit
```

**For Directory/Forum Submissions:**
```
Ask AI: "Submit directory backlinks to my project using backlink-submission-skill"
```

### About MyBacklinks

MyBacklinks is a comprehensive backlink management platform designed for indie hackers and side project builders. We help you:

- 📊 **Track Projects**: Manage multiple side projects in one place
- 🔗 **Manage Backlinks**: Track submitted backlinks, their status, and anchor text
- 📈 **Monitor SEO**: Analyze domain ratings, link performance, and submission history
- 🌐 **Discover Resources**: Find high-quality websites for backlink opportunities

### Contributing

We welcome contributions! Each package has its own contributing guidelines.

### License

All packages are released under the MIT License.

### Links

- 🌐 [MyBacklinks Website](https://mybacklinks.app)
- 📚 [Documentation](https://docs.mybacklinks.app)
- 📖 [MCP Setup Guide](https://hekmon8.github.io/mybacklinks-tools) - GitHub Pages
- 🐛 [Report Issues](https://github.com/hekmon8/mybacklinks-tools/issues)
- 💬 [Discussions](https://github.com/hekmon8/mybacklinks-tools/discussions)

---

## 中文

本目录包含 [MyBacklinks](https://mybacklinks.app) 的开源软件包。

### 软件包

| 软件包 | 描述 | 适用场景 |
|--------|------|----------|
| [../cli](../cli) | 官方 npm CLI 包 | 命令行自动化 |
| [mybacklinks-mcp](./mybacklinks-mcp) | AI 助手 MCP 服务器 | 后端 API 集成 |
| [skills/blog-commenter-skill](./skills/blog-commenter-skill) | 自动博客评论提交 | **博客**外链 |
| [skills/backlink-submission-skill](./skills/backlink-submission-skill) | AI + 浏览器自动化 | **目录站/论坛/社交**外链 |
| [skills/seo-research-skill](./skills/seo-research-skill) | 基于 CLI 的 SEO 研究工作流 | **域名指标 / 外链审计** |
| [commands](./commands) | 统一工作流命令 | 流程编排 |

### 技能选择指南

| 资源类型 | 推荐技能 | 实现方式 |
|---------|---------|---------|
| `blog` 博客 | **blog-commenter-skill** | 脚本自动化 (WordPress, Ghost, Disqus) |
| `directory` 目录站 | **backlink-submission-skill** | AI + 浏览器自动化 |
| `forum` 论坛 | **backlink-submission-skill** | AI + 浏览器自动化 |
| `social` 社交平台 | **backlink-submission-skill** | AI + 浏览器自动化 |
| `other` 其他 | **backlink-submission-skill** | AI + 浏览器自动化 |

### 快速开始

#### 方式一：使用统一工作流

参见 [commands/submit-backlinks.md](./commands/submit-backlinks.md)，该工作流会根据资源类型自动选择合适的技能。

```
/submit-backlinks aimcp.info
/submit-backlinks lovemoney.app blog
/submit-backlinks myproject.com directory
```

#### 方式二：直接使用技能

**CLI SEO 研究：**
```bash
npm install -g @mybacklinks/cli
mybacklinks login
mybacklinks fetch-dr-by-domain --domain example.com
```

**博客评论：**
```bash
cd skills/blog-commenter-skill
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "我的项目" \
  --domain "myproject.com" \
  --submit
```

**目录站/论坛提交：**
```
让 AI 执行："使用 backlink-submission-skill 提交目录站外链"
```

### 关于 MyBacklinks

MyBacklinks 是一个专为独立开发者和副业项目构建者设计的综合外链管理平台。我们帮助你：

- 📊 **管理项目**：在一个地方管理多个副业项目
- 🔗 **管理外链**：跟踪已提交的外链、状态和锚文本
- 📈 **监控 SEO**：分析域名评级、链接表现和提交历史
- 🌐 **发现资源**：寻找高质量的外链机会网站

### 贡献

我们欢迎贡献！每个软件包都有自己的贡献指南。

### 许可证

所有软件包均以 MIT 许可证发布。

### 链接

- 🌐 [MyBacklinks 网站](https://mybacklinks.app)
- 📚 [文档](https://docs.mybacklinks.app)
- 📖 [MCP 设置指南](https://hekmon8.github.io/mybacklinks-tools) - GitHub Pages
- 🐛 [报告问题](https://github.com/hekmon8/mybacklinks-tools/issues)
- 💬 [讨论区](https://github.com/hekmon8/mybacklinks-tools/discussions)
