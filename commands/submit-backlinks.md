# Submit Backlinks Workflow

Automated backlink submission workflow. AI intelligently selects appropriate skills to execute submissions based on resource type.

## Usage

```
/submit-backlinks <domain> [type]
```

**Parameters:**
- `domain` (required): Project domain (e.g., `aimcp.info`, `lovemoney.app`)
- `type` (optional): Resource type filter (`blog`, `directory`, `forum`, `social`, `all`). Default: `all`

**Examples:**
```
/submit-backlinks aimcp.info
/submit-backlinks lovemoney.app blog
/submit-backlinks myproject.com directory
```

## Skill Division

| Resource Type | Recommended Skill | Description |
|---------------|-------------------|-------------|
| `blog` | **blog-commenter-skill** | Script automation, supports WordPress/Ghost/Disqus etc. |
| `directory` | **backlink-submission-skill** | AI + Browser automation |
| `forum` | **backlink-submission-skill** | AI + Browser automation |
| `social` | **backlink-submission-skill** | AI + Browser automation |
| `other` | **backlink-submission-skill** | AI + Browser automation |

---

## Workflow

### Step 1: Get Project Information

Call MCP `getProjectDetail`:
```
Get project details for domain {domain}
```

Record: projectId, name, description

### Step 2: Discover Backlink Opportunities

Call MCP `discoverBacklinkOpportunities`:
```
Discover backlink opportunities for {domain}, type filter: {type}
```

### Step 3: Group Processing by Type

Group backlink opportunities by `type`:
- **Blog types** → Use blog-commenter-skill
- **Non-blog types** → Use backlink-submission-skill

---

## Blog Type Processing (blog-commenter-skill)

> Use dedicated blog commenting script with form detection and auto-fill capabilities

### Execute Script

```bash
cd packages/opensource/skills/blog-commenter-skill

node submit-backlink.js \
  --url "{submissionUrl}" \
  --project "{projectName}" \
  --domain "{projectDomain}" \
  --description "{projectDescription}" \
  --email "cc@{projectDomain}" \
  --password "12345678" \
  --submit \
  --output /tmp/result-{resourceDomain}.json
```

### Script Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--url` | ✅ | - | Blog post URL |
| `--project` | ✅ | - | Project name |
| `--domain` | ✅ | - | Project domain |
| `--description` | ❌ | - | Project description |
| `--email` | ❌ | `cc@{domain}` | Commenter email |
| `--password` | ❌ | `12345678` | Login password |
| `--submit` | ❌ | false | Actual submission (test mode if omitted) |
| `--output` | ❌ | - | Save results to JSON file |

### Supported Platforms

| Platform | Support Level | Login Requirement |
|----------|---------------|-------------------|
| WordPress | ✅ Full support | Usually no login required |
| Ghost | ✅ Full support | Depends on theme |
| Custom PHP | ✅ Full support | Depends on site |
| Disqus | ⚠️ Partial support | Requires OAuth/Email login |
| Dev.to | ⚠️ Partial support | Requires OAuth |
| Medium | ⚠️ Partial support | Requires OAuth |

### Processing Logic

1. **No howToSubmit instructions** → Execute script directly
2. **Has howToSubmit instructions** → Read instructions to determine if script can be used
   - Usable → Execute script
   - Has special requirements → Switch to backlink-submission-skill for processing

---

## Non-Blog Type Processing (backlink-submission-skill)

> Use AI + chrome-devtools browser automation to execute submissions based on howToSubmit instructions

### Load Skill

```bash
openskills read chrome-devtools
```

### Execution Flow

#### 1. Get Resource Details

Call MCP `getBacklinkResourceDetail`:
```
Get details for resource {resourceId}
```

Key fields:
- `domain`: Resource domain
- `type`: directory, forum, social, other
- `submissionUrl`: Submission URL
- `howToSubmit`: Submission instructions (Markdown format)

#### 2. Parse howToSubmit

Read the resource's `howToSubmit` field to understand submission steps:

```markdown
## Submission Method

1. Visit https://example.com/submit
2. No login required / Use Google login
3. Fill form:
   - **Website Name**: Enter website name
   - **URL**: Enter project website
   - **Description**: Enter 50-100 word English description
   - **Category**: Select "Tools" or "SaaS"
4. Click "Submit" button
5. Wait for email confirmation (usually 1-3 days)

## Notes
- Chinese content not accepted
- Limited to 3 websites per account
```

#### 3. Browser Automation Execution

Execute using chrome-devtools:

1. **Navigation** → Open submissionUrl
2. **Screenshot** → Save initial page state
3. **Login Handling**:
   - Prefer Google OAuth (if already logged in)
   - Or use `cc@{domain}` / `12345678` login
   - Skip on login failure, mark as `login_required`
4. **Fill Form** → Fill according to howToSubmit instructions
5. **Submit** → Click submit button
6. **Verify** → Check submission result
7. **Screenshot** → Save post-submission state

#### 4. Update howToSubmit (After First Successful Submission)

If first successful submission or better flow discovered, call MCP `updateBacklinkResource`:

```
Update resource {resourceId}:
- howToSubmit: |
  ## How to Submit on {resourceDomain}

  1. Visit {submissionUrl}
  2. {Login instructions}
  3. Fill form: {Form fields}
  4. Click submit

  **Notes:** {Special requirements}
```

---

## Result Recording

### Local Recording

Save to `tasks/backlink-submission/{domain}-{timestamp}.json`:

```json
{
  "domain": "{projectDomain}",
  "submittedAt": "ISO timestamp",
  "results": [
    {
      "resourceId": "{id}",
      "resourceDomain": "{domain}",
      "type": "blog|directory|forum|social|other",
      "status": "submitted|failed|skipped|login_required",
      "method": "blog-commenter-skill|backlink-submission-skill",
      "notes": "Submission notes"
    }
  ]
}
```

### Remote Recording

Call MCP `upsertProjectBacklink`:
```
Add backlink to project:
- projectId: {projectId}
- resourceId: {resourceId}
- targetUrl: https://{domain}
- status: submitted
- notes: "Submitted via automated workflow on {date}"
```

---

## Final Report

```markdown
# Backlink Submission Report

**Project:** {projectName} ({domain})
**Time:** {timestamp}
**Type:** {type}

## Summary

| Status | Count |
|--------|-------|
| ✅ Submitted | {n} |
| ❌ Failed | {n} |
| 🔐 Login Required | {n} |
| ⏭️ Skipped | {n} |

## Grouped by Skill

### blog-commenter-skill (Blog Comments)
- {blog1.com} - ✅ Comment published
- {blog2.com} - ⚠️ Login required

### backlink-submission-skill (Directory/Forum etc.)
- {directory1.com} - ✅ Submitted, pending review
- {forum1.com} - ❌ CAPTCHA blocked

## Manual Handling Required
- {domain} - Reason: {reason}
```

---

## Default Configuration

```javascript
// Default credentials
email: "cc@{projectDomain}"
password: "12345678"
```

## Skills Dependencies

| Skill | Purpose | Applicable Types |
|-------|---------|------------------|
| **blog-commenter-skill** | Automated blog comment submission | blog |
| **backlink-submission-skill** | AI + Browser automation | directory, forum, social, other |
| **chrome-devtools** | Browser operation underlying support | Called by backlink-submission-skill |

## Related Links

- [blog-commenter-skill](../skills/blog-commenter-skill/) - Blog commenting skill
- [backlink-submission-skill](../skills/backlink-submission-skill/) - General backlink submission skill
- [mybacklinks-mcp](../mybacklinks-mcp/) - MCP server
