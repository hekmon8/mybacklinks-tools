# `@mybacklinks/cli`

Official CLI for MyBacklinks.

## Install

```bash
npm install -g @mybacklinks/cli
```

## Login

```bash
mybacklinks login
mybacklinks login --api-key mbk_xxxxx
```

## Commands

```bash
mybacklinks status
mybacklinks list-projects
mybacklinks create-project --name "Example" --url https://example.com --type website --json
mybacklinks fetch-project-info --project-id <id>
mybacklinks update-project-info --project-id <id> --contact-emails hello@example.com,ops@example.com
mybacklinks fetch-project-backlinks --project-id <id> --status indexed
mybacklinks fetch-project-backlinks --domain example.com --all --json
mybacklinks get-backlink-resource --id <resource-id> --json
mybacklinks discover-backlink-opportunities --project-id <id> --payment-type free --limit 10 --json
mybacklinks fetch-backlinks-by-domain --domain example.com --limit 500
mybacklinks fetch-dr-by-domain --domain example.com
mybacklinks fetch-traffic-by-domain --domain example.com
```

### Create a project

Use `create-project` to add a project before tracking backlink campaign work.
The required fields are `--name`, `--url`, and `--type` (`website`, `app`, or
`other`). Optional autofill fields include contact emails, reusable long
descriptions, comment templates, social URLs, metadata URLs, `--status`,
`--group-name`, and `--pinned`.

```bash
mybacklinks create-project \
  --name "Example" \
  --url https://example.com \
  --type website \
  --contact-emails hello@example.com,ops@example.com \
  --social-urls https://x.com/example,https://github.com/example \
  --json
```

### Project backlinks vs. raw domain discovery

Use `fetch-project-backlinks` when you want tracked MyBacklinks project records:
submitted links, statuses, target URLs, resource metadata, and notes.

```bash
mybacklinks fetch-project-backlinks --domain example.com --all --json
mybacklinks fetch-project-backlinks --project-id <id> --status pending --json
```

Use `fetch-backlinks-by-domain` when you want raw provider-discovered backlinks
for any domain, including competitors or domains that are not MyBacklinks
projects. This output is labeled `semantic: "raw_provider_discovery"` so
automations do not confuse it with tracked project submissions.

```bash
mybacklinks fetch-backlinks-by-domain --domain competitor.com --limit 500 --json
```

### Fetch more domain backlinks

`fetch-backlinks-by-domain` returns 100 backlinks by default. If the response
summary shows `hasMore: true`, re-run the command with a higher `--limit`, up to
500 per request:

```bash
mybacklinks fetch-backlinks-by-domain --domain example.com --limit 452 --json
mybacklinks fetch-backlinks-by-domain --domain example.com --limit 500 --json
```

For domains with more than 500 backlinks, use `pagination.nextOffset` from the
previous response, or let the CLI fetch every page. Each page request consumes
credits.

```bash
mybacklinks fetch-backlinks-by-domain --domain example.com --offset 500 --limit 500 --json
mybacklinks fetch-backlinks-by-domain --domain example.com --all --limit 500 --json
```

Batch import backlink resources from JSON or CSV files:

```bash
mybacklinks add-backlink-resource --file resources.json
mybacklinks add-backlink-resource --file resources.csv --csv
```

## Output

- Default: JSON output with `meta` and `data` fields
- `--json`: explicitly request JSON output
- `--md`: Markdown output for agents and human review
- `--csv`: CSV output for tabular results
- `--base-url`: override API origin

## Support

The CLI keeps command output machine-readable. Support hints are written to
stderr and help text. File bugs, rough edges, or feature requests at
https://github.com/hekmon8/ai-cf-mybacklinks/issues.

## Auth storage

Credentials are stored at `~/.config/mybacklinks/credentials.json`.

## Release automation (GitHub Actions)

- npm publish trigger: `.github/workflows/publish-cli.yml`
- Publish tag pattern: `cli-v*` (example: `cli-v0.2.0`)
- Push a matching tag after bumping `mybacklink-cli/package.json`

### Required repository secrets

- `NPM_TOKEN`: npm automation token with permission to publish `@mybacklinks/cli`
