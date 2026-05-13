import { useState, useEffect, useCallback } from 'react'

function localDataUrl(file) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/?$/, '/')}${file.replace(/^\//, '')}`
}

const BM_JSON_URL_DEV = '/local-data/digital-platforms-business-model.json'
const BM_JSON_URL_PROD = localDataUrl('generated-roadmaps/digital-platforms-business-model.json')

const JSON_URL = import.meta.env.DEV ? BM_JSON_URL_DEV : BM_JSON_URL_PROD

/**
 * Loads Digital_Platforms_Business_Model.xlsx via dev middleware or exported JSON (prod).
 * Payload: { workbook, sheetNames, grids: { [sheetName]: string[][] } }.
 */
export function useDigitalPlatformsBusinessModelData({ pollMs = 4000, enabled = true } = {}) {
  const [sheetNames, setSheetNames] = useState([])
  /** @type {Record<string, string[][]>} */
  const [grids, setGrids] = useState({})
  const [workbook, setWorkbook] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${JSON_URL}?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || res.statusText || 'Failed to load business model workbook')
      }
      const names = Array.isArray(json.sheetNames) ? json.sheetNames : []
      const g = json.grids && typeof json.grids === 'object' ? json.grids : {}
      setSheetNames(names)
      setGrids(g)
      setWorkbook(typeof json.workbook === 'string' ? json.workbook : '')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setSheetNames([])
      setGrids({})
      setWorkbook('')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setSheetNames([])
      setGrids({})
      setWorkbook('')
      setError(null)
      return undefined
    }
    setLoading(true)
    load()
    if (!import.meta.env.DEV || pollMs <= 0) return undefined
    const id = setInterval(load, pollMs)
    return () => clearInterval(id)
  }, [load, pollMs, enabled])

  return {
    sheetNames,
    grids,
    workbook,
    loading,
    error,
    refetch: load,
  }
}
