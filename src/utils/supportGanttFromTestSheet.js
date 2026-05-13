/**
 * Build Support Gantt rows from a single sheet’s raw Excel rows (`sheet_to_json`).
 * Tries, in order: full Skyport roadmap → light roadmap (feature + quarter only) → Feature + Time
 * (quarter label or parseable date) → Feature/Start/End columns.
 */
import { mapRawRowToRoadmapRow, normalizeRoadmapRowsFromRaw } from './roadmapExcelRows'
import { parseFlexibleDate } from './supportGanttDates'
import { SUPPORT_GANTT_FOCUS_TO_RANGE, buildSupportGanttRowsFromRoadmap } from '../content/supportTestGanttData'

function oneLine(text) {
  return String(text || '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

function toYmdLocal(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function cellCI(raw, names) {
  const keys = Object.keys(raw)
  for (const n of names) {
    const k = keys.find((x) => x.trim().toLowerCase() === n.toLowerCase())
    if (k != null && raw[k] != null && String(raw[k]).trim() !== '') return String(raw[k]).trim()
  }
  return ''
}

/** Rows with Feature / Function + Focus Timeframe (known quarter) without full roadmap validation. */
function looseRoadmapRows(rawRows) {
  if (!Array.isArray(rawRows)) return []
  return rawRows
    .map(mapRawRowToRoadmapRow)
    .filter((r) => r.feature.length > 0)
    .filter((r) => {
      const tf = (r.focusTimeframe || '').trim()
      return Boolean(tf && tf !== '—' && SUPPORT_GANTT_FOCUS_TO_RANGE[tf])
    })
}

/** Rows with Feature (or Task) + Start + End date-like columns. */
function featureStartEndRows(rawRows) {
  if (!Array.isArray(rawRows)) return []
  const out = []
  for (const raw of rawRows) {
    const feature = cellCI(raw, [
      'Feature',
      'Task',
      'Feature / Function',
      'Name',
      'Title',
      'Milestone',
    ])
    const start = cellCI(raw, ['Start', 'Start Date', 'Begin'])
    const end = cellCI(raw, ['End', 'End Date', 'Finish', 'Due', 'Due Date'])
    if (!feature || !start || !end) continue
    const sd = parseFlexibleDate(start)
    const ed = parseFlexibleDate(end)
    if (!sd || !ed) continue
    const lane = cellCI(raw, ['Lane', 'Category', 'Feature Group', 'Initiative', 'Stream', 'Owner']) || 'Schedule'
    out.push({
      feature: oneLine(feature),
      start: toYmdLocal(sd),
      end: toYmdLocal(ed),
      lane: lane.length > 36 ? `${lane.slice(0, 34)}…` : lane,
    })
  }
  return out
}

/**
 * `Feature` (or synonyms) + `Time`: either a known focus quarter (see SUPPORT_GANTT_FOCUS_TO_RANGE)
 * or any value `parseFlexibleDate` accepts (single-day bar).
 */
function featurePlusTimeColumnRows(rawRows) {
  if (!Array.isArray(rawRows)) return []
  const quarterLike = []
  const dateBars = []
  for (const raw of rawRows) {
    const feature = cellCI(raw, [
      'Feature',
      'Task',
      'Feature / Function',
      'Name',
      'Title',
      'Milestone',
    ])
    const timeVal = cellCI(raw, [
      'Time',
      'When',
      'Period',
      'Quarter',
      'Focus Timeframe',
      'Timeline',
    ])
    if (!feature || !timeVal) continue
    const tf = timeVal.replace(/\s+/g, ' ').trim()
    if (SUPPORT_GANTT_FOCUS_TO_RANGE[tf]) {
      quarterLike.push({ feature: oneLine(feature), focusTimeframe: tf })
      continue
    }
    const d = parseFlexibleDate(timeVal)
    if (d) {
      const ymd = toYmdLocal(d)
      dateBars.push({ feature: oneLine(feature), start: ymd, end: ymd, lane: 'Time' })
    }
  }
  const fromQuarters = buildSupportGanttRowsFromRoadmap(quarterLike)
  return [...fromQuarters, ...dateBars]
}

/**
 * @param {unknown[]} rawRows
 * @returns {{ kind: 'roadmap' | 'loose-roadmap' | 'feature-time' | 'date-columns' | 'none', rows: import('../content/supportTestGanttData').SupportGanttRow[] }}
 */
export function extractGanttRowsFromRawSheet(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return { kind: 'none', rows: [] }
  }

  const strict = normalizeRoadmapRowsFromRaw(rawRows)
  if (strict.length > 0) {
    return { kind: 'roadmap', rows: buildSupportGanttRowsFromRoadmap(strict) }
  }

  const loose = looseRoadmapRows(rawRows)
  if (loose.length > 0) {
    return { kind: 'loose-roadmap', rows: buildSupportGanttRowsFromRoadmap(loose) }
  }

  const featureTime = featurePlusTimeColumnRows(rawRows)
  if (featureTime.length > 0) {
    return { kind: 'feature-time', rows: featureTime }
  }

  const byDates = featureStartEndRows(rawRows)
  if (byDates.length > 0) {
    return { kind: 'date-columns', rows: byDates }
  }

  return { kind: 'none', rows: [] }
}
