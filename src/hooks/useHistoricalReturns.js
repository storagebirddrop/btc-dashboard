import { useState, useEffect } from 'react'
import { HISTORICAL, CURRENT_YEAR } from '../constants.js'

// Returns Jan 1 00:00 UTC unix timestamp for a given year
const jan1 = (year) => Math.floor(Date.UTC(year, 0, 1) / 1000)
// Returns Jan 2 00:00 UTC unix timestamp — small window to get opening price
const jan2 = (year) => Math.floor(Date.UTC(year, 0, 2) / 1000)

async function fetchYearReturn(year, signal) {
  const isCurrentYear = year === CURRENT_YEAR

  // For completed years: fetch Jan 1 open → Dec 31 close
  // For current year:    fetch Jan 1 open → now (YTD)
  const from = jan1(year)
  const to   = isCurrentYear ? Math.floor(Date.now() / 1000) : jan1(year + 1)

  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const { prices } = await res.json()
  if (!prices?.length) throw new Error('no price data')

  const open  = prices[0][1]
  const close = prices[prices.length - 1][1]
  const ret   = Math.round(((close - open) / open) * 100)
  return { year, ret, estimated: isCurrentYear }
}

export function useHistoricalReturns() {
  const lastHardcoded = HISTORICAL[HISTORICAL.length - 1].year
  const [extra, setExtra] = useState([])

  useEffect(() => {
    if (lastHardcoded >= CURRENT_YEAR) return // nothing to fetch

    const controller = new AbortController()
    const yearsToFetch = []
    for (let y = lastHardcoded + 1; y <= CURRENT_YEAR; y++) yearsToFetch.push(y)

    // Fetch years sequentially to avoid hammering the free-tier rate limit
    ;(async () => {
      const results = []
      for (const year of yearsToFetch) {
        try {
          const entry = await fetchYearReturn(year, controller.signal)
          results.push(entry)
          // Brief pause between requests to respect CoinGecko free tier (≤30/min)
          if (year < CURRENT_YEAR) await new Promise(r => setTimeout(r, 1200))
        } catch (err) {
          if (err.name === 'AbortError') return
          console.warn(`Historical return fetch failed for ${year}:`, err.message)
        }
      }
      if (results.length) setExtra(results)
    })()

    return () => controller.abort()
  }, [lastHardcoded])

  return extra
}
