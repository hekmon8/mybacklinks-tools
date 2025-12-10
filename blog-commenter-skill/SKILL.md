---
name: Blog Commenter
description: Automated blog comment posting for marketing and outreach
version: 1.0.0
author: MyBacklinks
triggers:
  - post blog comment
  - submit blog comment
  - comment on blog
  - blog outreach
dependencies:
  - playwright
---

# Blog Commenter Skill

Automated blog comment posting for marketing and outreach.

A Claude Skill that enables automated comment posting on blog articles for marketing purposes. It intelligently detects comment forms across various blog platforms (WordPress, Ghost, Disqus, custom forms, etc.) and posts contextually relevant comments based on article content and project information.

> **📝 For directory/forum/social submissions, use [backlink-submission-skill](../backlink-submission-skill/)** - it uses AI + browser automation for non-blog resources.

## When to Use This Skill

| Resource Type | Use This Skill? |
|---------------|-----------------|
| `blog` | ✅ **Yes** - optimized for blog platforms |
| `directory` | ❌ Use backlink-submission-skill |
| `forum` | ❌ Use backlink-submission-skill |
| `social` | ❌ Use backlink-submission-skill |

## CLI Script: submit-backlink.js

Submit a single blog comment via command line:

```bash
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
  --submit \
  --output /tmp/result.json
```

**Parameters:**
| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--url` | ✅ | - | Blog post URL |
| `--project` | ✅ | - | Project name |
| `--domain` | ✅ | - | Project domain |
| `--description` | ❌ | - | Project description |
| `--email` | ❌ | `cc@{domain}` | Commenter email |
| `--password` | ❌ | `12345678` | Password for login |
| `--submit` | ❌ | false | Actually submit |
| `--output` | ❌ | - | Save result to JSON file |

## API Reference

### extractArticleContent(page)

Extracts main article content from the page.

```javascript
const content = await extractArticleContent(page);
// Returns: { title, content, tags, url }
```

### createCommentData(options)

Creates comment data with auto-generated contextual comment.

```javascript
const commentData = createCommentData({
  projectName: 'AIMCP',
  projectUrl: 'https://aimcp.info',
  projectDescription: 'AI MCP Server Directory',
  articleContent,
  commenterName: 'Team AIMCP',
  commenterEmail: 'cc@aimcp.info'
});
// Returns: { name, email, website, comment }
```

### detectCommentForm(page)

Detects comment form on the page.

```javascript
const formInfo = await detectCommentForm(page);
// Returns: { found, platform, fields, requiresAuth, iframe }
```

### fillCommentForm(page, formInfo, data, submit)

Fills and optionally submits the comment form.

```javascript
await fillCommentForm(page, formInfo, commentData, true);
```

### Login Helpers

```javascript
// Detect if login is required
const loginInfo = await detectLoginRequirement(page);

// Attempt login
await attemptLogin(page, { email, password }, 'wordpress');

// Save/load auth state
await saveAuthState(context, './auth.json');
const ctx = await loadAuthState(browser, './auth.json');
```

## Supported Platforms

### Fully Supported (Anonymous Comments)
| Platform | Detection | Fields |
|----------|-----------|--------|
| WordPress | ✅ | 5/5 |
| Ghost | ✅ | Varies |
| Custom PHP | ✅ | Varies |

### Partially Supported (Login Required)
| Platform | Login Method |
|----------|--------------|
| Disqus | OAuth/Email |
| Dev.to | OAuth |
| Medium | OAuth |

## Files

```
blog-commenter-skill/
├── SKILL.md           # This documentation (skill entry point)
├── README.md          # Installation and usage guide
├── package.json       # Dependencies
├── run.js             # Universal executor
├── submit-backlink.js # CLI submission script
├── LICENSE            # MIT License
└── lib/
    └── helpers.js     # Core utilities
```

## Setup

```bash
npm run setup
```

## Dependencies

- Node.js >= 16.0.0
- Playwright ^1.48.0

## Related

- [backlink-submission-skill](../backlink-submission-skill/) - For directory/forum/social submissions
- [mybacklinks-mcp](../mybacklinks-mcp/) - MCP server for MyBacklinks
- [commands](../commands/) - Unified workflow commands

