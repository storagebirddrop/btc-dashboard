import { useState, useEffect, useRef, useCallback } from 'react'

export const CURRENCIES = [
  { code: 'usd', symbol: '$',   flag: '🇺🇸', label: 'USD' },
  { code: 'eur', symbol: '€',   flag: '🇪🇺', label: 'EUR' },
  { code: 'gbp', symbol: '£',   flag: '🇬🇧', label: 'GBP' },
  { code: 'jpy', symbol: '¥',   flag: '🇯🇵', label: 'JPY' },
  { code: 'aud', symbol: 'A$',  flag: '🇦🇺', label: 'AUD' },
  { code: 'cad', symbol: 'C$',  flag: '🇨🇦', label: 'CAD' },
  { code: 'chf', symbol: '₣',   flag: '🇨🇭', label: 'CHF' },
  { code: 'cny', symbol: '¥',   flag: '🇨🇳', label: 'CNY' },
  { code: 'inr', symbol: '₹',   flag: '🇮🇳', label: 'INR' },
  { code: 'brl', symbol: 'R$',  flag: '🇧🇷', label: 'BRL' },
  { code: 'mxn', symbol: 'M$',  flag: '🇲🇽', label: 'MXN' },
  { code: 'sgd', symbol: 'S$',  flag: '🇸🇬', label: 'SGD' },
  { code: 'krw', symbol: '₩',   flag: '🇰🇷', label: 'KRW' },
  { code: 'sek', symbol: 'kr',  flag: '🇸🇪', label: 'SEK' },
  { code: 'nok', symbol: 'kr',  flag: '🇳🇴', label: 'NOK' },
  { code: 'zar', symbol: 'R',   flag: '🇿🇦', label: 'ZAR' },
]

// Request 24h change for every currency, not just USD (#2)
const VS_WITH_CHANGE = CURRENCIES.map(c => c.code).join(',')
const REFRESH_MS     = 60_000
const CACHE_KEY      = 'btc_price_cache'
const CACHE_TTL_MS   = 12 * 60 * 60 * 1000 // 12 hours

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== 'object' || parsed === null ||
      typeof parsed.ts !== 'number' ||
      typeof parsed.prices !== 'object' || parsed.prices === null ||
      typeof parsed.changes !== 'object' || parsed.changes === null
    ) return null
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return { prices: parsed.prices, changes: parsed.changes }
  } catch { return null }
}

function saveCache(prices, changes) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ prices, changes, ts: Date.now() }))
  } catch { /* storage full or blocked — silently ignore */ }
}

export function useLiveBTC() {
  const cached = loadCache()
  const [prices,     setPrices]     = useState(cached?.prices  ?? {})
  const [changes,    setChanges]    = useState(cached?.changes ?? {})
  const [status,     setStatus]     = useState('idle') // idle | loading | ok | error
  const [lastFetch,  setLastFetch]  = useState(null)
  const timerRef    = useRef(null)
  const abortRef    = useRef(null)

  const fetchPrices = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    try {
      const url = (
        `https://api.coingecko.com/api/v3/simple/price` +
        `?ids=bitcoin` +
        `&vs_currencies=${VS_WITH_CHANGE}` +
        `&include_24hr_change=true`
      )
      const res  = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const btc  = data.bitcoin ?? {}

      const p = {}
      const c = {}
      CURRENCIES.forEach(({ code }) => {
        if (btc[code]                 != null) p[code] = btc[code]
        if (btc[`${code}_24h_change`] != null) c[code] = btc[`${code}_24h_change`]
      })

      saveCache(p, c)
      setPrices(p)
      setChanges(c)
      setLastFetch(new Date())
      setStatus('ok')
    } catch (err) {
      if (err.name === 'AbortError') return
      console.warn('BTC price fetch failed:', err.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    timerRef.current = setInterval(fetchPrices, REFRESH_MS)
    return () => {
      clearInterval(timerRef.current)
      // Fix #8: cancel pending request on unmount
      if (abortRef.current) abortRef.current.abort()
    }
  }, [fetchPrices])

  return { prices, changes, status, lastFetch, refetch: fetchPrices }
}
