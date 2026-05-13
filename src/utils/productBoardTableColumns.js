/**
 * Product Plan table: normalize sheet headers, hide KPI-style columns, order columns for display.
 */

export function normalizeProductBoardColumnHeader(name) {
  return String(name ?? '')
    .normalize('NFKC')
    .replace(/[\uFEFF\u200B-\u200D\u2060]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Headers that are “source” fields — never treated as KPI columns. */
export const PRODUCT_BOARD_SOURCE_PRIMARY_HEADERS = new Set([
  'source',
  'input source',
  'data source',
  'primary source',
])

/** Canonical display order (source near “Why”; KPI column removed before sort). */
const PRODUCT_BOARD_DISPLAY_RANK = new Map([
  ['feature group', 10],
  ['feature / function', 20],
  ['feature', 25],
  ['detail', 30],
  ['theme', 40],
  ['why / expected outcome', 50],
  ['input source', 60],
  ['source', 60],
  ['data source', 60],
  ['primary source', 60],
  ['focus timeframe', 70],
  ['time frame', 70],
  ['timeframe', 70],
  ['priority', 80],
  ['status', 90],
  ['status details', 95],
  ['dependency', 110],
  ['dependent', 115],
  ['dependencies', 115],
])

function rankDisplayColumn(col, fallbackIndex) {
  const n = normalizeProductBoardColumnHeader(col)
  if (PRODUCT_BOARD_DISPLAY_RANK.has(n)) return PRODUCT_BOARD_DISPLAY_RANK.get(n)
  if (n.startsWith('dependent')) return 115
  return 900 + fallbackIndex / 10000
}

export function sortProductBoardDisplayColumns(cols) {
  return [...cols]
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const ra = rankDisplayColumn(a.c, a.i)
      const rb = rankDisplayColumn(b.c, b.i)
      if (ra !== rb) return ra - rb
      return a.i - b.i
    })
    .map(({ c }) => c)
}

/**
 * Omit KPI-style columns from the roadmap table (Excel headers vary).
 * Never hides primary “source” columns (Input Source, Source, etc.).
 */
export function isProductBoardKpiColumn(col) {
  const n = normalizeProductBoardColumnHeader(col)
  if (PRODUCT_BOARD_SOURCE_PRIMARY_HEADERS.has(n)) return false
  if (n === 'kpi' || n === 'kpis') return true
  if (n === 'key performance indicators' || n === 'key performance indicator') return true
  if (n.startsWith('kpi ') || n.endsWith(' kpi') || n.startsWith('kpis ') || n.endsWith(' kpis')) return true
  const compact = n.replace(/[^a-z0-9]/g, '')
  if (compact === 'kpi' || compact === 'kpis') return true
  const tokens = n.split(/[^a-z0-9]+/).filter(Boolean)
  return tokens.some((t) => t === 'kpi' || t === 'kpis')
}

export function filterProductBoardKpiColumns(cols) {
  return cols.filter((c) => !isProductBoardKpiColumn(c))
}

export function hasProductBoardSourceColumn(cols) {
  return cols.some((c) => PRODUCT_BOARD_SOURCE_PRIMARY_HEADERS.has(normalizeProductBoardColumnHeader(c)))
}

/** True when this header is a primary “source” field (Input Source, Source, stray spaces, etc.). */
export function isSourceLikeColumnName(col) {
  return PRODUCT_BOARD_SOURCE_PRIMARY_HEADERS.has(normalizeProductBoardColumnHeader(String(col ?? '').trim()))
}

/**
 * Merge duplicate source-like headers into a single display column key `Source`
 * (same logical column as Excel “Input Source” / “Source”).
 * @param {string[]} cols
 * @returns {string[]}
 */
export function canonicalFrameworkColumnOrder(cols) {
  if (!Array.isArray(cols) || cols.length === 0) return []
  const out = []
  let sourceMerged = false
  for (const c of cols) {
    if (c == null || String(c).trim() === '') continue
    if (isSourceLikeColumnName(c)) {
      if (!sourceMerged) {
        out.push('Source')
        sourceMerged = true
      }
      continue
    }
    out.push(c)
  }
  return out
}

/**
 * Read a cell for Product Board tables when column keys may differ slightly from row keys
 * (e.g. `" Source"` vs `Input Source` vs `Source`).
 * @param {Record<string, unknown>} row
 * @param {string} col
 */
export function getProductBoardCell(row, col) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return undefined
  if (isSourceLikeColumnName(col)) {
    for (const k of Object.keys(row)) {
      if (isSourceLikeColumnName(k)) return row[k]
    }
    return undefined
  }
  if (Object.prototype.hasOwnProperty.call(row, col)) return row[col]
  const want = normalizeProductBoardColumnHeader(String(col).trim())
  const found = Object.keys(row).find((k) => normalizeProductBoardColumnHeader(String(k).trim()) === want)
  return found != null ? row[found] : undefined
}

/**
 * Blank row check using {@link getProductBoardCell} so canonical `Source` matches spaced row keys.
 * @param {Record<string, unknown>} row
 * @param {string[]} keys
 */
export function isBlankProductBoardDataRow(row, keys) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return true
  return keys.every((k) => {
    const v = getProductBoardCell(row, k)
    return v == null || String(v).trim() === ''
  })
}
