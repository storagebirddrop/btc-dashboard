import { useState, useMemo } from 'react'
import {
  ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { SCENARIOS, CURRENT_YEAR, ALL_HALVINGS } from '../constants.js'
import { fmtPrice } from '../utils.js'
import { LABEL, TICK, RANGE_LABELS } from '../styles.js'
import Section from './Section.jsx'
// Fix #3: DCATooltip imported from module — never defined inside render
import { DCATooltip } from './Tooltips.jsx'

export default function DCASection({ liveUSD, fxRate, currency, sym }) {
  const [monthly,   setMonthly]   = useState(200)
  const [startYear, setStartYear] = useState(CURRENT_YEAR)
  const [scenario,  setScenario]  = useState('base')

  const sc = SCENARIOS[scenario]

  const dcaData = useMemo(() => {
    const rows = []
    let totalInvestedUSD = 0
    let totalBTC         = 0

    for (let yr = startYear; yr <= 2040; yr++) {
      const yearsFromNow = yr - CURRENT_YEAR
      const annualCagr   = sc.cagr / 100

      const priceEndUSD = liveUSD * Math.pow(1 + annualCagr, yearsFromNow + 1)
      // Geometric mean: more accurate time-weighted avg for exponential growth curves
      const avgPriceUSD = liveUSD * Math.pow(1 + annualCagr, yearsFromNow + 0.5)

      // Fix #1: investment amount is in selected currency — convert to USD for BTC calc
      const monthlyUSD  = monthly / fxRate
      const annualUSD   = monthlyUSD * 12
      const btcBought   = annualUSD / avgPriceUSD
      totalInvestedUSD += annualUSD
      totalBTC         += btcBought

      const portfolioUSD = totalBTC * priceEndUSD

      rows.push({
        year:           yr,
        // Fix #1: convert back to selected currency for display
        totalInvested:  Math.round(totalInvestedUSD  * fxRate),
        portfolioValue: Math.round(portfolioUSD       * fxRate),
        isHalving:      ALL_HALVINGS.includes(yr),
      })
    }
    return rows
  }, [monthly, startYear, scenario, liveUSD, fxRate])

  const last       = dcaData[dcaData.length - 1]
  const finalMulti = last && last.totalInvested > 0
    ? (last.portfolioValue / last.totalInvested).toFixed(1)
    : '—'

  return (
    <Section
      title="DCA Calculator"
      sub="Dollar-cost averaging · monthly purchase · projected to 2040"
    >
      {/* Controls */}
      <div className="dca-controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 20 }}>
        {/* Monthly amount */}
        <div>
          <label style={{ ...LABEL, marginBottom: 8 }}>Monthly {sym} Amount</label>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: '#f59e0b', marginBottom: 8 }}>
            {sym}{monthly.toLocaleString()}
          </div>
          <input
            type="range" min={10} max={10000} step={10}
            value={monthly} onChange={e => setMonthly(Number(e.target.value))}
          />
          <div style={RANGE_LABELS}><span>{sym}10</span><span>{sym}10K</span></div>
        </div>

        {/* Start year */}
        <div>
          <label style={{ ...LABEL, marginBottom: 8 }}>Start Year</label>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: '#f59e0b', marginBottom: 8 }}>
            {startYear}
          </div>
          <input
            type="range" min={CURRENT_YEAR} max={2035} step={1}
            value={startYear} onChange={e => setStartYear(Number(e.target.value))}
          />
          <div style={RANGE_LABELS}><span>{CURRENT_YEAR}</span><span>2035</span></div>
        </div>

        {/* Scenario selector */}
        <div>
          <label style={{ ...LABEL, marginBottom: 8 }}>CAGR Scenario</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(SCENARIOS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setScenario(k)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 7,
                  border: `1px solid ${k === scenario ? v.color : '#2a2a3a'}`,
                  background: k === scenario ? `${v.color}18` : 'transparent',
                  color: k === scenario ? v.color : '#4b5563',
                  fontSize: 11, fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: 'left',
                }}
              >
                {v.label} · {v.cagr}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Invested by 2040', value: fmtPrice(last?.totalInvested,  sym, currency), color: '#60a5fa' },
          { label: 'Portfolio Value 2040',   value: fmtPrice(last?.portfolioValue, sym, currency), color: sc.color  },
          { label: 'Return Multiple',        value: `${finalMulti}×`,                              color: '#10b981' },
        ].map(m => (
          <div key={m.label} style={{
            background: '#070712',
            border: `1px solid ${m.color}33`,
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 19, color: m.color, fontWeight: 500 }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={dcaData} margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="dcaPort" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={sc.color}  stopOpacity={0.25} />
              <stop offset="100%" stopColor={sc.color}  stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="dcaInvest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#60a5fa" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#12121e" vertical={false} />
          <XAxis dataKey="year" tick={TICK} tickLine={false} axisLine={{ stroke: '#1a1a2e' }} />
          <YAxis
            tickFormatter={v => fmtPrice(v, sym, currency)}
            tick={TICK} tickLine={false} axisLine={false} width={80}
          />
          {/* Fix #3: DCATooltip is a stable reference — no remount on re-render */}
          <Tooltip content={<DCATooltip sym={sym} code={currency} />} />
          {ALL_HALVINGS.filter(y => y >= startYear).map(y => (
            <ReferenceLine key={y} x={y} stroke="#f59e0b" strokeOpacity={0.2} strokeDasharray="4 4" />
          ))}
          <Area
            type="monotone" dataKey="portfolioValue" name="Portfolio Value"
            stroke={sc.color} strokeWidth={2} fill="url(#dcaPort)"
            dot={false} activeDot={{ r: 4, fill: sc.color, stroke: '#050508', strokeWidth: 2 }}
          />
          <Area
            type="monotone" dataKey="totalInvested" name="Total Invested"
            stroke="#60a5fa" strokeWidth={1.5} fill="url(#dcaInvest)"
            dot={false} activeDot={{ r: 3, fill: '#60a5fa' }} strokeDasharray="4 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Section>
  )
}
