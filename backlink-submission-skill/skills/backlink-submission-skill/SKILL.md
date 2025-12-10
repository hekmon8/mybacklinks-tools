---
name: Backlink Submission (Non-Blog)
description: Automate backlink submission for directories, forums, and other non-blog resources using AI and browser automation
version: 1.1.0
author: MyBacklinks
triggers:
  - submit backlinks
  - submit directory backlinks
  - submit forum backlinks
  - batch submit non-blog backlinks
  - automate backlink outreach
dependencies:
  - mybacklinks
  - chrome-dev-tools
---

# Backlink Submission Skill (Non-Blog)

自动化外链提交技能，**专门处理非博客类型**的外链资源（目录站、论坛、社交平台等）。

> **📝 博客外链请使用 [blog-commenter-skill](../../blog-commenter-skill/)** - 它有专门的脚本支持 WordPress、Ghost、Disqus 等博客平台。

## 适用范围

| 类型 | 本技能支持 | 说明 |
|------|-----------|------|
| `directory` | ✅ | 目录站、产品目录、工具列表 |
| `forum` | ✅ | 论坛、社区、问答平台 |
| `social` | ✅ | 社交媒体、Profile 页面 |
| `other` | ✅ | 其他类型资源 |
| `blog` | ❌ | **请使用 blog-commenter-skill** |

## Trigger Conditions

This Skill activates when users request:
- "Submit directory backlinks"
- "Submit forum backlinks"
- "Batch submit non-blog backlinks to [project name]"
- "Automate directory listing submission"

## Required Tools

| MCP Tool | Purpose |
|----------|---------|
| `mybacklinks` | Fetch projects, backlink resources, and record submission results |
| `chrome-dev-tools` | Browser automation for form filling and submission |

## Execution Workflow

### Phase 1: Fetch Project Information

1. Call `listProjects` to retrieve all projects from MyBacklinks.app
2. Display project list for user selection
3. Call `getProjectDetail` to fetch:
   - Project name
   - Project description
   - Project domain
   - Project URL

**Example Output:**
```
Project: MyBacklinks
URL: https://mybacklinks.app
Description: Backlink management platform for indie hackers
```

### Phase 2: Retrieve Available Resources

1. Call `discoverBacklinkOpportunities` to get backlink resources:
   ```json
   {
     "projectId": "<selected_project_id>",
     "filter": {
       "payment": "free",
       "types": ["directory", "forum", "social", "other"]
     },
     "limit": 50
   }
   ```

2. Filter criteria:
   - `paymentType = "free"` (free resources only)
   - `type != "blog"` (exclude blog type - use blog-commenter-skill instead)
   - Prefer resources with `howToSubmit` field populated

3. Display resource list for confirmation:
   ```
   Found X submittable non-blog backlink resources:
   1. example-directory.com (DR: 45) - directory
   2. startup-forum.com (DR: 38) - forum
   3. social-profile.com (DR: 52) - social
   ...
   Proceed with submission? (Blog resources excluded - use blog-commenter-skill)
   ```

### Phase 3: Execute Submissions

For each resource:

#### 3.1 Load Chrome DevTools

```bash
openskills read chrome-devtools
```

#### 3.2 Parse howToSubmit

Read the resource's `howToSubmit` field (Markdown format) to understand submission steps.

**howToSubmit Example:**
```markdown
## Submission Method

1. Navigate to https://example.com/submit
2. Login with Google account
3. Fill out the form:
   - **Website Name**: Enter your website name
   - **URL**: Enter your project URL
   - **Description**: Write a 50-100 word English description
   - **Category**: Select "Tools" or "SaaS"
4. Click the "Submit" button
5. Wait for email confirmation (typically 1-3 days)

## Important Notes
- Chinese content not accepted
- Each account limited to 3 website submissions
```

#### 3.3 Generate Submission Content

| Field | Generation Rule |
|-------|-----------------|
| **Website Name** | Project name |
| **URL** | Project URL |
| **Description** | Generate 50-100 word description based on project info |
| **Anchor Text** | Brand name, keyword, or URL |

