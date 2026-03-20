---
name: MyBacklinks CLI – Resource Management
description: Build and maintain a database of backlink opportunities (directories, guest posts, forums) using the MyBacklinks CLI.
version: 1.0.0
author: MyBacklinks
triggers:
  - list backlink resources
  - add backlink resource
  - update backlink resource
  - manage backlink resources
  - find link building opportunities
  - save directory submission site
  - backlink opportunity database
  - resource database
---

# MyBacklinks CLI – Resource Management

Curate a searchable database of link-building opportunities — directories, guest-post sites, forums, and more.

## Prerequisites

Authenticate once before running any command:

```bash
mybacklinks login --api-key <YOUR_API_KEY>

mybacklinks status   # verify credentials and credits
```

All commands accept `--json` for machine-readable output and `--base-url <url>` to override the server.

---

## Commands

### 1. list-backlink-resources

Browse your saved backlink resources with optional filters. Supports pagination.

**When to use:** Review your opportunity pipeline, find resources matching specific criteria (e.g. free directories with DR > 30), or export your resource database.

```bash
mybacklinks list-backlink-resources [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--limit` | No | number | Max resources per page |
| `--cursor` | No | string | Pagination cursor from previous response |
| `--all` | No | boolean | Auto-paginate through all results |
| `--type` | No | string | Filter by type (`directory`, `guest_post`, `forum`, `blog`, `social`, etc.) |
| `--payment-type` | No | string | Filter by payment (`free`, `paid`, `exchange`) |
| `--dr-min` | No | number | Minimum domain rating |
| `--dr-max` | No | number | Maximum domain rating |

**Examples:**

```bash
# List first page of all resources
mybacklinks list-backlink-resources

# Free directories with DR >= 30
mybacklinks list-backlink-resources --type directory --payment-type free --dr-min 30

# Fetch everything as JSON (auto-paginate)
mybacklinks list-backlink-resources --all --json

# Guest post sites with moderate authority
mybacklinks list-backlink-resources --type guest_post --dr-min 20 --dr-max 60
```

**Typical response fields per resource:**

| Field | Description |
|-------|-------------|
| `id` | Unique resource ID |
| `domain` | Resource domain |
| `type` | Resource type (directory, guest_post, forum, blog, social) |
| `submissionMethod` | How to submit (form, email, api, Auto Approval) |
| `howToSubmit` | Human-readable submission instructions |
| `priceType` | Payment model (free, paid, exchange) |
| `dr` | Domain rating |
| `traffic` | Estimated monthly traffic |
| `updatedAt` | Last update timestamp |

---

### 2. add-backlink-resource

Save a new backlink opportunity to your database.

**When to use:** After discovering a new directory, guest-post site, or forum worth targeting. Capture its metadata so you (or your team) can find and use it later.

```bash
mybacklinks add-backlink-resource --domain <domain> --type <type> [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--domain` | Yes | string | Domain of the resource |
| `--type` | Yes | string | Resource type (`guest_post`, `directory`, `forum`, `blog`, `social`) |
| `--submission-url` | No | string | URL for submitting content |
| `--payment-type` | No | string | Payment model (`free`, `paid`, `exchange`) |
| `--submission-method` | No | string | Submission method (`form`, `email`, `api`) |
| `--how-to-submit` | No | string | Human-readable submission instructions |
| `--dr` | No | number | Domain rating (0–100) |
| `--traffic` | No | number | Estimated monthly traffic |
| `--notes` | No | string | Additional notes |

**Examples:**

```bash
# Minimal — just domain and type
mybacklinks add-backlink-resource --domain producthunt.com --type directory

# Full metadata
mybacklinks add-backlink-resource \
  --domain blog.example.com \
  --type guest_post \
  --payment-type free \
  --submission-method email \
  --how-to-submit "Email editor@example.com with pitch and draft" \
  --dr 45 \
  --traffic 12000 \
  --notes "Accepts AI/SaaS topics, 1–2 week turnaround"

# Directory with auto-approval
mybacklinks add-backlink-resource \
  --domain toolwave.io \
  --type directory \
  --payment-type free \
  --submission-url "https://toolwave.io/submit" \
  --submission-method form \
  --dr 1 \
  --traffic 0
```

---

### 3. update-backlink-resource

Modify an existing resource's metadata. Pass `"null"` (as a string) to clear a field.

**When to use:** Update DR/traffic after a periodic refresh, correct submission instructions, or mark a resource's payment model change.

```bash
mybacklinks update-backlink-resource --id <resource-id> [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--id` | Yes | string | Resource ID to update |
| `--type` | No | string | Updated resource type |
| `--submission-url` | No | string | Updated submission URL |
| `--payment-type` | No | string | Updated payment type |
| `--submission-method` | No | string | Updated submission method (use `"null"` to clear) |
| `--how-to-submit` | No | string | Updated instructions (use `"null"` to clear) |
| `--dr` | No | number | Updated domain rating (use `"null"` to clear) |
| `--traffic` | No | number | Updated monthly traffic (use `"null"` to clear) |
| `--notes` | No | string | Updated notes (use `"null"` to clear) |

**Examples:**

```bash
# Update DR after a refresh
mybacklinks update-backlink-resource --id f64956f7-659a-44fc-8301-3f05e43eb816 --dr 12

# Change payment model and add notes
mybacklinks update-backlink-resource --id f64956f7-659a-44fc-8301-3f05e43eb816 \
  --payment-type paid \
  --notes "Now charges $50 per listing"

# Clear a field
mybacklinks update-backlink-resource --id f64956f7-659a-44fc-8301-3f05e43eb816 --notes "null"
```

---

## Agent Workflows

### Build a Resource Database from Scratch

1. Research directories and guest-post sites in your niche.
2. For each site, use [domain analysis](../mybacklinks-cli-domain-analysis/) to fetch DR and traffic:
   ```bash
   mybacklinks fetch-dr-by-domain --domain <site> --json
   mybacklinks fetch-traffic-by-domain --domain <site> --json
   ```
3. Save qualified sites:
   ```bash
   mybacklinks add-backlink-resource --domain <site> --type directory --dr <dr> --traffic <traffic> --payment-type free
   ```

### Periodic Metrics Refresh

1. Export all resources: `mybacklinks list-backlink-resources --all --json`
2. For each resource, re-fetch DR and traffic via domain analysis commands.
3. Update stale records:
   ```bash
   mybacklinks update-backlink-resource --id <id> --dr <new_dr> --traffic <new_traffic>
   ```

### Filter and Prioritize for Outreach

```bash
# High-authority free guest post opportunities
mybacklinks list-backlink-resources --type guest_post --payment-type free --dr-min 30 --json

# All directories sorted by the API's default ordering
mybacklinks list-backlink-resources --type directory --all --json
```

---

## Resource Types Reference

| Type | Description |
|------|-------------|
| `directory` | Product/tool directory or listing site |
| `guest_post` | Blog or publication accepting guest articles |
| `forum` | Forum or community with profile/signature links |
| `blog` | Blog accepting comments with website field |
| `social` | Social platform profile page |

## Related Skills

- [mybacklinks-cli-domain-analysis](../mybacklinks-cli-domain-analysis/) — Evaluate domains before adding them as resources
- [mybacklinks-cli-campaign-tracking](../mybacklinks-cli-campaign-tracking/) — Track backlinks built using these resources
- [blog-commenter-skill](../blog-commenter-skill/) — Automate blog comment posting on `blog`-type resources
