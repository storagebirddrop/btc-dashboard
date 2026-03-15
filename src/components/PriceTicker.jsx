import { CURRENCIES } from '../hooks/useLiveBTC.js'

export default function PriceTicker({ prices, changes, status, lastFetch, refetch, currency }) {
  const cur   = CURRENCIES.find(c => c.code === currency)
  const price = prices[currency]
  // Fix #2: read per-currency change, not hardcoded USD
  const change = changes[currency] ?? null
  const up     = change != null && change >= 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minHeight: 32 }}>
      {status === 'loading' && price == null && (
        <span style={{ color: '#4b5563', fontSize: 12 }}>Fetching live price…</span>
      )}

      {price != null && (
        <>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 22,
            color: '#f59e0b',
            fontWeight: 500,
          }}>
            {cur?.symbol}{price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>

          {change != null && (
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'DM Mono', monospace",
              color: up ? '#10b981' : '#ef4444',
              background: up ? '#10b98118' : '#ef444418',
              border: `1px solid ${up ? '#10b98133' : '#ef444433'}`,
              borderRadius: 6,
              padding: '3px 8px',
            }}>
              {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}% 24h
            </div>
          )}

          {lastFetch && (
            <div style={{ fontSize: 10, color: '#374151' }}>
              Updated {lastFetch.toLocaleTimeString()}
            </div>
          )}
        </>
      )}

      {status === 'error' && (
        <div style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
          Live price unavailable — using fallback
          <button
            onClick={refetch}
            style={{
              background: 'transparent',
              border: '1px solid #ef444444',
              borderRadius: 6,
              color: '#ef4444',
              fontSize: 10,
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
