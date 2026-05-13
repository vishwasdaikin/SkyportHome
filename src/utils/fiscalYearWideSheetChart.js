/**
 * Parses "wide" fiscal-year sheets (FY23, FY24, …) where:
 * - One row has month names in columns (first label column empty).
 * - Following rows have a metric label in column 1 and monthly values across columns.
 */

function parseNumWide(v) {
  if (v == null || v === '') return NaN
  let s = String(v).trim().replace(/,/g, '')
  if (s.startsWith('$')) s = s.slice(1).trim()
  if (s.endsWith('%')) s = s.slice(0, -1).trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

function looksLikeMonthLabel(v) {
  if (v == null || v === '') return false
  const s = String(v).trim()
  if (s.length > 12) return false
  if (/^\$/.test(s)) return false
  if (/%$/.test(s)) return false
  if (/^\d+$/.test(s.replace(/,/g, ''))) return false
  return /^[A-Za-z]/.test(s)
}

/**
 * @param {Record<string, unknown>[]} rows from sheet_to_json
 * @returns {{ months: string[], metrics: { label: string, values: number[] }[] } | null}
 */
export function parseFiscalYearWideSheet(rows) {
  if (!rows?.length) return null
  const keys = Object.keys(rows[0])
  if (keys.length < 3) return null

  const labelKey = keys[0]
  const valueKeys = keys.slice(1)

  let monthRowIndex = -1
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const r = rows[i]
    const label = r[labelKey]
    if (label != null && String(label).trim() !== '') continue
    const candidates = valueKeys.filter((k) => looksLikeMonthLabel(r[k]))
    if (candidates.length >= 6) {
      monthRowIndex = i
      break
    }
  }
  if (monthRowIndex < 0) return null

  const monthRow = rows[monthRowIndex]
  const months = valueKeys.map((k) => {
    const v = monthRow[k]
    return v != null && String(v).trim() !== '' ? String(v).trim() : ''
  })

  /** @type {{ label: string, values: number[] }[]} */
  const metrics = []
  for (let i = monthRowIndex + 1; i < rows.length; i++) {
    const r = rows[i]
    const rawLabel = r[labelKey]
    if (rawLabel == null || String(rawLabel).trim() === '') continue
    const label = String(rawLabel).trim()
    const values = valueKeys.map((k) => parseNumWide(r[k]))
    if (!values.some((n) => Number.isFinite(n))) continue
    metrics.push({ label, values })
  }

  if (!metrics.length) return null
  return { months, metrics }
}

/**
 * Recharts-friendly points: { x: month, y: number }
 * @param {{ months: string[], metrics: { label: string, values: number[] }[] }} parsed
 * @param {number} metricIndex
 */
export function wideSheetMetricToChartData(parsed, metricIndex) {
  if (!parsed?.metrics?.length) return []
  const m = parsed.metrics[metricIndex]
  if (!m) return []
  const { months } = parsed
  const { values } = m
  return months
    .map((month, i) => ({ month, i }))
    .filter(({ month }) => String(month ?? '').trim() !== '')
    .map(({ month, i }) => ({
      x: String(month).trim(),
      y: Number.isFinite(values[i]) ? values[i] : 0,
    }))
}

/** Prefer thermostat sales row when present */
export function defaultMetricIndexForFySheet(parsed) {
  if (!parsed?.metrics?.length) return 0
  const idx = parsed.metrics.findIndex((m) =>
    /monthly.*smart thermostat sales/i.test(m.label),
  )
  return idx >= 0 ? idx : 0
}

/** Sheets like FY23, FY24, FY22 */
export function isLikelyFiscalYearTab(sheetName) {
  return /^FY\d{2}$/i.test(String(sheetName || '').trim())
}
