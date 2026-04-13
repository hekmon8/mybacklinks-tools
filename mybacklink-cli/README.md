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
mybacklinks fetch-project-info --project-id <id>
mybacklinks fetch-project-backlinks --project-id <id> --status indexed
mybacklinks fetch-backlinks-by-domain --domain example.com --limit 500
mybacklinks fetch-dr-by-domain --domain example.com
mybacklinks fetch-traffic-by-domain --domain example.com
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

## Output

- Default: JSON output
- `--json`: explicitly request JSON output
- `--md`: Markdown output for agents and human review
- `--base-url`: override API origin

## Auth storage

Credentials are stored at `~/.config/mybacklinks/credentials.json`.

## Release automation (GitHub Actions)

- npm publish trigger: `.github/workflows/publish-cli.yml`
- Publish tag pattern: `cli-v*` (example: `cli-v0.2.0`)
- Push a matching tag after bumping `mybacklink-cli/package.json`

### Required repository secrets

- `NPM_TOKEN`: npm automation token with permission to publish `@mybacklinks/cli`
