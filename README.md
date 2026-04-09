# MyBacklinks Open Source

**English** | [中文](./README.zh-CN.md)

---

This directory contains open source packages from [MyBacklinks](https://mybacklinks.app).

## Packages

| Package | Description | npm | Use Case |
|---------|-------------|-----|----------|
| [mybacklink-cli](./mybacklink-cli) | Official npm CLI package | [![npm](https://img.shields.io/npm/v/@mybacklinks/cli)](https://www.npmjs.com/package/@mybacklinks/cli) | Command-line automation |
| [mybacklinks-mcp](./mybacklinks-mcp) | MCP server for AI assistants | — | Backend API integration |
| [skills/blog-commenter-skill](./skills/blog-commenter-skill) | Automated blog comment posting | — | **Blog** backlinks |
| [skills/mybacklinks-cli-domain-analysis](./skills/mybacklinks-cli-domain-analysis) | Domain SEO metrics & backlink research | — | **Domain DR / traffic / competitor analysis** |
| [skills/mybacklinks-cli-campaign-tracking](./skills/mybacklinks-cli-campaign-tracking) | Project & link-building campaign management | — | **Project tracking / backlink campaigns** |
| [skills/mybacklinks-cli-resource-management](./skills/mybacklinks-cli-resource-management) | Backlink opportunity database management | — | **Directory / guest post / forum resources** |
| [commands](./commands) | Unified workflow commands | — | Orchestration |

## Skill Selection Guide

| Task | Recommended Skill | Method |
|------|------------------|--------|
| Blog comment backlinks | **blog-commenter-skill** | Scripts (WordPress, Ghost, Disqus) |
| Check domain DR / traffic | **mybacklinks-cli-domain-analysis** | CLI (`mybacklinks` commands) |
| Discover competitor backlinks | **mybacklinks-cli-domain-analysis** | CLI (`mybacklinks` commands) |
| Manage projects & track campaigns | **mybacklinks-cli-campaign-tracking** | CLI (`mybacklinks` commands) |
| Build backlink opportunity database | **mybacklinks-cli-resource-management** | CLI (`mybacklinks` commands) |

## Quick Start

### Option 1: Use the Unified Workflow

See [commands/submit-backlinks.md](./commands/submit-backlinks.md) for the complete workflow that automatically routes to the right skill based on resource type.

```
/submit-backlinks aimcp.info
/submit-backlinks lovemoney.app blog
/submit-backlinks myproject.com directory
```

### Option 2: Use Skills Directly

**Domain Analysis (via CLI):**
```bash
npm install -g @mybacklinks/cli
mybacklinks login
mybacklinks fetch-dr-by-domain --domain example.com
```

**Blog Comments:**
```bash
cd skills/blog-commenter-skill
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "MyProject" \
  --domain "myproject.com" \
  --submit
```

**Campaign Tracking / Resource Management:**
```
Ask AI: "List my projects and their backlink status"
Ask AI: "Find backlink opportunities for directories"
```

## About MyBacklinks

MyBacklinks is a comprehensive backlink management platform designed for indie hackers and side project builders. We help you:

- 📊 **Track Projects**: Manage multiple side projects in one place
- 🔗 **Manage Backlinks**: Track submitted backlinks, their status, and anchor text
- 📈 **Monitor SEO**: Analyze domain ratings, link performance, and submission history
- 🌐 **Discover Resources**: Find high-quality websites for backlink opportunities

## Contributing

We welcome contributions! Each package has its own contributing guidelines.

## CLI Release (npm)

- `publish-cli.yml` listens for `cli-v*` tags and publishes [`@mybacklinks/cli`](https://www.npmjs.com/package/@mybacklinks/cli) to npm.
- Release flow: bump `mybacklink-cli/package.json`, then push a matching `cli-v*` tag.
- Configure repository secret: `NPM_TOKEN`.

## License

All packages are released under the MIT License.

## Links

- 🌐 [MyBacklinks Website](https://mybacklinks.app)
- 📚 [Documentation](https://docs.mybacklinks.app)
- 📖 [MCP Setup Guide](https://hekmon8.github.io/mybacklinks-tools) - GitHub Pages
- 🐛 [Report Issues](https://github.com/hekmon8/mybacklinks-tools/issues)
