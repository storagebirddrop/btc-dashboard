# BTC 2040 Dashboard

Bitcoin investment dashboard with live pricing, multi-currency support, DCA calculator, CAGR projections, halving cycles, portfolio modeling, and analyst forecasts.

Live at **[bitcoin.monster.bucket](https://bitcoin.monster.bucket)**

Built by [@storagebirddrop](https://github.com/storagebirddrop)

---

## Quick Start

```bash
cp .env.example .env        # add your Lightning address (optional)
docker compose up --build -d
# → http://localhost:34000
```

---

## Features

| Feature | Detail |
|---|---|
| **Live BTC Price** | CoinGecko free tier · refreshes every 60s · 24h change · 12h localStorage cache fallback |
| **16 Fiat Currencies** | USD EUR GBP JPY AUD CAD CHF CNY INR BRL MXN SGD KRW SEK NOK ZAR — all with live rates and 24h change |
| **Price Projection** | 4 CAGR scenarios (Bear 20% / Base 40% / Bull 60% / Ultra 80%) to 2040 on a log scale with halving overlays |
| **Portfolio Modeler** | Lump-sum entry from any year, all scenarios, return multiple at 2040 |
| **DCA Calculator** | Monthly buy amount + start year + scenario → accumulated BTC + portfolio value to 2040 |
| **Halving Cycles** | Annual returns bar chart 2011–present (auto-fetches new years), pre/post halving price cards |
| **Analyst Forecasts** | 12 institutional targets — ARK (3 cases), Fidelity, Standard Chartered, Cathie Wood, Arthur Hayes, Pantera, Raoul Pal, Novogratz, Saylor — log-scale progress bars |
| **Lightning Donation** | Owner-configured Lightning Address or BOLT12 offer via env var — copy-to-clipboard modal |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_LIGHTNING_ADDRESS=you@domain.com   # Lightning Address or lno1... BOLT12 offer
```

If `VITE_LIGHTNING_ADDRESS` is not set the donation button is hidden. The address is baked into the build at compile time — visitors cannot change it.

---

## Local Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build on port 4173
```

Requires Node ≥ 20. If using nvm: `nvm use` picks up `.nvmrc` automatically.

---

## Docker Deployment

### Standard (CLI)

```bash
# Start
docker compose up --build -d    # http://localhost:34000

# Logs
docker compose logs -f

# Stop
docker compose down
```

### Dockge (TrueNAS Scale / self-hosted)

1. SSH into the host and run the deploy script to pull the latest code:
   ```bash
   bash scripts/deploy.sh
   ```
2. Open Dockge → select **btc-dashboard** → click **Build** then **Restart**.

That's it — Dockge owns the container lifecycle, so the script only syncs the code and prunes old images. Do not run `docker compose up` manually alongside Dockge.

The production image is a two-stage build — Node 25 Alpine builds the Vite bundle, Nginx 1.29 Alpine serves it. Final image has no Node runtime.

---

## Nginx & Security

The bundled `nginx.conf` includes:

- **HSTS** — `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **CSP** — restricts scripts, styles, fonts, and connections to known sources (self + Google Fonts + CoinGecko)
- **X-Frame-Options: DENY** — no iframe embedding
- **X-Content-Type-Options: nosniff**
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — blocks camera, microphone, geolocation
- **1-year immutable cache** for hashed static assets
- **Gzip compression** for text, CSS, JS, JSON
- **SPA fallback** — all routes return `index.html`

The container serves plain HTTP on port 80. Place a reverse proxy (Caddy, Traefik, nginx) in front for HTTPS termination — TLS is handled upstream.

---

## Architecture

```
src/
├── App.jsx                     # Root — all state, responsive layout, 8 sections
├── constants.js                # CAGR scenarios, analysts, halvings, currencies
├── utils.js                    # fmtPrice(), fmtPct(), address classification
├── styles.js                   # CSS-in-JS style objects (CARD, BTN_*, etc.)
├── hooks/
│   ├── useLiveBTC.js           # CoinGecko polling + localStorage cache
│   └── useHistoricalReturns.js # Auto-fetches annual returns for new years
└── components/
    ├── DCASection.jsx          # DCA calculator with geometric mean model
    ├── DonationModal.jsx       # Copy-to-clipboard Lightning modal
    ├── DonationSettings.jsx    # Read-only donation address display
    ├── PriceTicker.jsx         # Live price + 24h change + status
    ├── CurrencySelector.jsx    # 16-currency dropdown with flags
    ├── Tooltips.jsx            # Recharts custom tooltips
    └── Section.jsx             # Reusable card wrapper
```

**Data flow:** `useLiveBTC` polls CoinGecko every 60s → `App.jsx` state → child components via props. No external state library.

**Currency conversion:** A single `fxRate = prices[currency] / prices['usd']` is the source of truth — all projections are computed in USD and converted at render time.

**DCA model:** Uses geometric mean for the time-weighted average purchase price per year: `liveUSD × (1 + cagr)^(year + 0.5)` — more accurate than arithmetic midpoint for exponential growth curves.

**Historical returns:** Years 2011–2024 are hardcoded. Any year from 2025 onward is fetched live from CoinGecko's `/market_chart/range` endpoint on page load, with the current year always marked as a partial-year estimate.

---

## Customising

All configurable values live in [`src/constants.js`](src/constants.js):

- **CAGR scenarios** — adjust rates, labels, colors
- **ANALYSTS** — add/remove/update analyst targets and years
- **HALVING_DETAILS** — pre/post halving price labels
- **CURRENCIES** — add or remove supported currencies

---

## Dependency Updates

Dependabot opens PRs weekly for npm and monthly for Docker base images. The CI build must pass before merging. After merging on GitHub:

1. SSH into the host → `bash scripts/deploy.sh` (pulls code, prunes images)
2. Open Dockge → **Build** → **Restart**

Major version bumps (React, Vite) should be tested locally with `npm run build` before merging — they sometimes require coordinated upgrades across interdependent packages.

---

## CI / Branch Protection

GitHub Actions runs `npm ci && npm run build` on every push and pull request to `main`. The `build` check is required to pass before merging (branch ruleset).

---

## Disclaimer

For educational purposes only. All projections are speculative. Bitcoin is highly volatile — past performance does not guarantee future results. Not financial advice.
