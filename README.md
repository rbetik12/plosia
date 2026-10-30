# Plosia

An online shop for cats and cat food — a practice project for QA engineers working with AI agents.

A monolith on Node.js + Express. The repository has real releases with commit history, production errors in Sentry and a Sentry MCP server — everything you need to write QA skills for Claude Code, Codex or Cursor.

## Getting started

You need Node.js 22.13+ and git.

### 1. Install

```bash
git clone https://gitlab.com/rbetik12/plosia.git
cd plosia
git fetch --tags
npm install          # the shop and the Sentry MCP server
```

The Sentry MCP server weighs about 130 MB, so the first install can take a while.

### 2. Configure

Copy `.env.example` to `.env` and paste your read-only Sentry token into `SENTRY_ACCESS_TOKEN`. The shop itself runs without it; the token is only needed for the Sentry MCP server.

### 3. Check

```bash
npm run doctor       # everything should be green
```

### 4. Run

```bash
npm start            # the shop at http://localhost:3000
```

Open the `plosia` folder in your agent. You connect the Sentry MCP server to the agent yourself — see "Connecting the Sentry MCP server" below.

## What's inside

```
src/
  modules/      catalog, cart, checkout, auth, orders, mail — the modules of the monolith
  lib/          shared code: errors, JWT, money, HTML templates, seed mode for Sentry
  data/         cats, food, promo codes, pickup points, demo orders
public/         styles, JS and photos
scripts/        doctor (environment check)
docs/qa/        the QA team's rules: severity, priorities, risk zones
```

Releases are git tags `v2.3.0`, `v2.4.0`, `v2.5.0`. Production is on 2.5.0.

## Where to put skills

Skills must be in the folder for the matching agent. For Claude Code, put a skill in `.claude/skills/<skill name>/SKILL.md`.

```
Claude Code:                  Codex:
.claude/skills/               .agents/skills/
└── regression-plan/          └── regression-plan/
    └── SKILL.md                  └── SKILL.md
```

The skeleton is in [`SKILL_TEMPLATE.md`](SKILL_TEMPLATE.md). Skills should rely on the team's rules: `docs/qa/risk-zones.md` and `docs/qa/severity.md`.

## Connecting the Sentry MCP server

There is no ready-made config in the project — connect the server to your agent yourself. Everything you need:

| What | Value |
|---|---|
| Server | the npm package `@sentry/mcp-server@0.42.0`. Already installed after `npm install` |
| Token | `SENTRY_ACCESS_TOKEN` from your `.env`, read-only. Passed to the server as an environment variable with the same name |
| Organization and project | `rbetik` and `plosia` — the flags `--organization-slug` and `--project-slug` |
| Tools | `--skills=inspect` — search and read only |

How to add an MCP server: [Claude Code](https://code.claude.com/docs/en/mcp) · [Codex](https://developers.openai.com/codex/mcp) · [Cursor](https://cursor.com/docs/context/mcp).

The official Sentry guide to installing the MCP server: [Sentry MCP](https://mcp.sentry.dev/?transport=stdio&ide=claude-code) (OPENAI_API_KEY is not needed)

The token must not end up in git. Keep it in your agent's local settings: for Claude Code that is the `local` scope (the default), for Codex `~/.codex/config.toml`, for Cursor `.cursor/mcp.json` in the project (it is in `.gitignore`).

**Done when** the agent sees the `sentry` server and its tools (`/mcp` in Claude Code and Codex, Settings → MCP in Cursor), and answers the question "how many 500s were there in Sentry this week?" with numbers from Sentry.

<details>
<summary>Stuck? Ready-made commands</summary>

Substitute the token from `.env` for `<token>`. Run the commands from the project root — then `npx` will use the package that is already installed.

**Claude Code**

```bash
claude mcp add sentry -e SENTRY_ACCESS_TOKEN=<token> -- npx -y @sentry/mcp-server@0.42.0 --skills=inspect --organization-slug=rbetik --project-slug=plosia
```

Restart `claude` and check with `/mcp`.

**Codex**

```bash
codex mcp add sentry --env SENTRY_ACCESS_TOKEN=<token> -- npx -y @sentry/mcp-server@0.42.0 --skills=inspect --organization-slug=rbetik --project-slug=plosia
```

Restart `codex` and check with `/mcp`. If the server does not manage to start in time, add `startup_timeout_sec = 30` to the `[mcp_servers.sentry]` section of `~/.codex/config.toml`.

**Cursor** — the file `.cursor/mcp.json` in the project root (the server is taken from `node_modules`, with no download):

```json
{
  "mcpServers": {
    "sentry": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@sentry/mcp-server/dist/index.js", "--skills=inspect", "--organization-slug=rbetik", "--project-slug=plosia"],
      "env": { "SENTRY_ACCESS_TOKEN": "<token>" }
    }
  }
}
```

Settings → MCP → enable `sentry`.

</details>

### Sentry tips

- `search_issues` — a list of issues with the number of users; `search_events` — counts and groupings (dataset `errors`).
- Query syntax: `http.status_code:500`, `level:error`, `release:plosia@2.5.0`, `firstSeen:-7d`, `environment:production`.
- Events have the tags `http.status_code` and `endpoint`.

## If something doesn't work

| Symptom | What to do |
|---|---|
| `npm run doctor` complains about Node.js | You need Node.js 22.13+ |
| The `sentry` MCP server does not connect | Run the server command from your config directly in a terminal, with `SENTRY_ACCESS_TOKEN`, — you will see the error. `npm run doctor` checks the token and the package |
| The agent does not see `sentry` after adding it | Restart the agent and check `/mcp` (in Cursor — Settings → MCP) |
| Windows: the server via `npx` does not start | Run it through `cmd /c`: `cmd /c npx -y @sentry/mcp-server@0.42.0 …` |
| No `v2.x.x` tags | `git fetch --tags` |
| Sentry is empty | Check the period: events from the last 10 days |
