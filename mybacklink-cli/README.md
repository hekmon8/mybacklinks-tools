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
mybacklinks fetch-backlinks-by-domain --domain example.com --limit 50
mybacklinks fetch-dr-by-domain --domain example.com
mybacklinks fetch-traffic-by-domain --domain example.com
```

## Output

- Default: human-readable output
- `--json`: raw JSON output
- `--base-url`: override API origin

## Auth storage

Credentials are stored at `~/.config/mybacklinks/credentials.json`.

## Release automation (GitHub Actions)

- Versioning and tag generation: handled by `.github/workflows/release-please.yml`
- npm publish trigger: `.github/workflows/publish-cli.yml`
- Publish tag pattern: `cli-v*` (example: `cli-v0.2.0`)

### Required repository secrets

- `NPM_TOKEN`: npm automation token with permission to publish `@mybacklinks/cli`
