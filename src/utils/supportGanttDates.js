/**
 * Parse dates for Support Gantt rows (ISO, common US formats, Excel serial, datetime strings).
 */

const EXCEL_UTC_EPOCH_MS = Date.UTC(1899, 11, 30)

/** @param {unknown} value */
export function parseFlexibleDate(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 20000 && value < 60000) {
      const ms = value * 86400000 + EXCEL_UTC_EPOCH_MS
      const d = new Date(ms)
      return Number.isNaN(d.getTime()) ? null : d
    }
  }
  const s = String(value).trim()
  if (!s) return null

  /** Bare YYYY-MM-DD must be local calendar date — `new Date('2026-01-01')` is UTC midnight (prior day in US). */
  const isoDateOnly = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoDateOnly) {
    const d = new Date(
      Number(isoDateOnly[1]),
      Number(isoDateOnly[2]) - 1,
      Number(isoDateOnly[3]),
      12,
      0,
      0,
      0,
    )
    return Number.isNaN(d.getTime()) ? null : d
  }

  let d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d

  const isoLoose = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoLoose) {
    d = new Date(
      Number(isoLoose[1]),
      Number(isoLoose[2]) - 1,
      Number(isoLoose[3]),
      12,
      0,
      0,
      0,
    )
    return Number.isNaN(d.getTime()) ? null : d
  }

  const mdy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
  if (mdy) {
    let month = Number(mdy[1])
    let day = Number(mdy[2])
    let year = Number(mdy[3])
    if (year < 100) year += 2000
    if (month > 12) {
      const t = month
      month = day
      day = t
    }
    d = new Date(year, month - 1, day, 12, 0, 0, 0)
    return Number.isNaN(d.getTime()) ? null : d
  }

  return null
}
