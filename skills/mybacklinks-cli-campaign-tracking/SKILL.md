---
name: MyBacklinks CLI – Campaign Tracking
description: Manage SEO projects and track link-building campaign progress using the MyBacklinks CLI.
version: 1.0.0
author: MyBacklinks
triggers:
  - list projects
  - get project info
  - update project
  - list backlinks for project
  - add backlink to project
  - update project backlinks
  - track backlink campaign
  - backlink campaign status
  - link building progress
  - project backlink management
---

# MyBacklinks CLI – Campaign Tracking

Manage your SEO projects and track every backlink in your link-building campaigns.

## Prerequisites

Authenticate once before running any command:

```bash
mybacklinks login --api-key <YOUR_API_KEY>

mybacklinks status   # verify credentials and credits
```

All commands return JSON by default. Use `--md` for Markdown output, and `--base-url <url>` to override the server.

---

## Commands

### 1. list-projects

List all projects in your account. Each project represents a website or product you're building backlinks for.

**When to use:** Get an overview of active campaigns, find a project ID before querying its backlinks, or audit your project portfolio.

```bash
mybacklinks list-projects [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--limit` | No | number | Max projects per page |
| `--cursor` | No | string | Pagination cursor from previous response |
| `--all` | No | boolean | Auto-paginate through all results |

**Examples:**

```bash
mybacklinks list-projects

mybacklinks list-projects --limit 5

mybacklinks list-projects --all --json
```

**Typical response fields per project:**

| Field | Description |
|-------|-------------|
| `id` | Project UUID (used in other commands as `--project-id`) |
| `name` | Project display name |
| `domain` | Associated domain (may be null) |
| `status` | Project status (`active`, etc.) |
| `updatedAt` | Last update timestamp |
| `createdAt` | Creation timestamp |

---

### 2. fetch-project-info

Fetch detailed information for a single project by ID or domain.

**When to use:** Get full project metadata, check settings, or confirm a project exists before updating it.

```bash
mybacklinks fetch-project-info [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--project-id` | One of these | string | Project UUID |
| `--domain` | One of these | string | Project domain |

Provide either `--project-id` or `--domain` (not both).

**Examples:**

```bash
mybacklinks fetch-project-info --project-id 56777265-5db3-48a0-ac38-2cc25d04d80c

mybacklinks fetch-project-info --domain mybacklinks.app --json
```

---

### 3. update-project-info

Update metadata for an existing project.

**When to use:** Rename a project, update its URL, change its description, or toggle its status.

```bash
mybacklinks update-project-info --project-id <id> [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--project-id` | Yes | string | Project UUID |
| `--name` | No | string | New project name |
| `--description` | No | string | New project description |
| `--url` | No | string | New project URL |
| `--status` | No | string | New status |

**Examples:**

```bash
mybacklinks update-project-info --project-id proj_abc --name "My SaaS v2"

mybacklinks update-project-info --project-id proj_abc --url "https://newsaas.com" --status active
```

---

### 4. fetch-project-backlinks

Retrieve backlinks associated with a project. Supports filtering and pagination.

**When to use:** Audit current backlink portfolio, check indexing status, find backlinks from a specific resource domain, or export all backlinks for reporting.

```bash
mybacklinks fetch-project-backlinks --project-id <id> [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--project-id` | Yes | string | Project UUID |
| `--status` | No | string | Filter by status (`indexed`, `pending`, `lost`, etc.) |
| `--resource-domain` | No | string | Filter by the domain where the backlink is placed |
| `--anchor-text` | No | string | Filter by anchor text substring |
| `--target-url` | No | string | Filter by target URL on your site |
| `--limit` | No | number | Max backlinks per page |
| `--cursor` | No | string | Pagination cursor from previous response |
| `--all` | No | boolean | Auto-paginate through all results |

**Examples:**

```bash
# All backlinks for a project
mybacklinks fetch-project-backlinks --project-id proj_abc

# Only indexed backlinks
mybacklinks fetch-project-backlinks --project-id proj_abc --status indexed

# Backlinks from a specific resource domain
mybacklinks fetch-project-backlinks --project-id proj_abc --resource-domain producthunt.com

# Export everything as JSON
mybacklinks fetch-project-backlinks --project-id proj_abc --all --json

# Backlinks with specific anchor
mybacklinks fetch-project-backlinks --project-id proj_abc --anchor-text "AI tools"
```

