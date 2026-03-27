import { FY26_TARGET_METRICS_ALL_COLUMNS } from '../content/fy26GoalsBusinessModelTracking'

function formatTargetMetricsActual(v) {
  if (v == null || v === '') return '—'
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString('en-US')
  return String(v)
}

/** FY26 Target Metrics — one table: metric columns, Target and Actual rows. */
export function Fy26GoalsBusinessModelTracking() {
  return (
    <div className="fy26-target-metrics">
      <h4 className="fy26-goals-bm-tracking-title">Target Metrics</h4>
      <div className="fy26-target-metrics-table-scroll">
        <table
          className="fy26-goals-bm-summary-table fy26-target-metrics-combined-table"
          aria-label="FY26 target metrics: Target and Actual by measure"
        >
          <caption className="fy26-target-metrics-sr-only">
            Fiscal year 2026 targets and actuals; columns are Thermostats, SkyportHome, and SkyportCare measures.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="fy26-goals-bm-summary-table-metric-col fy26-target-metrics-corner-th"
              >
                <span className="fy26-target-metrics-sr-only">Measure type</span>
              </th>
              {FY26_TARGET_METRICS_ALL_COLUMNS.map((col) => (
                <th key={col.id} scope="col">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Target</th>
              {FY26_TARGET_METRICS_ALL_COLUMNS.map((col) => (
                <td key={col.id}>{col.target}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Actual</th>
              {FY26_TARGET_METRICS_ALL_COLUMNS.map((col) => (
                <td key={col.id}>{formatTargetMetricsActual(col.actual)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="fy26-target-metrics-note">
        <strong>Note:</strong>
        {'\u00A0'}
        Engagement metrics (MAU and users taking meaningful actions) are tracked operationally and are not
        included in the FY26 financial forecast. Baselines will be established once instrumentation is in place.
      </p>
    </div>
  )
}
