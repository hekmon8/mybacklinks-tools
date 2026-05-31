# MyBacklinks 开源项目

[English](./README.md) | **中文**

---

本目录包含 [MyBacklinks](https://mybacklinks.app) 的开源软件包。

## 软件包

| 软件包 | 描述 | npm | 适用场景 |
|--------|------|-----|----------|
| [mybacklink-cli](./mybacklink-cli) | 官方 npm CLI 包 | [![npm](https://img.shields.io/npm/v/@mybacklinks/cli)](https://www.npmjs.com/package/@mybacklinks/cli) | 命令行自动化 |
| [mybacklinks-mcp](./mybacklinks-mcp) | AI 助手 MCP 服务器 | — | 后端 API 集成 |
| [skills/blog-commenter-skill](./skills/blog-commenter-skill) | 自动博客评论提交 | — | **博客**外链 |
| [skills/mybacklinks-cli-domain-analysis](./skills/mybacklinks-cli-domain-analysis) | 域名 SEO 指标与外链研究 | — | **域名 DR / 流量 / 竞品分析** |
| [skills/mybacklinks-cli-campaign-tracking](./skills/mybacklinks-cli-campaign-tracking) | 项目与外链活动管理 | — | **项目跟踪 / 外链活动** |
| [skills/mybacklinks-cli-resource-management](./skills/mybacklinks-cli-resource-management) | 外链机会数据库管理 | — | **目录站 / 客座文章 / 论坛资源** |
| [commands](./commands) | 统一工作流命令 | — | 流程编排 |

## 技能选择指南

| 任务 | 推荐技能 | 实现方式 |
|------|---------|---------|
| 博客评论外链 | **blog-commenter-skill** | 脚本自动化 (WordPress, Ghost, Disqus) |
| 查询域名 DR / 流量 | **mybacklinks-cli-domain-analysis** | CLI (`mybacklinks` 命令) |
| 发现竞品外链 | **mybacklinks-cli-domain-analysis** | CLI (`mybacklinks` 命令) |
| 管理项目与跟踪活动 | **mybacklinks-cli-campaign-tracking** | CLI (`mybacklinks` 命令) |
| 构建外链机会数据库 | **mybacklinks-cli-resource-management** | CLI (`mybacklinks` 命令) |

## 快速开始

### 方式一：使用统一工作流

参见 [commands/submit-backlinks.md](./commands/submit-backlinks.md)，该工作流会根据资源类型自动选择合适的技能。

```
/submit-backlinks aimcp.info
/submit-backlinks lovemoney.app blog
/submit-backlinks myproject.com directory
```

### 方式二：直接使用技能

**域名分析（通过 CLI）：**
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

**活动跟踪 / 资源管理：**
```
让 AI 执行："列出我的项目和外链状态"
让 AI 执行："查找目录站外链机会"
```

## 关于 MyBacklinks

MyBacklinks 是一个专为独立开发者和副业项目构建者设计的综合外链管理平台。我们帮助你：

- 📊 **管理项目**：在一个地方管理多个副业项目
- 🔗 **管理外链**：跟踪已提交的外链、状态和锚文本
- 📈 **监控 SEO**：分析域名评级、链接表现和提交历史
- 🌐 **发现资源**：寻找高质量的外链机会网站

## 贡献

我们欢迎贡献！每个软件包都有自己的贡献指南。

## CLI 发布（npm）

- `publish-cli.yml` 监听 `cli-v*` tag，自动发布 [`@mybacklinks/cli`](https://www.npmjs.com/package/@mybacklinks/cli) 到 npm。
- 发布流程：先更新 `mybacklink-cli/package.json` 版本，再 push 对应的 `cli-v*` tag。
- 优先使用 npm Trusted Publishing，配置仓库为 `hekmon8/mybacklinks-tools`，workflow 文件为 `publish-cli.yml`。

## 许可证

所有软件包均以 MIT 许可证发布。

## 链接

- 🌐 [MyBacklinks 网站](https://mybacklinks.app)
- 📚 [文档](https://docs.mybacklinks.app)
- 📖 [MCP 设置指南](https://hekmon8.github.io/mybacklinks-tools) - GitHub Pages
- 🐛 [报告问题](https://github.com/hekmon8/ai-cf-mybacklinks/issues)
