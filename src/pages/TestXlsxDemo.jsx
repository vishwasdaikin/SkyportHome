import { useState, useEffect, useMemo, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTestSheetData } from '../hooks/useTestSheetData'
import {
  parseFiscalYearWideSheet,
  wideSheetMetricToChartData,
  defaultMetricIndexForFySheet,
} from '../utils/fiscalYearWideSheetChart'

/**
 * Demo: charts ./Test.xlsx (project root). FY## sheets use wide layout (months as columns);
 * defaults to FY23 + "Monthly Daikin Smart Thermostat Sales" when present.
 * Other sheets: first column as X, first numeric column as Y.
 */
function parseNum(v) {
  if (v == null || v === '') return NaN
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : NaN
}

function rowsToChartData(rows) {
  if (!rows?.length) return []
  const keys = Object.keys(rows[0])
  if (keys.length < 2) return []
  const xKey = keys[0]
  const yKey =
    keys.slice(1).find((k) => rows.some((r) => Number.isFinite(parseNum(r[k])))) ?? keys[1]
  return rows.map((r) => ({
    x: String(r[xKey] ?? ''),
    y: parseNum(r[yKey]) || 0,
  }))
}

const PREFERRED_SHEET = 'FY23'

export default function TestXlsxDemo() {
  const { sheetNames, getRows, defaultSheetName, loading, error, refetch } = useTestSheetData({
    pollMs: 4000,
  })
  const [selectedSheet, setSelectedSheet] = useState('')
  const [metricIndex, setMetricIndex] = useState(0)
  const prevSheetRef = useRef('')
  const wideDefaultAppliedRef = useRef(false)

  useEffect(() => {
    if (selectedSheet) return
    if (!sheetNames.length) return
    const prefer = sheetNames.includes(PREFERRED_SHEET)
      ? PREFERRED_SHEET
      : defaultSheetName || sheetNames[0] || ''
    setSelectedSheet(prefer)
  }, [defaultSheetName, selectedSheet, sheetNames])

  useEffect(() => {
    if (sheetNames.length && selectedSheet && !sheetNames.includes(selectedSheet)) {
      const fallback = sheetNames.includes(PREFERRED_SHEET)
        ? PREFERRED_SHEET
        : defaultSheetName || sheetNames[0] || ''
      setSelectedSheet(fallback)
    }
  }, [sheetNames, selectedSheet, defaultSheetName])

  const rows = getRows(selectedSheet)
  const parsedWide = useMemo(() => parseFiscalYearWideSheet(rows), [rows])

  useEffect(() => {
    const sheetChanged = prevSheetRef.current !== selectedSheet
    if (sheetChanged) {
      prevSheetRef.current = selectedSheet
      wideDefaultAppliedRef.current = false
    }
    if (!parsedWide) {
      setMetricIndex(0)
      return
    }
    if (sheetChanged || !wideDefaultAppliedRef.current) {
      setMetricIndex(defaultMetricIndexForFySheet(parsedWide))
      wideDefaultAppliedRef.current = true
    }
  }, [selectedSheet, parsedWide])

  const data = parsedWide
    ? wideSheetMetricToChartData(parsedWide, metricIndex)
    : rowsToChartData(rows)
  const activeMetricLabel = parsedWide?.metrics?.[metricIndex]?.label ?? 'Value'

  return (
    <div className="digital-strategy-page" style={{ maxWidth: 960 }}>
      <header className="ds-header">
        <h1>Test.xlsx (live in dev)</h1>
        <p className="ds-tagline">
          Data comes from <code>Test.xlsx</code> in the project root — <strong>all worksheet tabs</strong> are loaded.
          <strong> FY23</strong> (and other FY## wide layouts) chart monthly columns; default metric is smart thermostat
          sales. With <code>npm run dev</code>, saves are picked up every few seconds.
        </p>
      </header>

      {!import.meta.env.DEV && (
        <p className="ds-meta" style={{ borderLeftColor: '#f59e0b' }}>
          The <code>/local-data/test-sheet.json</code> endpoint only exists in development. For production, serve
          sheet data from your API or a file under <code>public/</code>.
        </p>
      )}

      {loading && <p>Loading sheet…</p>}
      {error && (
        <p style={{ color: '#b91c1c' }}>
          {error.message}{' '}
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
        <>
          {sheetNames.length === 0 ? (
            <p className="ds-meta">No worksheet tabs found in the workbook.</p>
          ) : (
            <div className="ds-meta" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="test-xlsx-tab" style={{ fontWeight: 600 }}>
                Worksheet tab
              </label>
              <select
                id="test-xlsx-tab"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                style={{
                  fontSize: '1rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid var(--border, #e0e0e0)',
                  minWidth: '14rem',
                }}
              >
                {sheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <span style={{ color: 'var(--text-secondary)' }}>
                {sheetNames.length} tab{sheetNames.length === 1 ? '' : 's'} · {rows.length} row(s) in this tab
              </span>
              <button type="button" onClick={() => refetch()}>
                Refresh now
              </button>
            </div>
          )}
          {parsedWide && (
            <div className="ds-meta" style={{ marginTop: '0.75rem' }}>
              <label htmlFor="test-xlsx-metric" style={{ fontWeight: 600, marginRight: '0.5rem' }}>
                Metric (wide FY sheet)
              </label>
              <select
                id="test-xlsx-metric"
                value={metricIndex}
                onChange={(e) => setMetricIndex(Number(e.target.value))}
                style={{
                  fontSize: '0.95rem',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 6,
                  border: '1px solid var(--border, #e0e0e0)',
                  maxWidth: '100%',
                  width: 'min(42rem, 100%)',
                }}
              >
                {parsedWide.metrics.map((m, i) => (
                  <option key={`${i}-${m.label}`} value={i}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {data.length === 0 ? (
            <p>
              {parsedWide
                ? 'No monthly columns found for this metric.'
                : 'No plottable rows (need at least two columns; second should be numeric).'}
            </p>
          ) : (
            <div style={{ width: '100%', height: 360, marginTop: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
                <strong>{selectedSheet}</strong>
                {parsedWide ? ` · ${activeMetricLabel}` : ''}
              </p>
              <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="y" fill="#0097e0" name={activeMetricLabel} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
