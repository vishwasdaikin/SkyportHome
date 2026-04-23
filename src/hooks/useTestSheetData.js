import { useState, useEffect, useCallback } from 'react'

function localDataUrl(file) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/?$/, '/')}${file.replace(/^\//, '')}`
}

/** Dev: Vite plugin reads xlsx from disk. Prod: static JSON from `npm run export-roadmaps`. */
const SHEET_JSON_URL = import.meta.env.DEV
  ? '/local-data/test-sheet.json'
  : localDataUrl('generated-roadmaps/test-sheet.json')

/**
 * Loads rows from the “test” workbook (`Test.xls` / `Test.xlsx`, `LOCAL_XLSX_FILE`, or `SkyportHome_Roadmap.xlsx`)
 * via the dev-server plugin (`/local-data/test-sheet.json`).
 * Polls every `pollMs` while in dev so edits in Excel show up without refresh.
 *
 * Production: this URL is not served by Vite — use a real API or put a JSON/CSV
 * in `public/` and change the fetch URL.
 */
export function useTestSheetData({ pollMs = 4000 } = {}) {
  const [sheetNames, setSheetNames] = useState([])
  /** @type {Record<string, unknown[]>} */
  const [sheets, setSheets] = useState({})
  const [workbook, setWorkbook] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${SHEET_JSON_URL}?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || res.statusText || 'Failed to load sheet')
      }
      const names = Array.isArray(json.sheetNames) ? json.sheetNames : []
      const byName = json.sheets && typeof json.sheets === 'object' ? json.sheets : {}
      setSheetNames(names)
      setSheets(byName)
      setWorkbook(typeof json.workbook === 'string' ? json.workbook : '')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setSheetNames([])
      setSheets({})
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

  /** Rows for one tab (convenience). */
  const getRows = useCallback(
    (name) => {
      if (!name || !sheets[name]) return []
      const r = sheets[name]
      return Array.isArray(r) ? r : []
    },
    [sheets],
  )

  return {
    sheetNames,
    sheets,
    workbook,
    getRows,
    loading,
    error,
    refetch: load,
    /** first sheet name, if any */
    defaultSheetName: sheetNames[0] ?? null,
  }
}
