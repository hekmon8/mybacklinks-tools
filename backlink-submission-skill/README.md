# Backlink Submission Skill

Automate backlink submission workflow using MyBacklinks MCP and browser automation.

## Features

- 🔗 **Auto-fetch** project info and available backlink resources
- 🤖 **AI-powered** form filling based on `howToSubmit` instructions
- 🌐 **Browser automation** via chrome-dev-tools MCP
- 📊 **Progress tracking** with detailed submission reports
- 🆓 **Free resources only** - automatically skips paid resources

## Installation

### From Marketplace

```bash
# Add the marketplace first (one-time setup)
claude plugin marketplace add mybacklinks https://raw.githubusercontent.com/hekmon8/mybacklinks-tools/main/packages/opensource/marketplace.json

# Install the skill
claude plugin install backlink-submission-skill@mybacklinks
```

### Manual Installation

Clone the repository and copy to your skills directory:

```bash
git clone https://github.com/hekmon8/mybacklinks-tools.git
cp -r mybacklinks-tools/backlink-submission-skill ~/.claude/skills/
```

### Validate Installation

```bash
claude plugin validate ~/.claude/skills/backlink-submission-skill
```

## Prerequisites

This skill requires two MCP servers to be configured:

### 1. MyBacklinks MCP

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

### 2. Chrome DevTools MCP

Follow your preferred browser automation MCP setup.

## Usage

Trigger the skill by saying:

- "Submit backlinks to [project name]"
- "提交外链"
- "批量提交外链"
- "Auto submit backlinks"

## Workflow

1. **Select Project** - List and choose target project
2. **Fetch Resources** - Get available free backlink resources
3. **Execute Submission** - Follow `howToSubmit` instructions for each resource
4. **Record Results** - Update backlink status in MyBacklinks

## howToSubmit Format

The `howToSubmit` field in backlink resources should be Markdown formatted:

```markdown
## 提交方式

1. 访问 https://example.com/submit
2. 无需登录
3. 填写表单：
   - **Website Name**: 填写网站名称
   - **URL**: 填写项目网址
   - **Description**: 填写描述
4. 点击 "Submit" 按钮

## 注意事项
- 限制条件说明
```

## Examples

See [examples/howto-templates.md](examples/howto-templates.md) for common submission templates.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related

- [MyBacklinks](https://mybacklinks.app) - Backlink management platform
- [MyBacklinks MCP](../mybacklinks-mcp/) - MCP server for MyBacklinks

