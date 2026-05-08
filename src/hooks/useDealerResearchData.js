import { useState, useEffect, useCallback } from 'react'

function localDataUrl(file) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/?$/, '/')}${file.replace(/^\//, '')}`
}

const DEALER_RESEARCH_JSON_URL = import.meta.env.DEV
  ? '/local-data/dealer-research.json'
  : localDataUrl('generated-roadmaps/dealer-research.json')

/**
 * Loads Dealer_Research.xlsx via dev middleware or exported JSON (includes `grids` for insights parsing).
 */
export function useDealerResearchData({ pollMs = 8000 } = {}) {
  const [sheetNames, setSheetNames] = useState([])
  /** @type {Record<string, unknown[]>} */
  const [sheets, setSheets] = useState({})
  /** @type {Record<string, unknown[][]>} */
  const [grids, setGrids] = useState({})
  const [workbook, setWorkbook] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${DEALER_RESEARCH_JSON_URL}?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || res.statusText || 'Failed to load dealer research workbook')
      }
      const names = Array.isArray(json.sheetNames) ? json.sheetNames : []
      const byName = json.sheets && typeof json.sheets === 'object' ? json.sheets : {}
      const byGrid = json.grids && typeof json.grids === 'object' ? json.grids : {}
      setSheetNames(names)
      setSheets(byName)
      setGrids(byGrid)
      setWorkbook(typeof json.workbook === 'string' ? json.workbook : '')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setSheetNames([])
      setSheets({})
      setGrids({})
      setWorkbook('')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (!import.meta.env.DEV || pollMs <= 0) return undefined
    const id = setInterval(load, pollMs)
    return () => clearInterval(id)
  }, [load, pollMs])

  return {
    sheetNames,
    sheets,
    grids,
    workbook,
    loading,
    error,
    refetch: load,
  }
}