---

### 5. update-project-backlinks

Create a new backlink record or update an existing one within a project. Supports single-entry mode via CLI flags or batch mode via a JSON file.

**When to use:** Log a newly placed backlink, update its status after verification, batch-import backlinks from a spreadsheet or automation script.

```bash
mybacklinks update-project-backlinks --project-id <id> [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--project-id` | Yes* | string | Project UUID (*not needed when `--file` contains `projectId`) |
| `--backlink-id` | No | string | Existing backlink ID (omit to create new) |
| `--resource-id` | No | string | Link to a backlink resource from your database |
| `--target-url` | No | string | Target URL on your site |
| `--backlink-url` | No | string | URL where the backlink is placed |
| `--anchor` | No | string | Anchor text |
| `--status` | No | string | Backlink status |
| `--utm-source` | No | string | UTM source tag for attribution |
| `--notes` | No | string | Additional notes |
| `--file` | No | string | Path to JSON file for batch updates |

#### Single-entry mode

```bash
# Create a new backlink record
mybacklinks update-project-backlinks \
  --project-id proj_abc \
  --target-url "https://mysite.com/features" \
  --backlink-url "https://directory.com/mysite" \
  --anchor "best AI tool" \
  --resource-id res_xyz \
  --status pending

# Update an existing backlink's status
mybacklinks update-project-backlinks \
  --project-id proj_abc \
  --backlink-id bl_123 \
  --status indexed
```

#### Batch mode (JSON file)

Create a JSON file with an array of backlink entries:

```json
{
  "projectId": "proj_abc",
  "items": [
    {
      "targetUrl": "https://mysite.com/page1",
      "backlinkUrl": "https://dir1.com/listing",
      "anchor": "great tool",
      "status": "pending"
    },
    {
      "targetUrl": "https://mysite.com/page2",
      "backlinkUrl": "https://dir2.com/listing",
      "anchor": "AI assistant",
      "status": "indexed"
    }
  ]
}
```

Then import:

```bash
mybacklinks update-project-backlinks --file backlinks.json
```

---

## Agent Workflows

### Full Link-Building Pipeline

1. **Choose a project:**
   ```bash
   mybacklinks list-projects --json
   ```
2. **Find resources** from your database (see [resource management](../mybacklinks-cli-resource-management/)):
   ```bash
   mybacklinks list-backlink-resources --type directory --payment-type free --dr-min 20 --json
   ```
3. **Submit your site** to each resource (manually or via [blog-commenter-skill](../blog-commenter-skill/)).
4. **Log each backlink:**
   ```bash
   mybacklinks update-project-backlinks \
     --project-id <id> \
     --target-url "https://mysite.com" \
     --backlink-url "https://directory.com/mysite" \
     --resource-id <resource-id> \
     --anchor "my keyword" \
     --status pending
   ```
5. **Monitor indexing** over time:
   ```bash
   mybacklinks fetch-project-backlinks --project-id <id> --status pending --json
   ```

### Campaign Progress Report

```bash
# Total backlinks
mybacklinks fetch-project-backlinks --project-id <id> --all --json | jq '.backlinks | length'

# Indexed vs pending breakdown
mybacklinks fetch-project-backlinks --project-id <id> --status indexed --all --json
mybacklinks fetch-project-backlinks --project-id <id> --status pending --all --json
```

### Batch Import from Spreadsheet

1. Export your spreadsheet as JSON (array of objects with `targetUrl`, `backlinkUrl`, `anchor`, `status`).
2. Wrap in `{ "projectId": "<id>", "items": [...] }`.
3. Run:
   ```bash
   mybacklinks update-project-backlinks --file import.json
   ```

---

## Related Skills

- [mybacklinks-cli-domain-analysis](../mybacklinks-cli-domain-analysis/) — Research domains before outreach
- [mybacklinks-cli-resource-management](../mybacklinks-cli-resource-management/) — Manage your backlink opportunity database
- [blog-commenter-skill](../blog-commenter-skill/) — Automate blog comment outreach
