/**
 * Chronological-ish rank for Focus Timeframe labels (ascending: Q1 FY26 → Q4 → FY26 ongoing → FY27+).
 */
export function focusTimeframeRank(value) {
  const t = String(value ?? '').trim()
  if (!t || t === '—') return 9999
  const q = t.match(/^Q([1-4]) FY26$/i)
  if (q) return parseInt(q[1], 10)
  if (t === 'FY26 (ongoing)' || /^FY26\s*\(ongoing\)$/i.test(t)) return 5
  if (t === 'FY27+' || /^FY\d{2,4}\+$/i.test(t)) return 6
  const fy = t.match(/^FY(\d{2,4})/i)
  if (fy) return 50 + parseInt(fy[1], 10)
  return 100
}

function compareStrings(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base' })
}

/** Raw comparison: negative if a before b in ascending order. */
export function compareFeatureRowsForSort(a, b, sortKey) {
  switch (sortKey) {
    case 'priority':
      return (Number(a.priority) || 999) - (Number(b.priority) || 999)
    case 'focusTimeframe':
      return focusTimeframeRank(a.focusTimeframe) - focusTimeframeRank(b.focusTimeframe)
    case 'displayGroup':
      return compareStrings(a.displayGroup, b.displayGroup)
    case 'feature':
      return compareStrings(a.feature, b.feature)
    case 'initiativeType':
      return compareStrings(a.initiativeType, b.initiativeType)
    case 'endUserCategory':
      return compareStrings(a.endUserCategory, b.endUserCategory)
    case 'monetizationModel':
      return compareStrings(a.monetizationModel, b.monetizationModel)
    case 'development':
      return compareStrings(a.development, b.development)
    default:
      return 0
  }
}

/**
 * @param {object[]} rows
 * @param {string | null} sortKey row field name, or null for source order
 * @param {'asc'|'desc'} sortDir
 */
export function sortFeatureRows(rows, sortKey, sortDir) {
  if (sortKey == null || sortKey === '') return rows
  const dir = sortDir === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const cmp = compareFeatureRowsForSort(a, b, sortKey)
    if (cmp !== 0) return dir * cmp
    return compareStrings(a.feature, b.feature)
  })
}

export function createDefaultSortConfig() {
  return { key: null, dir: 'asc' }
}
