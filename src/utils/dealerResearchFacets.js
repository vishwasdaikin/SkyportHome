/** Normalize cell for facet matching (case-insensitive, trimmed). */
export function dealerResearchNormCell(v) {
  return String(v ?? '').trim().toLowerCase()
}

/**
 * Apply facet selections: AND across columns; OR within a column (multiple checkboxes).
 * @param {Record<string, unknown>[]} rows
 * @param {Record<string, string[]>} facetFilters — column key → selected normalized values
 * @param {string[]} columnKeys
 * @param {string | null} skipColumn — omit this column’s facet (for computing counts)
 */
export function applyDealerResearchFacets(rows, facetFilters, columnKeys, skipColumn = null) {
  let out = rows
  for (const col of columnKeys) {
    if (col === skipColumn) continue
    const sel = facetFilters[col]
    if (!sel?.length) continue
    const set = new Set(sel)
    out = out.filter((r) => set.has(dealerResearchNormCell(r[col])))
  }
  return out
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {string} col
 * @returns {{ norm: string, label: string, count: number }[]}
 */
export function buildDealerFacetOptions(rows, col) {
  const groups = new Map()
  for (const row of rows) {
    const raw = String(row[col] ?? '').trim()
    const n = dealerResearchNormCell(raw)
    if (!groups.has(n)) {
      groups.set(n, { label: raw === '' ? '(blank)' : raw, count: 0 })
    }
    groups.get(n).count++
  }
  return [...groups.entries()]
    .sort(([na, a], [nb, b]) => {
      if (na === '') return 1
      if (nb === '') return -1
      return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })
    })
    .map(([norm, g]) => ({ norm, label: g.label, count: g.count }))
}
