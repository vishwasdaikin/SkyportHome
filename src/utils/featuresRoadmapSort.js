/**
 * Chronological-ish rank for Target column values (ascending: Q1 FY26 → Q4 → FY26 ongoing → FY27+).
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

function priorityRank(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const s = String(value ?? '').trim()
  if (!s || s === '—') return 999
  const n = Number(s)
  if (Number.isFinite(n)) return n
  const m = s.match(/\d+/)
  return m ? Number(m[0]) : 999
}

/** Raw comparison: negative if a before b in ascending order. */
export function compareFeatureRowsForSort(a, b, sortKey) {
  switch (sortKey) {
    case 'priority':
      return priorityRank(a.priority) - priorityRank(b.priority)
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
