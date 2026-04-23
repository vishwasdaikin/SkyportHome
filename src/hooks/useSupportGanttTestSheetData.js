import { useState, useEffect, useCallback } from 'react'

function localDataUrl(file) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/?$/, '/')}${file.replace(/^\//, '')}`
}

/** Dev: Vite serves support Gantt from OneDrive `Skyport-Web-Shared-Test/Test.xlsx` only. Prod: exported JSON. */
const SUPPORT_GANTT_SHEET_JSON_URL = import.meta.env.DEV
  ? '/local-data/support-gantt-test-sheet.json'
  : localDataUrl('generated-roadmaps/support-gantt-test-sheet.json')

/**
 * Workbook for Support → Test page · timeline. Never uses SkyportHome_Roadmap.xlsx.
 * Polls in dev like `useTestSheetData`.
 */
export function useSupportGanttTestSheetData({ pollMs = 4000 } = {}) {
  const [sheetNames, setSheetNames] = useState([])
  /** @type {Record<string, unknown[]>} */
  const [sheets, setSheets] = useState({})
  const [workbook, setWorkbook] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${SUPPORT_GANTT_SHEET_JSON_URL}?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || json.hint || res.statusText || 'Failed to load Support Gantt workbook')
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
    defaultSheetName: sheetNames[0] ?? null,
  }
}
