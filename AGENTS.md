# Plosia

An online shop for cats and cat food. A monolith: Node.js + Express, server-rendered pages plus a little frontend JS. Data lives in memory — restarting the server returns the shop to its initial state.

## Modules (`src/modules/`)

| Module | What it does |
|---|---|
| `catalog` | Catalog of cats and food, filters, a cache of filtering results |
| `cart` | Cart, promo codes (one discount per order, no more than 50%) |
| `checkout` | Checkout: courier or pickup point, payment through the MurPay gateway |
| `auth` | Sign-up, login, JWT (access 15 min + refresh 30 days), lockout after 5 failed logins |
| `orders` | Order history, electronic receipt |
| `mail` | Emails to customers (in the demo — a test mailbox at `/mail`) |

Shared code is in `src/lib/`, stub data in `src/data/`, the frontend in `public/`.

## How to run

- `npm install && npm start` — the shop at http://localhost:3000 (and at the address on the local network)
- `npm run doctor` — check the environment and access to Sentry

## Releases

Releases are marked with git tags: `v2.3.0`, `v2.4.0`, `v2.5.0`. Production is currently on **2.5.0**; `main` after the tag holds the changes of the next release.

- commits of a release: `git log v2.4.0..v2.5.0 --stat`
- changes of the next release: `git log v2.5.0..main --stat`

## Sentry

Production errors are collected in Sentry (project `plosia`), accessed through the `sentry` MCP server (read-only). The repository has no config for it: you connect the server yourself, with the token from `.env` (README → "Connecting the Sentry MCP server"). Events have the tags `http.status_code`, `endpoint` and the release `plosia@<version>`. Example query: `http.status_code:500`.

## QA team rules

`docs/qa/` — severity and priorities, risk zones. Skills must rely on them, not on general knowledge.

## Skills

Claude Code — `.claude/skills/`, Codex — `.agents/skills/`.
