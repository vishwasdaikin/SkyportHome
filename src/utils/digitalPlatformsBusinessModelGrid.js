const DEFAULT_SHEET = 'Current Model Growth'

/** @param {string} label */
function pillarForSubhead(label) {
  const L = label.trim()
  if (/^SkyportHome$/i.test(L)) return 'skyport-home'
  if (/^SkyportCare$/i.test(L)) return 'skyport-care'
  return undefined
}

/** Banner row: label only, no FY cells */
function isSubheadBanner(label) {
  const L = label.trim()
  if (!L) return false
  if (pillarForSubhead(L)) return true
  if (/^#\d+\s/.test(L)) return true
  if (L === 'Users (%)') return true
  return false
}

function licenseCellClassName(label) {
  const L = label.toLowerCase()
  return (i) => {
    if (L.includes('bundled') && L.includes('license')) return 'fy26-skyport-license-cell--bundled'
    if (L.includes('1-year') && L.includes('license')) return 'fy26-skyport-license-cell--one-year'
    if (L.includes('lifetime') && L.includes('license')) return 'fy26-skyport-license-cell--lifetime'
    return ''
  }
}

function rowValues(row, numCols) {
  const out = []
  for (let i = 0; i < numCols; i++) {
    const v = row[i + 1]
    out.push(v == null ? '' : String(v).trim())
  }
  return out
}

function rowIsEmpty(row) {
  return row.every((c) => c == null || String(c).trim() === '')
}

/**
 * @param {string[][] | null | undefined} grid
 * @param {string} [sheetName]
 * @returns {{ columnKeys: string[], segments: Array<{ type: string, [key: string]: unknown }> } | null}
 */
export function parseBusinessModelGrid(grid, sheetName = DEFAULT_SHEET) {
  if (!Array.isArray(grid) || grid.length < 2) return null

  const header = grid[0].map((c) => (c == null ? '' : String(c).trim()))
  const numCols = Math.min(6, Math.max(1, header.length - 1))
  const columnKeys = []
  for (let i = 0; i < numCols; i++) {
    const h = header[i + 1] || ''
    columnKeys.push(h || `FY${i}`)
  }

  /** @type {Array<{ type: string, [key: string]: unknown }>} */
  const segments = []

  let emphasizeNextTotalDollar = false

  for (let ri = 1; ri < grid.length; ri++) {
    const row = grid[ri].map((c) => (c == null ? '' : String(c).trim()))
    if (rowIsEmpty(row)) continue

    const label = row[0] || ''
    const values = rowValues(row, numCols)
    const hasValue = values.some((v) => v !== '')

    if (!hasValue) {
      if (isSubheadBanner(label)) {
        emphasizeNextTotalDollar = /^#1\s+SkyportCare License Revenue/i.test(label.trim())
        segments.push({ type: 'subhead', title: label, pillar: pillarForSubhead(label) })
      } else {
        emphasizeNextTotalDollar = false
        segments.push({ type: 'section', title: label })
      }
      continue
    }

    if (/total revenue/i.test(label) && values.some((v) => v && /\$/.test(v))) {
      segments.push({ type: 'totalRevenue', label, values })
      continue
    }

    let labelClass = ''
    if (/^active licenses$/i.test(label.trim())) labelClass = 'fy26-bm-emphasis'
    else if (/^total \(\$\)$/i.test(label.trim()) && emphasizeNextTotalDollar) {
      labelClass = 'fy26-bm-emphasis'
      emphasizeNextTotalDollar = false
    }

    let getCellClassName
    if (/license/i.test(label)) {
      getCellClassName = licenseCellClassName(label)
    }

    segments.push({
      type: 'data',
      label,
      values,
      labelClass,
      getCellClassName,
    })
  }

  return { columnKeys, segments, sheetName }
}

export { DEFAULT_SHEET as BUSINESS_MODEL_DEFAULT_SHEET }
