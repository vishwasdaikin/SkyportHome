import {
  FY26_TARGET_METRICS_ALL_COLUMNS,
  FY26_GOALS_FISCAL_MONTH_LABELS,
  FY26_TARGET_METRICS_MONTHLY_CHART_LEFT,
  FY26_TARGET_METRICS_MONTHLY_CHART_RIGHT,
} from '../content/fy26GoalsBusinessModelTracking'

const TM_MONTHLY_LEFT_LEGEND = [
  { id: 'sold', label: 'Thermostats sold' },
  { id: 'connected', label: 'Wi-Fi Connected Thermostats' },
  { id: 'users', label: 'Users' },
]

const TM_MONTHLY_RIGHT_LEGEND = [
  { id: 'dealer', label: 'Dealer participation' },
  { id: 'oneYear', label: '1-Year Active Licenses' },
  { id: 'lifetime', label: 'Lifetime Active Licenses' },
]

/** Y-axis ceiling from FY26 targets (readable tick step). */
function fy26TmAxisMax(maxVal) {
  if (!Number.isFinite(maxVal) || maxVal <= 0) return 1
  if (maxVal >= 50_000) return Math.ceil(maxVal / 20_000) * 20_000
  if (maxVal >= 5_000) return Math.ceil(maxVal / 1_000) * 1_000
  if (maxVal >= 500) return Math.ceil(maxVal / 100) * 100
  if (maxVal >= 50) return Math.ceil(maxVal / 10) * 10
  return Math.ceil(maxVal)
}

function fy26TmFormatYTick(v) {
  if (v >= 1_000_000) return `${Math.round(v / 100_000) / 10}M`.replace(/\.0M$/, 'M')
  if (v >= 10_000) return `${Math.round(v / 1000)}K`
  if (v >= 1000) {
    const k = Math.round(v / 100) / 10
    return `${k}K`.replace(/\.0K$/, 'K')
  }
  return String(Math.round(v))
}

/** Linear YTD plan through fiscal month m (0–11): (m+1)/12 of full-year target. */
function fy26TmLinearPlanAtMonth(monthIndex, fullYearTarget) {
  return ((monthIndex + 1) / 12) * fullYearTarget
}

