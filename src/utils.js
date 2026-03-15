// ─── Address validation ───────────────────────────────────────────────────────

// On-chain: bech32 (bc1q), bech32m/taproot (bc1p), legacy (1...), P2SH (3...)
export const ONCHAIN_RE = /^(bc1[a-z0-9]{6,87}|[13][a-zA-HJ-NP-Z0-9]{25,34})$/

// Lightning Address: BOLT12-readable human format — user@domain.tld
export const LIGHTNING_ADDRESS_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

// Raw BOLT12 offer string — lowercase only per spec; no i flag
export const BOLT12_OFFER_RE = /^lno1[a-z0-9]+$/

export function classifyAddress(addr) {
  if (!addr) return null
  const t = addr.trim()
  if (ONCHAIN_RE.test(t))           return 'onchain'
  if (LIGHTNING_ADDRESS_RE.test(t)) return 'lightning'
  if (BOLT12_OFFER_RE.test(t))      return 'bolt12offer'
  return 'unknown'
}

// ─── Number formatting ────────────────────────────────────────────────────────

// Currencies where sub-unit decimals are not conventional (no cents)
const NO_DECIMAL_CURRENCIES = new Set(['jpy', 'krw', 'idr', 'vnd', 'clp'])

export function fmtPrice(n, sym, code) {
  if (n == null || isNaN(n)) return '—'
  const noDecimal = NO_DECIMAL_CURRENCIES.has(code)
  if (n >= 1e9) return `${sym}${(n / 1e9).toFixed(noDecimal ? 0 : 2)}B`
  if (n >= 1e6) return `${sym}${(n / 1e6).toFixed(noDecimal ? 0 : 2)}M`
  if (n >= 1e3) return `${sym}${(n / 1e3).toFixed(noDecimal ? 0 : 1)}K`
  return `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: noDecimal ? 0 : 2 })}`
}

export function fmtPct(n) {
  if (n == null || isNaN(n)) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}
