import { useState, useEffect, useCallback } from 'react'
import { viteLocalDataUrl } from '../utils/viteLocalDataUrl'

const FY25_REVIEW_CHARTS_DEV_URL = '/local-data/fy25-review-thermostat-charts.json'
const FY25_REVIEW_CHARTS_PROD_URL = viteLocalDataUrl('generated-roadmaps/fy25-review-thermostat-charts.json')

/**
 * FY25 Review — Thermostats: Sales & Wi‑Fi Connected charts on Digital Platform.
 * Data from `Test.xlsx` sheets FY23 / FY24 / FY25 (project root or shared Test workbook in dev).
 */
export function useFy25ReviewThermostatChartsData({ enabled = true, pollMs = 4000 } = {}) {
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState(null)

  const jsonUrl = import.meta.env.DEV ? FY25_REVIEW_CHARTS_DEV_URL : FY25_REVIEW_CHARTS_PROD_URL

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${jsonUrl}?t=${Date.now()}`, { cache: 'no-store' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPayload(null)
        setError(new Error(j.error || res.statusText || 'Failed to load FY25 review charts'))
        return
      }
      if (j && typeof j === 'object' && j.thermostatSalesChartData && j.allTimeRightQuarterlySpan) {
        setPayload(j)
        setError(null)
      } else {
        setPayload(null)
        setError(new Error('Invalid FY25 review charts payload'))
      }
    } catch (e) {
      setPayload(null)
      setError(e instanceof Error ? e : new Error(String(e)))
    }
  }, [jsonUrl])

  useEffect(() => {
    if (!enabled) {
      setPayload(null)
      setError(null)
      return undefined
    }
    void load()
    if (!import.meta.env.DEV || pollMs <= 0) return undefined
    const id = setInterval(() => void load(), pollMs)
    return () => clearInterval(id)
  }, [enabled, load, pollMs])

  return { payload, error, refetch: load }
}