**Anchor Text Strategy:**
- **Brand Anchor**: Project name (e.g., "MyBacklinks")
- **URL Anchor**: Domain (e.g., "mybacklinks.app")
- **Keyword Anchor**: Core keywords (e.g., "backlink management")
- **Mixed Anchor**: "Name - Feature" (e.g., "MyBacklinks - SEO Tool")

#### 3.4 Browser Automation

Use `chrome-dev-tools` MCP:

1. **Navigate**: Open submission URL
2. **Screenshot**: Save initial page state
3. **Login** (if required):
   - Prefer Google OAuth (if already logged in)
   - Or use `cc@{domain}` / `12345678`
   - If login fails, skip and mark as `login_required`
4. **Fill Form**: Complete form per howToSubmit instructions
5. **Submit**: Click submit button
6. **Verify**: Check for success confirmation
7. **Screenshot**: Save final state

**Example Execution:**
```
→ Navigate to https://example-directory.com/submit
→ Wait for page load
→ Screenshot: /tmp/before-submit.png
→ Login with Google OAuth
→ Fill "Website Name": MyBacklinks
→ Fill "URL": https://mybacklinks.app
→ Fill "Description": [generated description]
→ Select "Category": Tools
→ Click "Submit" button
→ Verify: Success message detected
→ Screenshot: /tmp/after-submit.png
```

#### 3.5 Record Results

Call `upsertProjectBacklink` to record results:

```json
{
  "projectId": "<project_id>",
  "resourceId": "<resource_id>",
  "targetUrl": "<project_url>",
  "backlinkUrl": "<submission_url>",
  "anchor": "<generated_anchor>",
  "status": "submitted",
  "notes": "Auto-submitted via backlink-submission-skill at 2024-01-15"
}
```

#### 3.6 Update howToSubmit (if needed)

For successful first-time submissions, or when better instructions are discovered, call `updateBacklinkResource`:

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

### Phase 4: Summary Report

```markdown
## Non-Blog Backlink Submission Report

**Project**: MyBacklinks
**Time**: 2024-01-15 10:30
**Skill**: backlink-submission-skill

### Statistics
- ✅ Successfully Submitted: 8
- ⏳ Pending Review: 3
- ❌ Failed: 1
- ⏭️ Skipped: 2 (login required)

### Details

| Resource | Type | Status | Notes |
|----------|------|--------|-------|
| example-directory.com | directory | ✅ Submitted | Awaiting confirmation |
| startup-forum.com | forum | ✅ Submitted | - |
| paid-directory.com | directory | ⏭️ Skipped | Paid resource |

### Next Steps
1. Check inbox for confirmation emails
2. Check indexing status after 3 days
3. Consider using blog-commenter-skill for blog resources
```

## Error Handling

| Error Type | Handling |
|------------|----------|
| Page load failure | Retry 3 times, skip if still failing |
| Login required (no creds) | Skip, mark as "requires manual handling" |
| Form submission failed | Save screenshot, mark status=pending |
| Paid resource | Skip, only process free resources |
| CAPTCHA | Skip, prompt user for manual handling |
| Blog resource detected | Skip, suggest using blog-commenter-skill |

## howToSubmit Format

```markdown
## Submission Method

1. Navigate to [Submission URL]
2. [Login requirements - Google OAuth / email / none]
3. Fill out the form:
   - **Field Name**: Instructions
   - ...
4. [Submit button instructions]
5. [Post-submission steps]

## Important Notes
- [Restrictions]
- [Special requirements]
```

## Related Skills

| Skill | Purpose | Resource Types |
|-------|---------|----------------|
| **blog-commenter-skill** | Automated blog comment posting | `blog` |
| **backlink-submission-skill** (this) | AI + browser automation | `directory`, `forum`, `social`, `other` |

## Usage Example

**User Request:**
```
Help me submit directory and forum backlinks for my project
```

**AI Execution:**
1. Fetch project info from MyBacklinks.app
2. Query available free non-blog backlink resources
3. Display list and request confirmation
4. Load chrome-devtools skill
5. Execute submissions following howToSubmit instructions
6. Generate summary report

## Security Notes

- Only operates through user-authorized MCP tools
- No sensitive information stored externally
- All operations traceable in MyBacklinks.app
- Default credentials: `cc@{domain}` / `12345678`
