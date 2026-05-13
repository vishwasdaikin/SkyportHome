/** @param {Record<string, unknown>[]} rows */
export function dealerSummaryKeysFromRows(rows) {
  if (!rows?.length) return []
  return Object.keys(rows[0])
}

export function dealerSummaryColumnHeaderLabel(key) {
  return String(key ?? '').trim() || '—'
}
