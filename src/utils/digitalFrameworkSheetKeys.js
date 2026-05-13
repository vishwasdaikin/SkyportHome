/**
 * Excel → JSON often leaves BOM, NBSP, or compatibility characters in header keys.
 * That breaks matching (e.g. "Source" vs "\ufeffSource") so the Product Board column list is wrong.
 */

export function trimDigitalFrameworkHeaderKey(k) {
  return String(k ?? '')
    .normalize('NFKC')
    .replace(/[\uFEFF\u200B-\u200D\u2060]/g, '')
    .trim()
}

/** xlsx `sheet_to_json` uses `__EMPTY`, `__EMPTY_1`, … when the header row has blank / merged cells. */
function isXlsxEmptyHeaderPlaceholderKey(k) {
  return /^__EMPTY/i.test(String(k ?? '').trim())
}

/**
 * @param {unknown[]} rows
 * @returns {unknown[]}
 */
export function sanitizeDigitalFrameworkSheetRows(rows) {
  if (!Array.isArray(rows)) return rows
  return rows.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return row
    const out = {}
    for (const [k, v] of Object.entries(row)) {
      if (isXlsxEmptyHeaderPlaceholderKey(k)) continue
      const sk = trimDigitalFrameworkHeaderKey(k)
      if (!sk) continue
      if (Object.prototype.hasOwnProperty.call(out, sk)) {
        const prev = out[sk]
        const prevEmpty = prev == null || String(prev).trim() === ''
        const nextEmpty = v == null || String(v).trim() === ''
        if (prevEmpty && !nextEmpty) out[sk] = v
      } else {
        out[sk] = v
      }
    }
    return out
  })
}

/**
 * @param {Record<string, unknown[]>} sheets
 * @returns {Record<string, unknown[]>}
 */
export function sanitizeDigitalFrameworkSheets(sheets) {
  if (!sheets || typeof sheets !== 'object') return {}
  const out = {}
  for (const [name, rows] of Object.entries(sheets)) {
    out[name] = sanitizeDigitalFrameworkSheetRows(rows)
  }
  return out
}
