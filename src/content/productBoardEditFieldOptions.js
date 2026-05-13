import { SUPPORT_GANTT_FOCUS_TO_RANGE } from './supportTestGanttData.js'

export const PRODUCT_BOARD_PRIORITY_OPTIONS = ['High', 'Medium', 'Low']

export const PRODUCT_BOARD_STATUS_OPTIONS = ['Planned', 'In Progress', 'At Risk']

/** FY24–FY32 × Q1–Q4, plus any keys from the Support Gantt map (e.g. FY26 (ongoing), FY27+). */
export function buildFocusTimeframeOptions() {
  const list = []
  for (let fy = 24; fy <= 32; fy += 1) {
    for (let q = 1; q <= 4; q += 1) {
      list.push(`Q${q} FY${fy}`)
    }
  }
  for (const key of Object.keys(SUPPORT_GANTT_FOCUS_TO_RANGE)) {
    if (!list.includes(key)) list.push(key)
  }
  return list
}

export const PRODUCT_BOARD_FOCUS_TIMEFRAME_OPTIONS = buildFocusTimeframeOptions()

/**
 * @param {string} colName
 * @returns {'priority' | 'status' | 'focusTimeframe' | null}
 */
export function columnEditKind(colName) {
  const k = String(colName ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
  if (k === 'priority') return 'priority'
  if (k === 'status') return 'status'
  if (k === 'focus timeframe') return 'focusTimeframe'
  return null
}
