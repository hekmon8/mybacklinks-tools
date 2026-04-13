---
name: MyBacklinks CLI – Domain Analysis
description: Research any domain's SEO metrics (DR, traffic) and discover its backlink profile using the MyBacklinks CLI.
version: 1.0.0
author: MyBacklinks
triggers:
  - check domain rating
  - check domain DR
  - check domain traffic
  - discover backlinks for domain
  - analyze competitor domain
  - domain SEO metrics
  - competitive backlink analysis
  - find backlinks for a domain
  - domain authority check
---

# MyBacklinks CLI – Domain Analysis

Evaluate any domain's SEO strength and reverse-engineer its backlink profile from the command line.

## Prerequisites

Authenticate once before running any command:

```bash
# API-key auth (recommended for agents)
mybacklinks login --api-key <YOUR_API_KEY>

# Verify credentials
mybacklinks status
```

All commands return JSON by default. Use `--md` for Markdown output, and `--base-url <url>` to target a different server.

---

## Commands

### 1. fetch-dr-by-domain

Retrieve the Domain Rating (DR) for a single domain. DR is a 0–100 score reflecting the strength of a domain's backlink profile.

**When to use:** Qualify a domain before outreach, compare competitors, or audit your own site's authority.

```bash
mybacklinks fetch-dr-by-domain --domain <domain>
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--domain` | Yes | string | Domain to look up (e.g. `example.com`) |

**Examples:**

```bash
# Quick DR check
mybacklinks fetch-dr-by-domain --domain ahrefs.com

# JSON output for scripting
mybacklinks fetch-dr-by-domain --domain ahrefs.com --json
```

**Typical response (JSON):**

```json
{
  "domain": "ahrefs.com",
  "dr": 91
}
```

---

### 2. fetch-traffic-by-domain

Retrieve estimated monthly organic traffic for a domain.

**When to use:** Evaluate whether a site is worth pursuing for a guest post or backlink, gauge competitor reach, or prioritize outreach targets by traffic volume.

```bash
mybacklinks fetch-traffic-by-domain --domain <domain>
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--domain` | Yes | string | Domain to look up |

**Examples:**

```bash
mybacklinks fetch-traffic-by-domain --domain moz.com

mybacklinks fetch-traffic-by-domain --domain moz.com --json
```

**Typical response (JSON):**

```json
{
  "domain": "moz.com",
  "traffic": 1250000
}
```

---

### 3. fetch-backlinks-by-domain

Discover the backlinks pointing to any domain. Returns referring pages, anchor texts, dofollow status, and referring domain ratings.

**When to use:** Reverse-engineer a competitor's link profile, find link-building opportunities from shared referring domains, or audit a prospective partner's backlink quality.

```bash
mybacklinks fetch-backlinks-by-domain --domain <domain> [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--domain` | Yes | string | Domain to look up |
| `--mode` | No | string | Discovery mode |
| `--dofollow` | No | boolean | Only return dofollow links |
| `--min-dr` | No | number | Minimum referring-domain DR |
| `--anchor-text` | No | string | Filter by anchor text substring |
| `--limit` | No | number | Max backlinks to return. Default: 100. Max: 500. Increase this when `summary.hasMore` is true. |
| `--offset` | No | number | Starting offset for pagination. Use `pagination.nextOffset` from the previous response. |
| `--all` | No | boolean | Fetch all pages automatically using offset pagination. Each page consumes credits. |

**Examples:**

```bash
# Basic discovery
mybacklinks fetch-backlinks-by-domain --domain competitor.com

# Only high-quality dofollow links
mybacklinks fetch-backlinks-by-domain --domain competitor.com --dofollow --min-dr 30

# Fetch more results when summary.hasMore is true
mybacklinks fetch-backlinks-by-domain --domain competitor.com --limit 500 --json

# Fetch the next page using pagination.nextOffset
mybacklinks fetch-backlinks-by-domain --domain competitor.com --offset 500 --limit 500 --json

# Fetch all pages automatically
mybacklinks fetch-backlinks-by-domain --domain competitor.com --all --limit 500 --json

# Search for specific anchor
mybacklinks fetch-backlinks-by-domain --domain competitor.com --anchor-text "best tools"
```

---

## Agent Workflows

### Competitive Gap Analysis

1. Identify competitor domains.
2. For each competitor, run `fetch-dr-by-domain` and `fetch-traffic-by-domain` to benchmark.
3. Run `fetch-backlinks-by-domain --dofollow --min-dr 20 --limit 500` to find high-quality referring domains. If the response shows `summary.hasMore`, continue with `--offset <pagination.nextOffset>` or use `--all --limit 500`.
4. Cross-reference referring domains across competitors to find common link sources you're missing.

### Domain Qualification for Outreach

Before reaching out to a site for a guest post or link placement:

1. `fetch-dr-by-domain --domain <target>` — confirm DR meets your minimum threshold.
2. `fetch-traffic-by-domain --domain <target>` — verify the site has real organic traffic.
3. If both pass, proceed with outreach; otherwise skip.

### Batch Domain Screening

Use `--json` output to pipe results into downstream processing:

```bash
for domain in site1.com site2.com site3.com; do
  mybacklinks fetch-dr-by-domain --domain "$domain" --json
done
```

---

## Credit Cost

`fetch-dr-by-domain` and `fetch-traffic-by-domain` share the same underlying API endpoint (`getDomainMetrics`). `fetch-backlinks-by-domain` calls the backlink discovery endpoint. Both consume credits — check `mybacklinks status` to see your balance.

## Related Skills

- [mybacklinks-cli-resource-management](../mybacklinks-cli-resource-management/) — Save qualified domains as backlink resources
- [mybacklinks-cli-campaign-tracking](../mybacklinks-cli-campaign-tracking/) — Track backlinks you build against your projects
- [blog-commenter-skill](../blog-commenter-skill/) — Automate blog comment outreach
