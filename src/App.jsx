import { useState, useMemo, useRef, useCallback } from 'react'
import {
  ComposedChart, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

import { useLiveBTC, CURRENCIES }         from './hooks/useLiveBTC.js'
import { useHistoricalReturns }           from './hooks/useHistoricalReturns.js'
import {
  CURRENT_YEAR, FALLBACK_USD, DEFAULT_LIGHTNING,
  HALVINGS_HIST, HALVINGS_PROJ,
  HISTORICAL, ANALYSTS,
  ANALYST_LOG_MIN_USD, ANALYST_LOG_MAX_USD,
  SCENARIOS, TIER_COLORS, HALVING_DETAILS,
}                                          from './constants.js'
import { fmtPrice }                        from './utils.js'
import { CARD, LABEL, TICK, RANGE_LABELS } from './styles.js'

import Section          from './components/Section.jsx'
import CurrencySelector from './components/CurrencySelector.jsx'
import PriceTicker      from './components/PriceTicker.jsx'
import DonationModal    from './components/DonationModal.jsx'
import DonationSettings from './components/DonationSettings.jsx'
import DCASection       from './components/DCASection.jsx'
import { PriceTooltip, PortfolioTooltip, HistTooltip } from './components/Tooltips.jsx'

export default function App() {
  const { prices, changes, status, lastFetch, refetch } = useLiveBTC()
  const extraReturns = useHistoricalReturns()
  const historicalData = [...HISTORICAL, ...extraReturns]

  const [currency,        setCurrency]       = useState('usd')
  const [investment,      setInvestment]     = useState(10000)
  const prevFxRef = useRef(1)
  const [entryYear,       setEntryYear]      = useState(CURRENT_YEAR)
  const [activeScenarios, setActiveScenarios]= useState(['bear', 'base', 'bull'])
  const lightning = DEFAULT_LIGHTNING
  const [showDonation,    setShowDonation]   = useState(false)

  const cur     = CURRENCIES.find(c => c.code === currency)
  const sym     = cur?.symbol ?? '$'
  const liveUSD = prices['usd'] ?? FALLBACK_USD

  // Fix #14: single fxRate source of truth — drives projections AND analyst bar labels
  const fxRate = useMemo(() => {
    if (prices['usd'] && prices[currency]) return prices[currency] / prices['usd']
    return 1
  }, [prices, currency])

  // Rescale investment when currency switches so the displayed amount tracks real value
  const handleCurrencyChange = useCallback((newCode) => {
    setCurrency(newCode)
    if (prices['usd'] && prices[newCode] && prices[currency]) {
      const oldRate = prices[currency] / prices['usd']
      const newRate = prices[newCode]  / prices['usd']
      setInvestment(prev => Math.round((prev / oldRate) * newRate / 500) * 500)
      prevFxRef.current = newRate
    }
  }, [prices, currency])

  const toggleScenario = k =>
    setActiveScenarios(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k])

  const projData = useMemo(() => {
    const rows = []
    for (let yr = CURRENT_YEAR; yr <= 2040; yr++) {
      const row = { year: yr }
      Object.entries(SCENARIOS).forEach(([key, { cagr }]) => {
        const usdPrice     = liveUSD * Math.pow(1 + cagr / 100, yr - CURRENT_YEAR)
        row[`${key}Price`] = Math.round(usdPrice * fxRate)
        if (yr >= entryYear) {
          const entryUSD    = liveUSD * Math.pow(1 + cagr / 100, entryYear - CURRENT_YEAR)
          const btcAmt      = (investment / fxRate) / entryUSD
          row[`${key}Port`] = Math.round(btcAmt * usdPrice * fxRate)
        }
      })
      rows.push(row)
    }
    return rows
  }, [liveUSD, fxRate, investment, entryYear])

  const portData  = useMemo(() => projData.filter(d => d.year >= entryYear), [projData, entryYear])
  const final2040 = useMemo(() => {
    const last = projData[projData.length - 1]
    const out  = {}
    Object.keys(SCENARIOS).forEach(k => {
      out[k] = { price: last[`${k}Price`], port: last[`${k}Port`] }
    })
    return out
  }, [projData])

  const activeKeys  = Object.keys(SCENARIOS).filter(k => activeScenarios.includes(k))
  const hasDonation = !!lightning

  return (
    <>
      {/* Fix #19: mobile breakpoints via injected stylesheet */}
      <style>{`
        @media (max-width: 768px) {
          .grid-controls  { grid-template-columns: 1fr !important; }
          .grid-4col      { grid-template-columns: 1fr 1fr !important; }
          .grid-2col      { grid-template-columns: 1fr !important; }
          .halving-grid   { grid-template-columns: 1fr !important; }
          .header-row     { flex-direction: column !important; align-items: flex-start !important; }
          .dca-controls   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .grid-4col      { grid-template-columns: 1fr !important; }
          .dca-controls   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 16px 48px' }}>

        {showDonation && hasDonation && (
          <DonationModal
            lightning={lightning}
            onClose={() => setShowDonation(false)}
          />
        )}

        {/* ── Header ── */}
        <div className="header-row" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 24, gap: 16,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg,#f59e0b,#b45309)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>₿</div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(18px, 4vw, 27px)',
                fontWeight: 800, margin: 0, letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg,#f59e0b,#fde68a,#f59e0b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Bitcoin 2040 Indicator
              </h1>
            </div>
            <PriceTicker
              prices={prices} changes={changes}
              status={status} lastFetch={lastFetch}
              refetch={refetch} currency={currency}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <CurrencySelector selected={currency} setSelected={handleCurrencyChange} />
            {hasDonation && (
              <button onClick={() => setShowDonation(true)} style={{
                background: '#f59e0b15', border: '1px solid #f59e0b44',
                borderRadius: 9, padding: '9px 16px', color: '#f59e0b',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                ₿ Donate
              </button>
            )}
          </div>
        </div>

        {/* ── Controls + Donation ── */}
        <div className="grid-controls" style={{
          display: 'grid', gridTemplateColumns: '1fr 340px',
          gap: 16, marginBottom: 20, alignItems: 'start',
        }}>
          <div style={{ ...CARD, padding: '22px 24px' }}>
            <div className="grid-2col" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 24, marginBottom: 20,
            }}>
              <div>
                <label style={{ ...LABEL, marginBottom: 8 }}>Investment · {cur?.label}</label>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: '#f59e0b', marginBottom: 8 }}>
                  {sym}{investment.toLocaleString()}
                </div>
                <input type="range" min={500} max={500000} step={500}
                  value={investment} onChange={e => setInvestment(Number(e.target.value))} />
                <div style={RANGE_LABELS}><span>{sym}500</span><span>{sym}500K</span></div>
              </div>
              <div>
                <label style={{ ...LABEL, marginBottom: 8 }}>Entry Year</label>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: '#f59e0b', marginBottom: 8 }}>
                  {entryYear}
                </div>
                <input type="range" min={CURRENT_YEAR} max={2035} step={1}
                  value={entryYear} onChange={e => setEntryYear(Number(e.target.value))} />
                <div style={RANGE_LABELS}><span>{CURRENT_YEAR}</span><span>2035</span></div>
              </div>
            </div>

            <label style={{ ...LABEL, marginBottom: 10 }}>Active Scenarios</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(SCENARIOS).map(([key, { label, cagr, color }]) => {
                const on = activeScenarios.includes(key)
                return (
                  <button key={key} onClick={() => toggleScenario(key)} style={{
                    padding: '6px 13px', borderRadius: 99,
                    background: on ? `${color}18` : 'transparent',
                    border: `1.5px solid ${on ? color : '#2a2a3a'}`,
                    color: on ? color : '#4b5563',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                  }}>
                    {label} · {cagr}%
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: '#374151', marginTop: 10 }}>
              Historical CAGR ref: 5yr ~55% · 10yr ~84% · 14yr ~102%
            </p>
          </div>

          <DonationSettings lightning={lightning} />
        </div>

        {/* ── Metric summary ── */}
        {/* Fix #23: keyed by scenario string not index */}
        <div className="grid-4col" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 12, marginBottom: 20,
        }}>
          {Object.entries(SCENARIOS).map(([key, { label, color }]) => {
            const d   = final2040[key]
            const on  = activeKeys.includes(key)
            const mult = d?.port ? (d.port / investment).toFixed(1) : null
            return (
              <div key={key} style={{
                ...CARD, padding: '15px 17px',
                borderColor: on ? `${color}44` : '#1a1a2e',
                opacity: on ? 1 : 0.4, transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                  {label} · 2040
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color, fontWeight: 500, marginBottom: 2 }}>
                  {fmtPrice(d?.price, sym, currency)}
                </div>
                <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 7 }}>BTC price target</div>
                {mult && (
                  <>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#9ca3af' }}>
                      {fmtPrice(d?.port, sym, currency)}
                    </div>
                    <div style={{ fontSize: 10, color: '#4b5563' }}>{mult}× on {sym}{investment.toLocaleString()}</div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Section 1: Price Projection ── */}
        <Section title={`Price Projection ${CURRENT_YEAR} – 2040`} sub={`Log scale · ⚡ halvings · ${cur?.label} via live rate`}>
          <ResponsiveContainer width="100%" height={310}>
            <ComposedChart data={projData} margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
              <defs>
                {Object.entries(SCENARIOS).map(([k, { color }]) => (
                  <linearGradient key={k} id={`pg-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#12121e" vertical={false} />
              <XAxis dataKey="year" tick={TICK} tickLine={false} axisLine={{ stroke: '#1a1a2e' }} />
              <YAxis scale="log" domain={['auto','auto']}
                tickFormatter={v => fmtPrice(v, sym, currency)}
                tick={TICK} tickLine={false} axisLine={false} width={84} />
              <Tooltip content={(props) => <PriceTooltip {...props} sym={sym} code={currency} />} />
              {HALVINGS_PROJ.map(y => (
                <ReferenceLine key={y} x={y} stroke="#f59e0b" strokeOpacity={0.22} strokeDasharray="4 4"
                  label={{ value: '⚡', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 11, dy: -4 }} />
              ))}
              {activeKeys.map(k => (
                <Area key={k} type="monotone" dataKey={`${k}Price`} name={SCENARIOS[k].label}
                  stroke={SCENARIOS[k].color} strokeWidth={2} fill={`url(#pg-${k})`}
                  dot={false} activeDot={{ r: 4, fill: SCENARIOS[k].color, stroke: '#050508', strokeWidth: 2 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </Section>

        {/* ── Section 2: Portfolio Value ── */}
        <Section
          title={`Portfolio · ${sym}${investment.toLocaleString()} entered ${entryYear}`}
          sub="Lump-sum — value of your BTC position through 2040"
        >
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={portData} margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
              <defs>
                {Object.entries(SCENARIOS).map(([k, { color }]) => (
                  <linearGradient key={k} id={`portg-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#12121e" vertical={false} />
              <XAxis dataKey="year" tick={TICK} tickLine={false} axisLine={{ stroke: '#1a1a2e' }} />
              <YAxis tickFormatter={v => fmtPrice(v, sym, currency)}
                tick={TICK} tickLine={false} axisLine={false} width={84} />
              <Tooltip content={(props) => <PortfolioTooltip {...props} investment={investment} sym={sym} code={currency} />} />
              <ReferenceLine y={investment} stroke="#fff" strokeOpacity={0.1} strokeDasharray="4 4"
                label={{ value: 'Cost basis', position: 'right', fill: '#4b5563', fontSize: 9 }} />
              {HALVINGS_PROJ.filter(y => y >= entryYear).map(y => (
                <ReferenceLine key={y} x={y} stroke="#f59e0b" strokeOpacity={0.18} strokeDasharray="4 4" />
              ))}
              {activeKeys.map(k => (
                <Area key={k} type="monotone" dataKey={`${k}Port`}
                  name={`${SCENARIOS[k].label} Portfolio`}
                  stroke={SCENARIOS[k].color} strokeWidth={2} fill={`url(#portg-${k})`}
                  dot={false} activeDot={{ r: 4, fill: SCENARIOS[k].color, stroke: '#050508', strokeWidth: 2 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </Section>

        {/* ── Section 3: DCA — Fix #1 fxRate passed down ── */}
        <DCASection liveUSD={liveUSD} fxRate={fxRate} currency={currency} sym={sym} />

        {/* ── Section 4: Halving Cycles ── */}
        <Section
          title="Halving Cycles & Historical Returns"
          sub="Annual % return 2011–2025 · ⚡ = halving year · grey bar = partial-year estimate"
        >
          <div className="halving-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 230px',
            gap: 24, alignItems: 'start',
          }}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={historicalData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12121e" vertical={false} />
                <XAxis dataKey="year" tick={TICK} tickLine={false} axisLine={{ stroke: '#1a1a2e' }} />
                <YAxis tickFormatter={v => `${v}%`} tick={TICK} tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<HistTooltip />} />
                <ReferenceLine y={0} stroke="#ffffff" strokeOpacity={0.07} />
                {HALVINGS_HIST.map(y => (
                  <ReferenceLine key={y} x={y} stroke="#f59e0b" strokeOpacity={0.35} strokeDasharray="4 4"
                    label={{ value: '⚡', position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }} />
                ))}
                <Bar dataKey="ret" name="Annual Return" radius={[3, 3, 0, 0]}>
                  {/* Fix #16: estimated years shown grey + translucent */}
                  {historicalData.map(d => (
                    <Cell
                      key={d.year}
                      fill={d.estimated ? '#6b7280' : d.ret >= 0 ? '#f59e0b' : '#ef4444'}
                      fillOpacity={d.estimated ? 0.45 : 0.85}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {HALVING_DETAILS.map(h => (
                <div key={h.year} style={{
                  background: '#070712', border: '1px solid #1a1a2e',
                  borderRadius: 9, padding: '10px 12px',
                }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 3 }}>
                    ⚡ {h.label} ({h.year})
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {h.pre} → <span style={{ color: '#10b981', fontFamily: "'DM Mono', monospace" }}>{h.post}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 12px', background: '#f59e0b08', border: '1px solid #f59e0b22', borderRadius: 9 }}>
                <div style={{ fontSize: 10, color: '#f59e0b88', marginBottom: 3 }}>Next halving</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: '#f59e0b' }}>2028 ⚡</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Block reward → 1.5625 BTC</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#6b7280', opacity: 0.45 }} />
                <span style={{ fontSize: 10, color: '#4b5563' }}>Grey = partial-year estimate</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section 5: Analyst Forecasts ── */}
        <Section title="Analyst Price Targets" sub="Institutional research consensus · All projections speculative">
          {/* Fix #24: rate limit caveat for self-hosters */}
          <div style={{ marginBottom: 14, padding: '8px 12px', background: '#818cf808', border: '1px solid #818cf822', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
              ℹ️ Live prices via CoinGecko free tier (≤30 req/min). High-traffic self-hosted deployments may hit rate limits — consider a paid API key or caching proxy.
            </p>
          </div>

          {/* Fix #23: keyed by analyst name */}
          <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {ANALYSTS.map(a => {
              // Fix #14: log scale always USD; only the displayed value converts
              const logMin     = Math.log10(ANALYST_LOG_MIN_USD)
              const logMax     = Math.log10(ANALYST_LOG_MAX_USD)
              const pct        = Math.min(((Math.log10(a.target) - logMin) / (logMax - logMin)) * 100, 100)
              const tc         = TIER_COLORS[a.tier]
              const convTarget = Math.round(a.target * fxRate)
              return (
                <div key={a.name} style={{
                  background: '#070712',
                  border: `1px solid ${a.outlier ? '#f59e0b44' : '#1a1a2e'}`,
                  borderRadius: 11, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600, marginBottom: 5 }}>{a.name}</div>
                      <span style={{ padding: '2px 7px', background: `${tc}18`, border: `1px solid ${tc}44`, borderRadius: 99, fontSize: 9, color: tc }}>{a.tier}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: '#f59e0b', fontWeight: 500 }}>
                        {fmtPrice(convTarget, sym, currency)}
                      </div>
                      <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>by {a.year}</div>
                      {a.outlier && <div style={{ fontSize: 9, color: '#f59e0b99', marginTop: 3 }}>⚠️ extreme outlier</div>}
                    </div>
                  </div>
                  <div style={{ background: '#1a1a2e', borderRadius: 3, height: 3 }}>
                    <div style={{ background: `linear-gradient(90deg,#b45309,${tc})`, borderRadius: 3, height: 3, width: `${pct}%` }} />
                  </div>
                  {/* Fix #14: labels clearly marked as USD reference scale */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9, color: '#374151' }}>
                    <span>$50K USD</span><span>$2B USD</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 12, padding: '12px 14px', background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 10 }}>
            <p style={{ fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.7 }}>
              ⚠️ All analyst forecasts are speculative and for educational purposes only. Past performance does not guarantee future results.
              Bitcoin is highly volatile — you may lose some or all of your investment.
              Ultra-Bull (80% CAGR) implies a ~$1 quadrillion market cap by 2040; treat as a mathematical ceiling, not a prediction.
            </p>
          </div>
        </Section>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#1f2937', marginTop: 28, lineHeight: 2 }}>
          Price data: CoinGecko · Projections: ARK Invest 2025, Fidelity, Standard Chartered · Not financial advice
          <br />
          <a
            href="https://github.com/storagebirddrop"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = '#818cf8'}
            onMouseLeave={e => e.target.style.color = '#374151'}
          >
            Built by @storagebirddrop
          </a>
        </div>
      </div>
    </>
  )
}
