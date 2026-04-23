import { useState, useEffect, useCallback } from 'react'
import { sanitizeDigitalFrameworkSheets } from '../utils/digitalFrameworkSheetKeys'
import { viteLocalDataUrl } from '../utils/viteLocalDataUrl'

/** Dev: live XLSX via Vite plugin. Prod (and dev fallback): exported JSON in `public/`. */
const DIGITAL_FRAMEWORK_LIVE_DEV_URL = viteLocalDataUrl('local-data/digital-framework.json')
const DIGITAL_FRAMEWORK_STATIC_URL = viteLocalDataUrl('generated-roadmaps/digital-framework.json')

const DIGITAL_FRAMEWORK_JSON_URL = import.meta.env.DEV
  ? DIGITAL_FRAMEWORK_LIVE_DEV_URL
  : DIGITAL_FRAMEWORK_STATIC_URL

/**
 * Workbook for Product Board (`Digital_Framework.xlsx` in shared OneDrive folder).
 */
export function useDigitalFrameworkData({ pollMs = 4000 } = {}) {
  const [sheetNames, setSheetNames] = useState([])
  /** @type {Record<string, unknown[]>} */
  const [sheets, setSheets] = useState({})
  const [workbook, setWorkbook] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const bust = `t=${Date.now()}`
      let res = await fetch(`${DIGITAL_FRAMEWORK_JSON_URL}?${bust}`, { cache: 'no-store' })
      let json = await res.json().catch(() => ({}))
      /** OneDrive `/local-data/…` is 404 without the shared folder — use bundled export so Product Board still works. */
      if (!res.ok && import.meta.env.DEV) {
        const res2 = await fetch(`${DIGITAL_FRAMEWORK_STATIC_URL}?${bust}`, { cache: 'no-store' })
        const json2 = await res2.json().catch(() => ({}))
        if (res2.ok) {
          res = res2
          json = json2
        }
      }
      if (!res.ok) {
        throw new Error(json.error || json.hint || res.statusText || 'Failed to load Digital Framework workbook')
      }
      const namesFromJson = Array.isArray(json.sheetNames) ? json.sheetNames : []
      const rawSheets = json.sheets && typeof json.sheets === 'object' ? json.sheets : {}
      const byName = sanitizeDigitalFrameworkSheets(rawSheets)
      const keysFromSheets = Object.keys(byName)
      /** Prefer `sheetNames` order; append any sheet keys missing from the array (fixes rare parse drift). */
      const mergedNames = []
      const seen = new Set()
      for (const n of [...namesFromJson, ...keysFromSheets]) {
        if (n == null) continue
        const s = String(n)
        if (seen.has(s)) continue
        seen.add(s)
        mergedNames.push(s)
      }
      setSheetNames(mergedNames)
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