function Fy26TargetMetricsMonthlyPlaceholderPanel({
  title,
  legend,
  targets,
  chartId,
  colorVariant = 'volume',
}) {
  const rawMax = Math.max(...targets, 1)
  const yMax = fy26TmAxisMax(rawMax)
  const yTicksTopDown = [yMax, (3 * yMax) / 4, yMax / 2, yMax / 4, 0]

  return (
    <div
      className={[
        'fy26-tm-monthly-placeholder-panel',
        `fy26-tm-monthly-placeholder-panel--${colorVariant}`,
      ].join(' ')}
      id={chartId}
    >
      <p className="fy26-tm-monthly-placeholder-heading">{title}</p>
      <div
        className="fy26-tm-monthly-placeholder-legend"
        role="list"
        aria-label={`Legend: ${legend.map((e) => e.label).join(', ')}`}
      >
        {legend.map((e, i) => (
          <span key={e.id} className="fy26-tm-monthly-placeholder-legend-item" role="listitem">
            <span
              className={`fy26-tm-monthly-placeholder-swatch fy26-tm-monthly-placeholder-swatch--s${i}`}
              aria-hidden
            />
            <span>{e.label}</span>
          </span>
        ))}
      </div>
      <div className="fy26-tm-monthly-placeholder-chart-wrap">
        <div
          className="fy26-tm-monthly-placeholder-plot"
          role="img"
          aria-label="FY26 monthly linear plan to targets; actual data not yet available"
        >
          <div className="fy26-tm-monthly-placeholder-chart-with-y">
            <div className="fy26-tm-monthly-placeholder-y-axis" aria-hidden="true">
              <div className="fy26-tm-monthly-placeholder-y-ticks">
                {yTicksTopDown.map((t) => (
                  <span key={t} className="fy26-tm-monthly-placeholder-y-tick">
                    {fy26TmFormatYTick(t)}
                  </span>
                ))}
              </div>
            </div>
            <div className="fy26-tm-monthly-placeholder-plot-inner">
              <div className="fy26-tm-monthly-placeholder-grid-lines" aria-hidden="true">
                {[0, 25, 50, 75, 100].map((pct) => (
                  <div
                    key={pct}
                    className="fy26-tm-monthly-placeholder-grid-line"
                    style={{ bottom: `${pct}%` }}
                  />
                ))}
              </div>
              <div className="fy26-tm-monthly-placeholder-fuzzy" aria-hidden="true">
                <div className="fy26-tm-monthly-placeholder-bars">
                  {FY26_GOALS_FISCAL_MONTH_LABELS.map((month, mi) => (
                    <div key={month} className="fy26-tm-monthly-placeholder-month">
                      <div className="fy26-tm-monthly-placeholder-month-bars">
                        {targets.map((fullTarget, si) => {
                          const v = fy26TmLinearPlanAtMonth(mi, fullTarget)
                          const pct = yMax > 0 ? Math.min(100, (v / yMax) * 100) : 0
                          return (
                            <div
                              key={si}
                              className={[
                                'fy26-tm-monthly-placeholder-bar',
                                `fy26-tm-monthly-placeholder-bar--s${si}`,
                              ].join(' ')}
                              style={{ height: `${pct}%` }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fy26-tm-monthly-placeholder-overlay">
                <p className="fy26-tm-monthly-placeholder-overlay-text">Data will be populated as results come in</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="fy26-tm-monthly-placeholder-xaxis"
          role="group"
          aria-label="X-axis: FY26 fiscal months, Apr '25 through Mar '26"
        >
          {FY26_GOALS_FISCAL_MONTH_LABELS.map((month) => {
            const parts = month.trim().split(/\s+/)
            const mPart = parts[0] ?? month
            const yPart = parts[1] ?? ''
            return (
              <div key={month} className="fy26-tm-monthly-placeholder-xaxis-cell" title={month}>
                <span className="fy26-tm-monthly-placeholder-xaxis-tick">
                  <span className="fy26-tm-monthly-placeholder-xaxis-line">{mPart}</span>
                  {yPart ? (
                    <span className="fy26-tm-monthly-placeholder-xaxis-line fy26-tm-monthly-placeholder-xaxis-line--year">
                      {yPart}
                    </span>
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** FY26 fiscal year — 12 placeholder monthly bar charts (left: volume & users; right: SkyportCare). */
function Fy26TargetMetricsMonthlyPlaceholderCharts() {
  return (
    <div
      className="fy26-tm-monthly-placeholder-section"
      aria-label="FY26 monthly plan charts by fiscal month"
    >
      <div className="fy26-tm-monthly-placeholder-grid">
        <Fy26TargetMetricsMonthlyPlaceholderPanel
          chartId="fy26-tm-monthly-chart-volume"
          title="Thermostats, connectivity & SkyportHome"
          legend={TM_MONTHLY_LEFT_LEGEND}
          targets={FY26_TARGET_METRICS_MONTHLY_CHART_LEFT}
          colorVariant="volume"
        />
        <Fy26TargetMetricsMonthlyPlaceholderPanel
          chartId="fy26-tm-monthly-chart-skyportcare"
          title="SkyportCare dealers & licenses"
          legend={TM_MONTHLY_RIGHT_LEGEND}
          targets={FY26_TARGET_METRICS_MONTHLY_CHART_RIGHT}
          colorVariant="skyportcare"
        />
      </div>
    </div>
  )
}

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
      <Fy26TargetMetricsMonthlyPlaceholderCharts />
      <p className="fy26-target-metrics-note">
        <strong>Note:</strong>
        {'\u00A0'}
        Engagement metrics (MAU and users taking meaningful actions) are tracked operationally and are not
        included in the FY26 financial forecast. Baselines will be established once instrumentation is in place.
      </p>
    </div>
  )
}
