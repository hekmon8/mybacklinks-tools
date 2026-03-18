# SEO Research Skill

Open-source skill for running repeatable SEO research workflows on top of `@mybacklinks/cli`.

## Install

```bash
npm install -g @mybacklinks/cli
mybacklinks login
```

## Core Commands

```bash
mybacklinks status
mybacklinks list-projects
mybacklinks fetch-project-backlinks --project-id <id> --status indexed
mybacklinks fetch-backlinks-by-domain --domain example.com --limit 50
mybacklinks fetch-dr-by-domain --domain example.com
mybacklinks fetch-traffic-by-domain --domain example.com
```

See [`SKILL.md`](./SKILL.md) for the full workflow.
