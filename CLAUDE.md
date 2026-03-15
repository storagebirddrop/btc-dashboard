# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm install
npm run dev        # starts dev server at http://localhost:5173

# Production build
npm run build
npm run preview    # preview the production build locally

# Docker (production)
docker compose up --build -d
```

No test suite is configured.

## Git Workflow

**Never push directly to `main`** — branch protection requires CI to pass first.

```bash
# Start a feature or fix
git checkout main && git pull
git checkout -b feat/my-change   # or fix/, docs/, chore/

# Stage specific files (never git add -A blindly)
git add src/constants.js src/App.jsx

# Commit
git commit -m "feat: describe what and why"

# Push and open PR
git push -u origin feat/my-change
gh pr create --base main --title "feat: ..." --body "..."
```

**Merging:** Squash and merge on GitHub after CI passes. Then sync locally:

```bash
git checkout main && git pull
git branch -d feat/my-change     # clean up local branch
```

**Never:** `git push --force` on main, `--no-verify`, or direct commits to main.

## Architecture

React 19 + Vite SPA with Recharts for data visualization. No state management library — all state lives in `App.jsx` and is passed down as props.

**Data flow:**
- `useLiveBTC` (polls CoinGecko every 60s, caches to localStorage for 12h) → `App.jsx` state → child components
- A single `fxRate` (fetched alongside BTC price) is the source of truth for all currency conversions — projections, analyst targets, and labels all use this same rate
- `useHistoricalReturns` auto-fetches annual returns from CoinGecko for any year beyond the hardcoded HISTORICAL array

**Key files:**
- [src/constants.js](src/constants.js) — CAGR scenarios, halving dates/prices, analyst forecasts, supported currencies, `DEFAULT_LIGHTNING` from env. Edit here to update projections or add analysts.
- [src/utils.js](src/utils.js) — `fmtPrice()`, `fmtPct()`, address classification (on-chain vs Lightning vs BOLT12). Currencies without decimal units (JPY, KRW, etc.) have special formatting logic here.
- [src/styles.js](src/styles.js) — CSS-in-JS style objects (CARD, LABEL, BTN_PRIMARY, etc.) used inline across components.
- [src/hooks/useLiveBTC.js](src/hooks/useLiveBTC.js) — CoinGecko fetch with AbortController + localStorage cache; returns `{ prices, changes, status, lastFetch, refetch }`.
- [src/hooks/useHistoricalReturns.js](src/hooks/useHistoricalReturns.js) — Fetches missing annual returns sequentially (1.2s gap) to respect CoinGecko rate limits.
- [src/App.jsx](src/App.jsx) — Root component, owns all state, handles responsive grid layout (breakpoints: 768px, 480px).

**Components:**
- `DCASection.jsx` — DCA calculator with geometric mean avg price model, portfolio chart, summary cards
- `DonationModal.jsx` / `DonationSettings.jsx` — Read-only Lightning/BOLT12 donation display (address set via `VITE_LIGHTNING_ADDRESS` env var)
- `Tooltips.jsx` — Custom Recharts tooltips: `PriceTooltip`, `PortfolioTooltip`, `HistTooltip`, `DCATooltip`

**DCA model:** Uses geometric mean for time-weighted average purchase price: `liveUSD * (1 + cagr)^(year + 0.5)` — more accurate than arithmetic midpoint for exponential growth.

**API:** CoinGecko free tier (≤30 req/min). Self-hosted deployments under heavy traffic may hit rate limits.

## Environment Variables

```bash
VITE_LIGHTNING_ADDRESS=you@domain.com   # Lightning Address or lno1... BOLT12 offer
```

Copy `.env.example` → `.env`. Never commit `.env`.

## Deployment

```bash
bash scripts/deploy.sh    # git pull + docker compose up --build -d + image prune
```

See `Dockerfile`, `docker-compose.yml`, and `nginx.conf` for production config.

## Agents

Global agents defined in `~/.claude/` are available for use in this project:

| Agent | Description |
|---|---|
| `coder` | Implements features exactly as specified, following existing idioms. Raises ambiguities before writing code. |
| `debugger` | Traces root causes from stack traces/logs, proposes minimal targeted fixes, suggests preventive tests. |
| `refactorer` | Improves readability/performance/maintainability without changing behavior. Limits to 3–5 focused suggestions. |
| `code-reviewer` | Staff-level review: bugs, security, correctness, performance. Rates code 1–10 across four dimensions. |
| `frontend-designer` | Layout, component design, accessibility, responsiveness. Adapts to existing CSS approach (CSS-in-JS here). |
| `test-writer` | Writes isolated, deterministic tests. Mocks external deps (APIs, I/O). |
| `api-designer` | REST/GraphQL schemas, auth, security, DB modeling. Outputs typed stubs and OpenAPI specs. |

## MCP Servers

Global MCP servers configured in `~/.claude/settings.json`:

| Server | Purpose |
|---|---|
| `filesystem` | Local file system access |
| `fetch` | Fetch web pages as markdown/HTML |
| `git` | Git repository operations |
| `github` | GitHub API (PRs, issues, repos) |
| `sequential-thinking` | Structured multi-step reasoning |
| `deepwiki` | Deep wiki search |
| `context7` | Up-to-date library documentation |
| `firecrawl` | Web scraping and crawling |
| `figma` | Figma design file access (`figma-developer-mcp`) |
| `playwright` | Browser automation and testing (`@playwright/mcp`) |
| `alpaca` | Alpaca paper trading API |
| `quantconnect` | QuantConnect algorithmic trading |
| `alphavantage` | Alpha Vantage market data |
| `composer` | Composer AI trading |
| `graphiti` | Graphiti knowledge graph (localhost:8000) |
| `fmp-imbenrabi` | FMP data — imbenrabi server (localhost:8082) |
| `fmp-houtini` | FMP data — houtini package |
| `fmp-vipbat` | FMP data — vipbat server |
| `finance-tools` | General finance tools |
