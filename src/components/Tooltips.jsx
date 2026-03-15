import { ALL_HALVINGS } from '../constants.js'
import { fmtPrice, fmtPct } from '../utils.js'
import { TT_WRAP } from '../styles.js'

function TooltipHeader({ label }) {
  const isHalving = ALL_HALVINGS.includes(label)
  return (
    <div style={{
      fontFamily: "'Syne', sans-serif",
      color: isHalving ? '#f59e0b' : '#e5e7eb',
      fontWeight: 700,
      marginBottom: 8,
      fontSize: 13,
    }}>
      {label}{isHalving ? ' ⚡ Halving' : ''}
    </div>
  )
}

function TooltipRow({ name, value, color, sym, code }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
      <span style={{ color, fontSize: 11 }}>{name}</span>
      <span style={{ color: '#fff', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
        {fmtPrice(value, sym, code)}
      </span>
    </div>
  )
}

export function PriceTooltip({ active, payload, label, sym, code }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TT_WRAP}>
      <TooltipHeader label={label} />
      {payload.map(p => (
        <TooltipRow key={p.name} name={p.name} value={p.value} color={p.color} sym={sym} code={code} />
      ))}
    </div>
  )
}

export function PortfolioTooltip({ active, payload, label, investment, sym, code }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TT_WRAP}>
      <TooltipHeader label={label} />
      {payload.map(p => {
        const mult = investment > 0 ? (p.value / investment).toFixed(1) : '—'
        return (
          <div key={p.name} style={{ marginBottom: 5 }}>
            <TooltipRow name={p.name} value={p.value} color={p.color} sym={sym} code={code} />
            <div style={{ color: '#6b7280', fontSize: 10, textAlign: 'right' }}>{mult}× return</div>
          </div>
        )
      })}
    </div>
  )
}

export function HistTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div style={TT_WRAP}>
      <div style={{ fontFamily: "'Syne', sans-serif", color: '#e5e7eb', fontWeight: 700, marginBottom: 4, fontSize: 13 }}>
        {label}
      </div>
      <div style={{
        color: val >= 0 ? '#10b981' : '#ef4444',
        fontFamily: "'DM Mono', monospace",
        fontSize: 20,
        fontWeight: 600,
      }}>
        {fmtPct(val)}
      </div>
      <div style={{ color: '#6b7280', fontSize: 10, marginTop: 2 }}>annual return</div>
    </div>
  )
}

// Fix #3: DCATooltip defined at module level — never inside a render body
export function DCATooltip({ active, payload, label, sym, code }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TT_WRAP}>
      <TooltipHeader label={label} />
      {payload.map(p => (
        <TooltipRow key={p.name} name={p.name} value={p.value} color={p.color} sym={sym} code={code} />
      ))}
    </div>
  )
}
