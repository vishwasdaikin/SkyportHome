import { useState, useEffect, useCallback } from 'react'
import { sanitizeDigitalFrameworkSheets } from '../utils/digitalFrameworkSheetKeys'
import { viteLocalDataUrl } from '../utils/viteLocalDataUrl'
import { parseDigitalFrameworkFromArrayBuffer } from '../utils/parseDigitalFrameworkXlsx'

/** Dev: raw workbook via Vite middleware from OneDrive `Digital_Framework.xlsx`. */
const DIGITAL_FRAMEWORK_LIVE_DEV_URL = viteLocalDataUrl('local-data/digital-framework.xlsx')
/** Production / preview: same workbook committed under `public/generated-roadmaps/`. */
const DIGITAL_FRAMEWORK_STATIC_URL = viteLocalDataUrl('generated-roadmaps/Digital_Framework.xlsx')
/** Optional runtime override — see `public/digital-framework-config.example.json`. */
const DIGITAL_FRAMEWORK_RUNTIME_CONFIG_URL = viteLocalDataUrl('digital-framework-config.json')

const REMOTE_DIGITAL_FRAMEWORK_XLSX_URL =
  typeof import.meta.env.VITE_DIGITAL_FRAMEWORK_XLSX_URL === 'string'
    ? import.meta.env.VITE_DIGITAL_FRAMEWORK_XLSX_URL.trim()
    : ''

/** Dev only: load committed `public/…/Digital_Framework.xlsx` instead of OneDrive (parity with prod build). */
const DEV_USE_STATIC_DIGITAL_FRAMEWORK =
  import.meta.env.VITE_DIGITAL_FRAMEWORK_DEV_STATIC === '1' ||
  import.meta.env.VITE_DIGITAL_FRAMEWORK_DEV_STATIC === 'true'

function withCacheBust(url, bustQuery) {
  const u = String(url)
  const sep = u.includes('?') ? '&' : '?'
  return `${u}${sep}${bustQuery}`
}

function shouldPollDigitalFramework(pollMs, runtimeXlsxUrl) {
  return (
    pollMs > 0 &&
    (Boolean(REMOTE_DIGITAL_FRAMEWORK_XLSX_URL) ||
      Boolean(runtimeXlsxUrl) ||
      (import.meta.env.DEV && !DEV_USE_STATIC_DIGITAL_FRAMEWORK))
  )
}

/**
 * Product Board workbook: always loaded from **Excel** (`.xlsx` bytes), parsed in the browser.
 *
 * **Dev:** `/local-data/digital-framework.xlsx` → OneDrive file.
 * **Production / preview:** fetch **same-origin** `generated-roadmaps/Digital_Framework.xlsx` **first** (matches git deploy).
 * Only if that fails, fall back to `VITE_DIGITAL_FRAMEWORK_XLSX_URL` / `xlsxUrl` — so a stale remote URL cannot override a fresh deploy.
 */
export function useDigitalFrameworkData({ pollMs = 4000 } = {}) {
  const [sheetNames, setSheetNames] = useState([])
  /** @type {Record<string, unknown[]>} */
  const [sheets, setSheets] = useState({})
  const [workbook, setWorkbook] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [runtimeXlsxUrl, setRuntimeXlsxUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(
          withCacheBust(DIGITAL_FRAMEWORK_RUNTIME_CONFIG_URL, `t=${Date.now()}`),
          { cache: 'no-store' },
        )
        if (!r.ok || cancelled) return
        const j = await r.json().catch(() => ({}))
        const u = typeof j.xlsxUrl === 'string' ? j.xlsxUrl.trim() : ''
        if (u && !cancelled) setRuntimeXlsxUrl(u)
      } catch {
        /* missing config is fine */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(async (opts = {}) => {
    const showSpinner = opts.showSpinner === true
    if (showSpinner) setLoading(true)
    try {
      const bust = `t=${Date.now()}`

      /** @type {string[]} */
      const candidates = (() => {
        if (import.meta.env.DEV && !DEV_USE_STATIC_DIGITAL_FRAMEWORK) {
          return [DIGITAL_FRAMEWORK_LIVE_DEV_URL]
        }
        const out = [DIGITAL_FRAMEWORK_STATIC_URL]
        if (REMOTE_DIGITAL_FRAMEWORK_XLSX_URL) out.push(REMOTE_DIGITAL_FRAMEWORK_XLSX_URL)
        if (runtimeXlsxUrl) out.push(runtimeXlsxUrl)
        return out
      })()

      let res = null
      for (const url of candidates) {
        const r = await fetch(withCacheBust(url, bust), { cache: 'no-store' })
        if (r.ok) {
          res = r
          break
        }
        res = r
      }

      if (!res || !res.ok) {
        const hint =
          res?.status === 404
            ? ' Add Digital_Framework.xlsx under public/generated-roadmaps/ (run npm run export-digital-framework), or set VITE_DIGITAL_FRAMEWORK_XLSX_URL / xlsxUrl.'
            : ''
        throw new Error(`Failed to load Digital_Framework.xlsx (${res?.status ?? '?'})${hint}`)
      }

      const buf = await res.arrayBuffer()
      const json = parseDigitalFrameworkFromArrayBuffer(buf)

      const namesFromJson = Array.isArray(json.sheetNames) ? json.sheetNames : []
      const rawSheets = json.sheets && typeof json.sheets === 'object' ? json.sheets : {}
      const byName = sanitizeDigitalFrameworkSheets(rawSheets)
      const keysFromSheets = Object.keys(byName)
      const mergedNames = []
      const seen = new Set()
      for (const n of [...namesFromJson, ...keysFromSheets]) {
        if (n == null) continue
        const s = String(n)
        if (seen.has(s)) continue
        seen.add(s)
        mergedNames.push(n)
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
  }, [runtimeXlsxUrl])

  const refetch = useCallback(() => load({ showSpinner: true }), [load])

  useEffect(() => {
    load()
    if (!shouldPollDigitalFramework(pollMs, runtimeXlsxUrl)) return undefined
    const id = setInterval(load, pollMs)
    return () => clearInterval(id)
  }, [load, pollMs, runtimeXlsxUrl])

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
    refetch,
    defaultSheetName: sheetNames[0] ?? null,
  }
}
