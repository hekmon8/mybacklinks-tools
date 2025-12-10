# Blog Commenter Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Claude Code Skill for **automated blog comment posting**. Intelligently detects comment forms across various blog platforms (WordPress, Ghost, Disqus, etc.) and posts contextually relevant comments.

> **📝 For directory/forum/social submissions, use [backlink-submission-skill](../backlink-submission-skill/)** - it uses AI + browser automation for non-blog resources.

## When to Use This Skill

| Resource Type | Use This Skill? |
|---------------|-----------------|
| `blog` | ✅ **Yes** - optimized for blog platforms |
| `directory` | ❌ Use backlink-submission-skill |
| `forum` | ❌ Use backlink-submission-skill |
| `social` | ❌ Use backlink-submission-skill |

## Features

- 🔍 **Smart Form Detection** - Automatically detects comment forms on WordPress, Ghost, and generic blogs
- 💬 **Contextual Comments** - Generates comments based on article content and your project info
- 🔐 **Login Support** - Handles form-based and OAuth login when required
- 📸 **Screenshot Recording** - Documents each submission for verification
- 🌐 **Multi-language Support** - Works with blogs in various languages

## Installation

### Option 1: Claude Code Plugin (Recommended)

```bash
# Add marketplace
claude mcp add marketplace mybacklinks https://github.com/user/mybacklinks-tools

# Install skill
claude skill install blog-commenter-skill
```

### Option 2: Manual Installation

```bash
# Clone to your skills directory
git clone https://github.com/user/blog-commenter-skill.git ~/.claude/skills/blog-commenter-skill

# Navigate and setup
cd ~/.claude/skills/blog-commenter-skill
npm run setup
```

## Quick Start

### As a Claude Skill

Simply ask Claude:

```
Submit a comment on https://blog.example.com/post for my project AIMCP (aimcp.info)
```

### CLI Usage

```bash
# Navigate to skill directory (after installation)
cd ~/.claude/skills/blog-commenter-skill

# Dry run (fill form without submitting)
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "AIMCP" \
  --domain "aimcp.info" \
  --description "AI MCP Server Directory"

# Actually submit
node submit-backlink.js \
  --url "https://blog.example.com/post" \
  --project "AIMCP" \
  --domain "aimcp.info" \
  --submit
```

## CLI Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--url` | ✅ | - | Blog post URL |
| `--project` | ✅ | - | Project name |
| `--domain` | ✅ | - | Project domain |
| `--description` | ❌ | - | Project description |
| `--email` | ❌ | `cc@{domain}` | Commenter email |
| `--password` | ❌ | `12345678` | Password for login |
| `--submit` | ❌ | false | Actually submit (dry run if omitted) |
| `--output` | ❌ | - | Save result to JSON file |

## Supported Platforms

### Fully Supported (Anonymous Comments)

| Platform | Detection | Fields |
|----------|-----------|--------|
| WordPress | ✅ | 5/5 |
| Ghost (some themes) | ✅ | Varies |
| Custom PHP blogs | ✅ | Varies |

### Partially Supported (Login Required)

| Platform | Login Method |
|----------|--------------|
| Disqus | OAuth/Email |
| Medium | OAuth |
| Dev.to | OAuth |

## Skill Comparison

| Feature | blog-commenter-skill | backlink-submission-skill |
|---------|---------------------|--------------------------|
| **Target** | Blogs only | Directories, forums, social |
| **Method** | Dedicated scripts | AI + browser automation |
| **howToSubmit** | Optional | Required for best results |
| **Platforms** | WordPress, Ghost, Disqus | Any website |

## API Functions

```javascript
const {
  detectCommentForm,    // Detect comment form on page
  fillCommentForm,      // Fill detected form
  extractArticleContent,// Extract article content
  createCommentData,    // Generate comment data
  attemptLogin,         // Attempt login if required
  takeScreenshot        // Take screenshot
} = require('./lib/helpers');
```

## Integration with MyBacklinks MCP

This skill is designed to work with [MyBacklinks MCP](https://mybacklinks.app/mcp) for automated backlink submission workflows:

1. Use `discoverBacklinkOpportunities` to find blog resources
2. Use this skill to submit comments
3. Use `upsertProjectBacklink` to record submissions

## Related

- [backlink-submission-skill](../backlink-submission-skill/) - For directory/forum/social submissions
- [mybacklinks-mcp](../mybacklinks-mcp/) - MCP server for MyBacklinks
- [commands](../commands/) - Unified workflow commands

## Dependencies

- Node.js >= 16.0.0
- Playwright ^1.48.0

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

## Support

- [GitHub Issues](https://github.com/user/blog-commenter-skill/issues)
- [MyBacklinks Documentation](https://mybacklinks.app/docs)
