---
name: MyBacklinks CLI - Infrastructure Management
description: Inspect saved hosting servers and project-server inventory using the MyBacklinks CLI.
version: 1.0.0
author: MyBacklinks
triggers:
  - list servers
  - show all servers
  - server inventory
  - hosting inventory
  - infrastructure servers
  - project server audit
---

# MyBacklinks CLI - Infrastructure Management

Review server inventory used by MyBacklinks projects.

## Prerequisites

Authenticate once before running any command:

```bash
mybacklinks login --api-key <YOUR_API_KEY>

mybacklinks status
```

All commands return JSON by default. Use `--md` for Markdown, `--csv` for tabular exports, and `--base-url <url>` to override the API origin.

---

## Commands

### 1. list-servers

List all saved servers in the current account. Supports pagination and lightweight filters.

**When to use:** Audit hosting inventory, find a server ID/name, export server costs, or check which servers are linked to projects.

```bash
mybacklinks list-servers [options]
```

| Option | Required | Type | Description |
|--------|----------|------|-------------|
| `--limit` | No | number | Max servers per page |
| `--cursor` | No | string | Pagination cursor from previous response |
| `--all` | No | boolean | Auto-paginate through all results |
| `--status` | No | string | Filter by server status |
| `--provider` | No | string | Filter by hosting provider |

**Examples:**

```bash
# List first page of servers
mybacklinks list-servers --json

# Active Cloudflare servers
mybacklinks list-servers --status active --provider Cloudflare --json

# Export every server as CSV
mybacklinks list-servers --all --csv
```

**Typical response fields per server:**

| Field | Description |
|-------|-------------|
| `id` | Unique server ID |
| `name` | Server display name |
| `hostname` | Hostname, when recorded |
| `ipAddress` | IP address, when recorded |
| `provider` | Hosting provider |
| `location` | Region or physical location |
| `specs` | Structured server specs |
| `status` | Server status |
| `monthlyPrice` | Recorded monthly cost |
| `currency` | Billing currency |
| `billingCycle` | Billing cycle |
| `billingStartDate` | Billing start date |
| `projectCount` | Number of linked projects |
| `updatedAt` | Last update timestamp |

---

## Agent Workflows

### Audit Hosting Inventory

```bash
mybacklinks list-servers --all --json
```

Check `projectCount` for unused or overloaded servers, then inspect project bindings in the MyBacklinks dashboard if needed.

### Export Server Costs

```bash
mybacklinks list-servers --all --csv
```

Use the `monthlyPrice`, `currency`, and `billingCycle` fields for cost review.

---

## Related Skills

- [mybacklinks-cli-campaign-tracking](../mybacklinks-cli-campaign-tracking/) - Manage projects and backlink campaign records
- [mybacklinks-cli-resource-management](../mybacklinks-cli-resource-management/) - Manage backlink opportunity resources
