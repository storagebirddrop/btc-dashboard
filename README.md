# BTC 2040 Dashboard v2

Bitcoin investment indicator with live price, multi-currency, DCA calculator, halving cycles, portfolio modeling, analyst forecasts, and BOLT12/Lightning + on-chain donation addresses.

## Quick Start

```bash
docker compose up --build -d
# → http://localhost:3000
```

## Features

| Feature | Detail |
|---|---|
| **Live BTC Price** | CoinGecko API · auto-refreshes every 60s · 24h change indicator |
| **16 Fiat Currencies** | USD EUR GBP JPY AUD CAD CHF CNY INR BRL MXN SGD KRW SEK NOK ZAR |
| **Price Projection** | 4 CAGR scenarios to 2040, log scale, halving overlays |
| **Portfolio Modeler** | Lump-sum from any entry year, all scenarios |
| **DCA Calculator** | Monthly buy amount + start year + scenario → 2040 portfolio value |
| **Halving Cycles** | 2011–2025 annual returns bar chart, pre/post halving prices |
| **Analyst Forecasts** | ARK, Fidelity, Standard Chartered, Cathie Wood — converted to chosen currency |
| **Donation Addresses** | On-chain BTC (bech32/legacy/P2SH) + Lightning Address (BOLT12-readable `user@domain.com`) or raw BOLT12 offer (`lno1...`) |

## Donation Address Support

The donation settings panel accepts two separate addresses:

- **On-chain BTC** — any valid address: `bc1q...` (bech32), `bc1p...` (bech32m/taproot), `1...` (legacy), `3...` (P2SH)
- **Lightning Address** — BOLT12-readable `user@domain.com` format supported by Phoenix, Mutiny, Zeus, and others. Raw BOLT12 offers (`lno1...`) also accepted.

Both are displayed side-by-side in the donation modal with separate copy buttons.

## Docker Commands

```bash
# Start
docker compose up -d

# Rebuild after code changes
docker compose up --build -d

# Stop
docker compose down

# Logs
docker compose logs -f
```

## Local Dev (no Docker)

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Notes

- All projections are in the selected fiat currency, converted from USD via live CoinGecko rates
- DCA model uses average annual BTC price (midpoint between year-start and year-end) for each year's purchases
- Ultra-Bull (80% CAGR) implies ~$1 quadrillion market cap by 2040 — treat as a mathematical extreme
- **Not financial advice**

## Disclaimer

For educational purposes only. Bitcoin is highly volatile. Past performance does not guarantee future results.
