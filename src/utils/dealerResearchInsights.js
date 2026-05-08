/**
 * Parse `Dealer Insights (All Dealers)` grid (header:1) from Dealer_Research.xlsx export.
 * Sheet layout is section headers + small tables + narrative bullets.
 */

/** @param {string[]} sheetNames */
export function resolveDealerSummarySheetName(sheetNames) {
  if (!Array.isArray(sheetNames)) return null
  const exact = sheetNames.find((n) => n === 'Dealer Summary')
  if (exact) return exact
  return sheetNames.find((n) => /dealer\s*summary/i.test(String(n))) ?? null
}

/** @param {string[]} sheetNames */
export function resolveDealerInsightsSheetName(sheetNames) {
  if (!Array.isArray(sheetNames)) return null
  const exact = sheetNames.find((n) => n === 'Dealer Insights (All Dealers)')
  if (exact) return exact
  return (
    sheetNames.find((n) => /dealer\s*insights/i.test(String(n))) ??
    sheetNames.find((n) => /all\s*dealers/i.test(String(n))) ??
    null
  )
}

/**
 * @param {unknown[][]} grid
 * @returns {{ analysisDate: string, totalDealers: number | null }}
 */
export function parseDealerInsightsMeta(grid) {
  let analysisDate = ''
  let totalDealers = null
  for (let i = 0; i < Math.min(12, grid.length); i++) {
    const row = grid[i]
    const a = String(row?.[0] ?? '').trim()
    if (a.startsWith('Analysis Date:')) {
      analysisDate = a.replace(/^Analysis Date:\s*/i, '').trim()
    }
    if (a === 'Total Dealers Analyzed:') {
      const n = Number(row?.[1])
      if (!Number.isNaN(n)) totalDealers = n
    }
  }
  return { analysisDate, totalDealers }
}

const INSIGHT_SECTION_BREAK = new Set([
  'PROGRAM PARTICIPATION',
  'SERVICE OFFERINGS',
  'ELECTRIFICATION CAPABILITIES',
  'BILLING CADENCE BREAKDOWN',
  'KEY INSIGHTS – TOTAL DEALER BASE',
  'KEY INSIGHTS - TOTAL DEALER BASE',
])

/**
 * @param {unknown[][]} grid
 * @param {string} sectionTitle — first column exact match (e.g. PROGRAM PARTICIPATION)
 * @returns {Record<string, string | number>[]}
 */
export function extractTableAfterSection(grid, sectionTitle) {
  const si = grid.findIndex((r) => String(r?.[0] ?? '').trim() === sectionTitle)
  if (si === -1) return []
  const headerRow = grid[si + 1]
  if (!headerRow) return []
  const keys = headerRow.map((c, j) => {
    const h = String(c ?? '').trim()
    return h || `_col${j}`
  })
  const rows = []
  for (let i = si + 2; i < grid.length; i++) {
    const row = grid[i]
    if (!row) break
    const first = String(row[0] ?? '').trim()
    const emptyLine = row.every((c) => !String(c ?? '').trim())
    if (emptyLine) break
    if (first !== sectionTitle && INSIGHT_SECTION_BREAK.has(first)) break

    const obj = {}
    keys.forEach((k, j) => {
      obj[k] = row[j]
    })
    rows.push(obj)
  }
  return rows
}

/**
 * Narrative blocks under KEY INSIGHTS (emoji section titles + bullets).
 * @returns {{ title: string, bullets: string[] }[]}
 */
export function parseDealerInsightsNarrative(grid) {
  const start = grid.findIndex((r) => String(r?.[0] ?? '').includes('KEY INSIGHTS'))
  if (start === -1) return []

  /** @type {{ title: string; bullets: string[] }[]} */
  const blocks = []
  let i = start + 1
  while (i < grid.length) {
    const line = String(grid[i]?.[0] ?? '').trim()
    if (!line) {
      i++
      continue
    }
    if (/^[📊🔧⚡💡]/.test(line)) {
      const title = line.replace(/\s*:\s*$/, '').trim()
      const bullets = []
      i++
      while (i < grid.length) {
        const b = String(grid[i]?.[0] ?? '').trim()
        if (!b) {
          i++
          continue
        }
        if (/^[📊🔧⚡💡]/.test(b)) break
        if (b.startsWith('•')) bullets.push(b.replace(/^•\s*/, '').trim())
        i++
      }
      if (bullets.length) blocks.push({ title, bullets })
      continue
    }
    i++
  }
  return blocks
}

/** Normalize Excel percentage / count cells */
export function toDecimalFraction(v) {
  if (v == null || v === '') return null
  if (typeof v === 'number') {
    if (v > 1 && v <= 100) return v / 100
    return v <= 1 ? v : null
  }
  const s = String(v).trim()
  if (s.endsWith('%')) {
    const n = parseFloat(s.replace('%', ''))
    return Number.isNaN(n) ? null : n / 100
  }
  const n = parseFloat(s)
  if (Number.isNaN(n)) return null
  if (n > 1 && n <= 100) return n / 100
  return n
}

/**
 * Format a cell for Dealer Insights summary tables (counts vs. % columns).
 * @param {string} columnKey — sheet header
 * @param {unknown} raw
 * @returns {string}
 */
export function formatDealerInsightsCell(columnKey, raw) {
  if (raw == null || raw === '') return '—'
  const key = String(columnKey).trim().toLowerCase()
  if (key.includes('%')) {
    const frac = toDecimalFraction(raw)
    if (frac != null) return `${(frac * 100).toFixed(1)}%`
  }
  if (key.includes('count')) {
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/,/g, ''))
    if (!Number.isNaN(n)) return Math.round(n).toLocaleString()
  }
  const s = String(raw).trim()
  return s || '—'
}

/**
 * Omit columns from Dealer Insights table rows for display (Excel headers match keys exactly).
 * @param {Record<string, unknown>[] | null | undefined} rows
 * @param {Iterable<string>} excludeColumnKeys
 * @returns {Record<string, unknown>[]}
 */
export function filterInsightTableColumns(rows, excludeColumnKeys) {
  if (!rows?.length) return rows ?? []
  const ex = new Set(excludeColumnKeys)
  const keys = Object.keys(rows[0]).filter((k) => !ex.has(k))
  return rows.map((row) => {
    const o = {}
    keys.forEach((k) => {
      o[k] = row[k]
    })
    return o
  })
}
