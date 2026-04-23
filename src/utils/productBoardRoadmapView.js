/**
 * Group / search helpers for Product Board sheets (Digital Framework roadmap-style columns).
 */

import { getProductBoardCell } from './productBoardTableColumns'

function normalizeHeader(col) {
  return String(col ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Headers that identify a “group” column for By-group view (first match in sheet column order wins). */
const GROUP_HEADER_NORMALIZED = new Set(['feature group', 'group', 'attribute', 'pillar'])

/**
 * @param {string[]} columns
 * @returns {string | null} original header key from the sheet
 */
export function findGroupColumnKey(columns) {
  if (!Array.isArray(columns)) return null
  for (const col of columns) {
    if (GROUP_HEADER_NORMALIZED.has(normalizeHeader(col))) return col
  }
  return null
}

/**
 * @param {Record<string, unknown>} row
 * @param {string[]} columns
 */
export function isLikelyTemplateRow(row, columns) {
  if (!row || typeof row !== 'object') return true
  for (const col of columns) {
    const n = normalizeHeader(col)
    if (n === 'feature / function' || n === 'feature') {
      const v = String(row[col] ?? '').trim().toLowerCase()
      if (v === 'short, clear feature name') return true
    }
    if (n === 'feature group') {
      const v = String(getProductBoardCell(row, col) ?? '').trim()
      if (v.startsWith('(e.g.,')) return true
    }
  }
  return false
}

/**
 * Forward-fill sparse group labels (same idea as SkyportHome roadmap rows).
 * @param {Record<string, unknown>[]} rows
 * @param {string | null} groupColKey
 * @returns {Array<Record<string, unknown> & { __displayGroup: string }>}
 */
export function withDisplayGroup(rows, groupColKey) {
  if (!groupColKey) {
    return rows.map((r) => ({ ...r, __displayGroup: '' }))
  }
  let current = ''
  return rows.map((row) => {
    const raw = String(row[groupColKey] ?? '').trim()
    if (raw) current = raw
    return { ...row, __displayGroup: current || 'Other' }
  })
}

/**
 * @param {Array<Record<string, unknown> & { __displayGroup?: string }>} rows
 * @param {string[]} searchKeys column headers to scan (usually full sheet columns)
 * @param {string} query
 */
export function filterProductBoardRows(rows, searchKeys, query) {
  if (!query?.trim()) return rows
  const q = query.trim().toLowerCase()
  return rows.filter((row) => {
    if (row.__displayGroup && String(row.__displayGroup).toLowerCase().includes(q)) return true
    for (const k of searchKeys) {
      if (String(getProductBoardCell(row, k) ?? '').toLowerCase().includes(q)) return true
    }
    return false
  })
}

/**
 * @param {Array<Record<string, unknown> & { __displayGroup?: string }>} rows
 * @returns {{ groupName: string, rows: typeof rows }[]}
 */
export function buildGroupsFromRows(rows) {
  const order = []
  const byGroup = new Map()
  for (const row of rows) {
    const g = row.__displayGroup || 'Other'
    if (!byGroup.has(g)) {
      byGroup.set(g, [])
      order.push(g)
    }
    byGroup.get(g).push(row)
  }
  return order.map((groupName) => ({ groupName, rows: byGroup.get(groupName) }))
}

export function slugifyForDomId(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'group'
}
