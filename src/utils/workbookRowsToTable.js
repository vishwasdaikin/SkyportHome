/**
 * Build stable column order for a sheet’s `sheet_to_json` rows (object keys vary by row).
 * @param {unknown[]} rows
 * @returns {string[]}
 */
export function deriveColumnOrderFromObjects(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const seen = new Set()
  /** @type {string[]} */
  const order = []
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    for (const k of Object.keys(row)) {
      if (seen.has(k)) continue
      seen.add(k)
      order.push(k)
    }
  }
  return order
}

/**
 * @param {Record<string, unknown>} row
 * @param {string[]} keys
 */
export function isBlankDataRow(row, keys) {
  if (!row || typeof row !== 'object') return true
  return keys.every((k) => {
    const v = row[k]
    return v == null || String(v).trim() === ''
  })
}
