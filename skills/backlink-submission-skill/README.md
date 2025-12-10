# Backlink Submission Skill (Non-Blog)

Automate backlink submission for **directories, forums, and other non-blog resources** using AI and browser automation.

> **📝 For blog comments, use [blog-commenter-skill](../blog-commenter-skill/)** - it has dedicated scripts supporting WordPress, Ghost, Disqus, and more.

## Supported Resource Types

| Type | Supported | Examples |
|------|-----------|----------|
| `directory` | ✅ | Product Hunt, AlternativeTo, SaaSHub |
| `forum` | ✅ | Reddit, Indie Hackers, HackerNews |
| `social` | ✅ | Twitter/X profiles, LinkedIn, etc. |
| `other` | ✅ | Miscellaneous resources |
| `blog` | ❌ | Use blog-commenter-skill instead |

## Features

- 🔗 **Auto-fetch** project info and available backlink resources
- 🤖 **AI-powered** form filling based on `howToSubmit` instructions
- 🌐 **Browser automation** via chrome-dev-tools MCP
- 📊 **Progress tracking** with detailed submission reports
- 🆓 **Free resources only** - automatically skips paid resources

## Installation

### From GitHub (Recommended)

```bash
# Add the marketplace
claude plugin marketplace add hekmon8/mybacklinks-tools

# Install the skill
claude plugin install backlink-submission-skill
```

### Manual Installation

```bash
git clone https://github.com/hekmon8/mybacklinks-tools.git
cp -r mybacklinks-tools/packages/opensource/backlink-submission-skill ~/.claude/skills/
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

- "Submit directory backlinks to [project name]"
- "Submit forum backlinks"
- "批量提交非博客外链"
- "Auto submit directory listings"

## Workflow

1. **Select Project** - List and choose target project
2. **Fetch Resources** - Get available free non-blog backlink resources
3. **Execute Submission** - AI follows `howToSubmit` instructions using browser automation
4. **Record Results** - Update backlink status in MyBacklinks

## Skill Comparison

| Feature | backlink-submission-skill | blog-commenter-skill |
|---------|--------------------------|---------------------|
| **Target** | Directories, forums, social | Blogs only |
| **Method** | AI + browser automation | Dedicated scripts |
| **howToSubmit** | Required for best results | Optional |
| **Platforms** | Any website | WordPress, Ghost, Disqus |

## howToSubmit Format

The `howToSubmit` field in backlink resources should be Markdown formatted:

```markdown
## Submission Method

1. Navigate to https://example.com/submit
2. Login with Google (or none required)
3. Fill out the form:
   - **Website Name**: Enter website name
   - **URL**: Enter project URL
   - **Description**: 50-100 word description
4. Click "Submit" button

## Important Notes
- English content only
- Max 3 submissions per account
```

## Examples

See [examples/howto-templates.md](examples/howto-templates.md) for common submission templates.

## Related

- [blog-commenter-skill](../blog-commenter-skill/) - For blog comment submissions
- [mybacklinks-mcp](../../mybacklinks-mcp/) - MCP server for MyBacklinks
- [commands](../../commands/) - Unified workflow commands

## License

MIT License - see [LICENSE](LICENSE) for details.
