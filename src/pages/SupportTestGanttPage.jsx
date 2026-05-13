import { useMemo } from 'react'
import { useSupportGanttTestSheetData } from '../hooks/useSupportGanttTestSheetData'
import { extractGanttRowsFromRawSheet } from '../utils/supportGanttFromTestSheet'
import { parseFlexibleDate } from '../utils/supportGanttDates.js'
import './SupportTestGanttPage.css'

/** Prefer these tab names if present; else first sheet that yields roadmap rows. */
const GANTT_SHEET_PRIORITY = ['Gantt', 'Timeline', 'SkyportCare', 'SkyportHome', 'Sheet1']

function formatMonthDay(value) {
  const d = parseFlexibleDate(value)
  if (!d) return value == null || value === '' ? '—' : String(value)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function computeLayout(ganttInputRows) {
  const rowsIn = Array.isArray(ganttInputRows) ? ganttInputRows : []
  const totalCount = rowsIn.length
  const enriched = rowsIn.map((r) => {
    let s = parseFlexibleDate(r.start)
    let e = parseFlexibleDate(r.end)
    if (s && e && e.getTime() < s.getTime()) {
      const t = e
      e = s
      s = t
    }
    if (s && !e) e = s
    return { ...r, _s: s, _e: e }
  })

  let min = Infinity
  let max = -Infinity
  for (const r of enriched) {
    if (r._s) {
      min = Math.min(min, r._s.getTime())
      max = Math.max(max, (r._e ?? r._s).getTime())
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const pad = 7 * 24 * 60 * 60 * 1000
    const now = Date.now()
    min = (min === Infinity ? now : min) - pad
    max = (max === -Infinity ? now : max) + pad
  } else {
    const margin = (max - min) * 0.04
    min -= margin
    max += margin
  }

  const span = max - min || 1
  const unscheduledCount = enriched.filter((r) => !r._s).length
  const scheduledCount = totalCount - unscheduledCount

  const rows = enriched.map((r) => {
    if (!r._s) {
      return {
        ...r,
        unscheduled: true,
        leftPct: 0,
        widthPct: 0,
      }
    }
    const endT = (r._e ?? r._s).getTime()
    return {
      ...r,
      unscheduled: false,
      leftPct: ((r._s.getTime() - min) / span) * 100,
      widthPct: Math.max(0.8, ((endT - r._s.getTime()) / span) * 100),
    }
  })

  return {
    minT: min,
    maxT: max,
    rows,
    totalCount,
    scheduledCount,
    unscheduledCount,
  }
}

function pickGanttRowsFromTestWorkbook(sheetNames, getRows) {
  const names = Array.isArray(sheetNames) ? sheetNames : []
  const orderedNames = [
    ...GANTT_SHEET_PRIORITY.filter((n) => names.includes(n)),
    ...names.filter((n) => !GANTT_SHEET_PRIORITY.includes(n)),
  ]
  for (const name of orderedNames) {
    const raw = getRows(name)
    const { kind, rows } = extractGanttRowsFromRawSheet(raw)
    if (rows.length > 0) return { ganttRows: rows, sheetUsed: name, parseKind: kind }
  }
  return { ganttRows: [], sheetUsed: null, parseKind: 'none' }
}

export default function SupportTestGanttPage() {
  const { sheetNames, getRows, workbook, loading, error, sheets } = useSupportGanttTestSheetData({ pollMs: 4000 })

  const { ganttRows, sheetUsed, parseKind } = useMemo(
    () => pickGanttRowsFromTestWorkbook(sheetNames, getRows),
    [sheetNames, getRows, sheets],
  )

  const ganttInputRows = ganttRows

  const fromTestWorkbook = Array.isArray(ganttInputRows) && ganttInputRows.length > 0

  const { minT, maxT, rows, totalCount, scheduledCount, unscheduledCount } = useMemo(() => {
    if (ganttInputRows.length === 0) {
      return {
        minT: Date.now(),
        maxT: Date.now() + 86400000 * 90,
        rows: [],
        totalCount: 0,
        scheduledCount: 0,
        unscheduledCount: 0,
      }
    }
    return computeLayout(ganttInputRows)
  }, [ganttInputRows])

  const axisTicks = useMemo(() => {
    const span = maxT - minT
    if (!(span > 0)) return [minT]
    const approx = 5
    const step = span / approx
    const ticks = []
    for (let t = minT; t <= maxT; t += step) {
      ticks.push(t)
    }
    if (ticks.length && ticks[ticks.length - 1] < maxT) ticks.push(maxT)
    return ticks
  }, [minT, maxT])

  return (
    <div className="support-gantt-page">
      <header className="support-gantt-page__header">
        <h1 className="support-gantt-page__title">Test page · timeline</h1>
        <p className="support-gantt-page__lede">
          Gantt bars come <strong>only</strong> from{' '}
          <code className="support-gantt-page__code">/local-data/support-gantt-test-sheet.json</code> —{' '}
          OneDrive <code className="support-gantt-page__code">Skyport-Web-Shared-Test/Test.xlsx</code> or{' '}
          <code className="support-gantt-page__code">Skyport-Web-Shared-Test/Test.xls</code> only (dev polls ~4s).{' '}
          <strong>Not</strong> <code className="support-gantt-page__code">SkyportHome_Roadmap.xlsx</code> and not{' '}
          <code className="support-gantt-page__code">/local-data/test-sheet.json</code>. Uses the first tab that yields rows: full
          roadmap columns, or <code className="support-gantt-page__code">Feature / Function</code> +{' '}
          <code className="support-gantt-page__code">Focus Timeframe</code> (Q1 FY26, …), or{' '}
          <code className="support-gantt-page__code">Feature</code> + <code className="support-gantt-page__code">Time</code> (same
          quarters, or a parseable date for a one-day bar), or <code className="support-gantt-page__code">Feature</code> +{' '}
          <code className="support-gantt-page__code">Start</code> + <code className="support-gantt-page__code">End</code>.
          {unscheduledCount > 0 ? (
            <>
              {' '}
              — <strong>{unscheduledCount}</strong> row{unscheduledCount === 1 ? '' : 's'} need parseable dates.
            </>
          ) : null}
        </p>
        {error ? (
          <p className="support-gantt-page__error" role="alert">
            {error.message}
          </p>
        ) : null}
        <p className="support-gantt-page__meta" role="status">
          {loading ? 'Loading workbook…' : null}
          {!loading && fromTestWorkbook ? (
            <>
              <strong>{totalCount}</strong> feature{totalCount === 1 ? '' : 's'} from{' '}
              <strong>{workbook || 'test workbook'}</strong>
              {sheetUsed ? (
                <>
                  , sheet <strong>{sheetUsed}</strong>
                </>
              ) : null}
              {scheduledCount < totalCount
                ? ` (${scheduledCount} on timeline, ${unscheduledCount} unscheduled)`
                : ''}
              {parseKind && parseKind !== 'none' ? (
                <>
                  {' '}
                  Parsed as{' '}
                  <strong>
                    {parseKind === 'roadmap'
                      ? 'full roadmap'
                      : parseKind === 'loose-roadmap'
                        ? 'feature + focus timeframe'
                        : parseKind === 'feature-time'
                          ? 'feature + time'
                          : parseKind === 'date-columns'
                            ? 'start/end date columns'
                            : 'timeline rows'}
                  </strong>
                  .
                </>
              ) : null}
            </>
          ) : null}
          {!loading && !fromTestWorkbook ? (
            <>
              No timeline rows found in this workbook’s tabs
              {Array.isArray(sheetNames) && sheetNames.length > 0 ? (
                <>
                  : <strong>{sheetNames.join(', ')}</strong>
                </>
              ) : null}
              . Add a tab with full roadmap columns, or <code className="support-gantt-page__code">Feature / Function</code> +{' '}
              <code className="support-gantt-page__code">Focus Timeframe</code> (Q1 FY26, Q2 FY26, …), or{' '}
              <code className="support-gantt-page__code">Feature</code> + <code className="support-gantt-page__code">Time</code>, or{' '}
              <code className="support-gantt-page__code">Feature</code> + <code className="support-gantt-page__code">Start</code> +{' '}
              <code className="support-gantt-page__code">End</code>. The workbook must live under OneDrive{' '}
              <code className="support-gantt-page__code">Skyport-Web-Shared-Test</code>.
            </>
          ) : null}
        </p>
      </header>

      {totalCount > 0 ? (
        <section className="support-gantt-page__chart" aria-label="Feature timeline chart">
          <div className="support-gantt-page__axis">
            {axisTicks.map((t) => (
              <span
                key={t}
                className="support-gantt-page__tick"
                style={{ left: `${((t - minT) / (maxT - minT)) * 100}%` }}
              >
                {new Date(t).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
              </span>
            ))}
          </div>

          <div className="support-gantt-page__gridlines" aria-hidden>
            {axisTicks.map((t) => (
              <div
                key={`g-${t}`}
                className="support-gantt-page__gridline"
                style={{ left: `${((t - minT) / (maxT - minT)) * 100}%` }}
              />
            ))}
          </div>

          <ul className="support-gantt-page__rows">
            {rows.map((r, i) => (
              <li key={`${r.feature}-${String(r.start)}-${i}`} className="support-gantt-page__row">
                <div className="support-gantt-page__label">
                  <span className="support-gantt-page__feature">{r.feature}</span>
                  {r.lane ? <span className="support-gantt-page__lane">{r.lane}</span> : null}
                  <span className="support-gantt-page__dates">
                    {formatMonthDay(r.start)} → {formatMonthDay(r.end)}
                  </span>
                </div>
                <div className="support-gantt-page__track">
                  {r.unscheduled ? (
                    <div
                      className="support-gantt-page__unscheduled"
                      title="Add ISO dates (YYYY-MM-DD) or Excel serial for start/end"
                    >
                      Needs timeline dates
                    </div>
                  ) : (
                    <div
                      className="support-gantt-page__bar"
                      style={{ left: `${r.leftPct}%`, width: `${r.widthPct}%` }}
                      title={`${r.feature}: ${r.start} → ${r.end}`}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
