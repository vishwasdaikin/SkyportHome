/**
 * Helpers for Support → **Test page · timeline** Gantt (`/support/test-page`).
 *
 * **Only source:** `/local-data/support-gantt-test-sheet.json` — OneDrive
 * `…/Skyport-Web-Shared-Test/Test.xlsx` or `Test.xls` (see `useSupportGanttTestSheetData`). Never project root, never
 * `SkyportHome_Roadmap.xlsx` or `test-sheet.json`.
 *
 * Parsing (see `extractGanttRowsFromRawSheet`): full roadmap via `normalizeRoadmapRowsFromRaw`,
 * or feature + `Focus Timeframe` (known quarter keys in `SUPPORT_GANTT_FOCUS_TO_RANGE`),
 * or `Feature` + `Time` (same keys / parseable date), or `Feature`/`Task` + `Start` + `End`.
 * First tab with ≥1 row wins.
 *
 * @typedef {{ feature: string, start: string, end: string, lane?: string }} SupportGanttRow
 */

/** Map roadmap focus strings → bar range (calendar-year quarters for FY26 demo). */
export const SUPPORT_GANTT_FOCUS_TO_RANGE = {
  'Q1 FY26': { start: '2026-01-01', end: '2026-03-31' },
  'Q2 FY26': { start: '2026-04-01', end: '2026-06-30' },
  'Q3 FY26': { start: '2026-07-01', end: '2026-09-30' },
  'Q4 FY26': { start: '2026-10-01', end: '2026-12-31' },
  'FY26 (ongoing)': { start: '2026-01-01', end: '2026-12-31' },
  'FY27+': { start: '2027-01-01', end: '2027-09-30' },
}

const DEFAULT_RANGE = { start: '2026-01-01', end: '2026-06-30' }

function laneFromRow(row) {
  const g = (row.featureGroup || '').trim()
  if (g) return g.length > 36 ? `${g.slice(0, 34)}…` : g
  const it = (row.initiativeType || '').trim()
  return it.length > 36 ? `${it.slice(0, 34)}…` : it || 'Roadmap'
}

function oneLineFeature(text) {
  return String(text || '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * @param {Array<{ feature?: string, featureGroup?: string, initiativeType?: string, focusTimeframe?: string }>} roadmapRows
 * @returns {SupportGanttRow[]}
 */
export function buildSupportGanttRowsFromRoadmap(roadmapRows) {
  if (!Array.isArray(roadmapRows) || roadmapRows.length === 0) return []
  return roadmapRows.map((row) => {
    const tf = (row.focusTimeframe || '').trim()
    const range = SUPPORT_GANTT_FOCUS_TO_RANGE[tf] ?? DEFAULT_RANGE
    return {
      feature: oneLineFeature(row.feature),
      start: range.start,
      end: range.end,
      lane: laneFromRow(row),
    }
  })
}
