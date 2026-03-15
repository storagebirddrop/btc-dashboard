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

## Architecture

React 18 + Vite SPA with Recharts for data visualization. No state management library — all state lives in `App.jsx` and is passed down as props.

**Data flow:**
- `useLiveBTC` (polls CoinGecko every 60s) → `App.jsx` state → child components
- A single `fxRate` (fetched alongside BTC price) is the source of truth for all currency conversions — projections, analyst targets, and labels all use this same rate

**Key files:**
- [src/constants.js](src/constants.js) — CAGR scenarios, halving dates/prices, analyst forecasts, supported currencies. Edit here to update projections or add analysts.
- [src/utils.js](src/utils.js) — `fmtPrice()`, `fmtPct()`, address classification (on-chain vs Lightning vs BOLT12). Currencies without decimal units (JPY, KRW, etc.) have special formatting logic here.
- [src/styles.js](src/styles.js) — CSS-in-JS style objects (CARD, LABEL, BTN_PRIMARY, etc.) used inline across components.
- [src/hooks/useLiveBTC.js](src/hooks/useLiveBTC.js) — CoinGecko fetch with AbortController; returns `{ prices, changes, status, lastFetch, refetch }`.
- [src/App.jsx](src/App.jsx) — Root component, owns all state, handles responsive grid layout (breakpoints: 768px, 480px).

**Components:**
- `DCASection.jsx` — Main calculator: price projection chart (log scale, halving overlays), portfolio value chart, halving cycles bar chart, analyst targets with log-scale progress bars
- `DonationModal.jsx` / `DonationSettings.jsx` — Dual-address (on-chain + Lightning) donation flow
- `Tooltips.jsx` — Custom Recharts tooltips: `PriceTooltip`, `PortfolioTooltip`, `HistTooltip`

**DCA model:** Investment spread across years using average annual BTC price `(yearStart + yearEnd) / 2`.

**API:** CoinGecko free tier (≤30 req/min). Self-hosted deployments under heavy traffic may hit rate limits.

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
