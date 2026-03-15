// ─── Time ─────────────────────────────────────────────────────────────────────
// Derived at runtime so it never needs a manual annual update
export const CURRENT_YEAR = new Date().getFullYear()

export const FALLBACK_USD = 84000

export const DEFAULT_LIGHTNING = import.meta.env.VITE_LIGHTNING_ADDRESS ?? ''

// ─── Halvings ─────────────────────────────────────────────────────────────────
export const HALVINGS_HIST = [2012, 2016, 2020, 2024]
export const HALVINGS_PROJ = [2028, 2032, 2036, 2040]
export const ALL_HALVINGS  = [...HALVINGS_HIST, ...HALVINGS_PROJ]

export const HALVING_DETAILS = [
  { year: 2012, pre: '$12',     post: '$1,200',  label: '1st Halving' },
  { year: 2016, pre: '$650',    post: '$20,000', label: '2nd Halving' },
  { year: 2020, pre: '$9,000',  post: '$69,000', label: '3rd Halving' },
  { year: 2024, pre: '$30,000', post: '$110K+',  label: '4th Halving' },
]

// ─── Scenarios ────────────────────────────────────────────────────────────────
export const SCENARIOS = {
  bear:  { label: 'Bear',       cagr: 20, color: '#ef4444', note: 'Slowdown / regulatory headwinds (not a crash scenario)' },
  base:  { label: 'Base',       cagr: 40, color: '#f59e0b', note: 'Continued institutional adoption' },
  bull:  { label: 'Bull',       cagr: 60, color: '#10b981', note: 'Digital gold + ETF inflows' },
  ultra: { label: 'Ultra-Bull', cagr: 80, color: '#818cf8', note: 'Global reserve asset — implies ~$1 quadrillion market cap by 2040 ⚠️' },
}

// ─── Historical returns ───────────────────────────────────────────────────────
// 2025 is flagged as estimated — full year not yet complete at time of writing
export const HISTORICAL = [
  { year: 2011, ret: 1473,  estimated: false },
  { year: 2012, ret: 186,   estimated: false },
  { year: 2013, ret: 5189,  estimated: false },
  { year: 2014, ret: -58,   estimated: false },
  { year: 2015, ret: 35,    estimated: false },
  { year: 2016, ret: 125,   estimated: false },
  { year: 2017, ret: 1318,  estimated: false },
  { year: 2018, ret: -73,   estimated: false },
  { year: 2019, ret: 94,    estimated: false },
  { year: 2020, ret: 302,   estimated: false },
  { year: 2021, ret: 60,    estimated: false },
  { year: 2022, ret: -65,   estimated: false },
  { year: 2023, ret: 155,   estimated: false },
  { year: 2024, ret: 120,   estimated: false },
  { year: 2025, ret: 60,    estimated: 2025 >= CURRENT_YEAR }, // partial if year not yet complete
]

// ─── Analyst forecasts ────────────────────────────────────────────────────────
export const ANALYSTS = [
  { name: 'Standard Chartered', target: 150000,     year: 2026, tier: 'bank'  },
  { name: 'ARK Bear Case',       target: 300000,     year: 2030, tier: 'fund'  },
  { name: 'ARK Base Case',       target: 710000,     year: 2030, tier: 'fund'  },
  { name: 'ARK Bull Case',       target: 1500000,    year: 2030, tier: 'fund'  },
  { name: 'Cathie Wood',         target: 1000000,    year: 2030, tier: 'fund'  },
  { name: 'Michael Saylor',      target: 1000000,    year: 2030, tier: 'corp'  },
  { name: 'Arthur Hayes',        target: 1000000,    year: 2028, tier: 'fund'  },
  { name: 'Pantera Capital',     target: 740000,     year: 2028, tier: 'fund'  },
  { name: 'Raoul Pal',          target: 1000000,    year: 2030, tier: 'fund'  },
  { name: 'Mike Novogratz',     target: 500000,     year: 2030, tier: 'fund'  },
  { name: 'CoinCodex Model',     target: 1000000,    year: 2040, tier: 'quant' },
  { name: 'Fidelity (Timmer)',   target: 1000000000, year: 2040, tier: 'bank', outlier: true },
]

export const TIER_COLORS = {
  bank:  '#60a5fa',
  fund:  '#34d399',
  corp:  '#f59e0b',
  quant: '#c084fc',
}

// Log scale bounds for analyst bar — in USD; converted at render time
export const ANALYST_LOG_MIN_USD = 50000
export const ANALYST_LOG_MAX_USD = 2e9
