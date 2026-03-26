import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
} from 'recharts'
import {
  FY26_GOALS_TRACKING_METRICS,
  buildFy26GoalsMonthlyChartData,
  buildFy26MonthlyThermostatChartRows,
  fy26GoalsLineChartHasAnyData,
  fy26MonthlyThermostatAverageSold,
  fy26MonthlyThermostatChartHasAnyData,
  fy26MonthlyThermostatHasLicenseLine,
  getFy26GoalsKeyMetricsRows,
  getFy26GoalsSkyportCareKeyMetricsRows,
} from '../content/fy26GoalsBusinessModelTracking'

const THERMOSTAT_MONTHLY_CHART_HEIGHT = 400
const ACTIVE_LICENSES_LINE_COLOR = '#c25621'
const THERMOSTATS_SOLD_BAR_SWATCH = '#0097e0'

const CHART_AXIS_TICK = { fontSize: 13, fill: '#666', fontWeight: 400 }
const CHART_MONTHLY_X_TICK = {
  ...CHART_AXIS_TICK,
  angle: -32,
  textAnchor: 'end',
}

function formatTooltipValue(v) {
  if (v == null || !Number.isFinite(v)) return '—'
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
  if (Math.abs(v) >= 10_000) return `${Math.round(v / 1000).toLocaleString('en-US')}K`
  return v.toLocaleString('en-US')
}

function formatThermostatMonthlyTooltipValue(v) {
  if (v == null || (typeof v === 'number' && Number.isNaN(v))) return '—'
  return typeof v === 'number' ? v.toLocaleString() : String(v)
}

function monthlyThermostatTooltipSeriesColor(entry) {
  if (entry?.color) return entry.color
  return entry?.dataKey === 'sold' ? THERMOSTATS_SOLD_BAR_SWATCH : ACTIVE_LICENSES_LINE_COLOR
}

function Fy26ThermostatMonthlyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const rows = payload.filter(
    (e) => e != null && e.type !== 'none' && (e.dataKey === 'sold' || e.dataKey === 'activeLicenses'),
  )
  if (!rows.length) return null
  return (
    <div className="fy25-recharts-tooltip">
      {label != null && label !== '' && <div className="fy25-recharts-tooltip-label">{label}</div>}
      <ul className="fy25-recharts-tooltip-list">
        {rows.map((e, i) => (
          <li key={`${e.dataKey}-${i}`} className="fy25-recharts-tooltip-item">
            <span
              className="fy25-recharts-tooltip-swatch"
              style={{ background: monthlyThermostatTooltipSeriesColor(e) }}
              aria-hidden
            />
            <span className="fy25-recharts-tooltip-name">{e.name}</span>
            <span className="fy25-recharts-tooltip-value">{formatThermostatMonthlyTooltipValue(e.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GoalsTrackingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="fy25-recharts-tooltip">
      {label != null && label !== '' && <div className="fy25-recharts-tooltip-label">{label}</div>}
      <ul className="fy25-recharts-tooltip-list">
        {payload.map((e, i) => (
          <li key={i} className="fy25-recharts-tooltip-item">
            <span
              className="fy25-recharts-tooltip-swatch"
              style={{ background: e.color }}
              aria-hidden
            />
            <span className="fy25-recharts-tooltip-name">{e.name}</span>
            <span className="fy25-recharts-tooltip-value">{formatTooltipValue(e.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CHART_HEIGHT = 320

const MONTH_AXIS_TICK = { fill: '#64748b', fontSize: 10 }

function Fy26ThermostatMonthlyComposedChart({ rows }) {
  const avgSold = useMemo(() => fy26MonthlyThermostatAverageSold(rows), [rows])
  const hasLicenseLine = useMemo(() => fy26MonthlyThermostatHasLicenseLine(rows), [rows])
  const lastSoldIndex = useMemo(() => {
    for (let i = rows.length - 1; i >= 0; i--) {
      const v = rows[i]?.sold
      if (v != null && Number.isFinite(v)) return i
    }
    return -1
  }, [rows])

  const lastLicenseIndex = useMemo(() => {
    for (let i = rows.length - 1; i >= 0; i--) {
      const v = rows[i]?.activeLicenses
      if (v != null && Number.isFinite(v)) return i
    }
    return -1
  }, [rows])

  const yMax = useMemo(() => {
    let m = 0
    for (const r of rows) {
      if (r.sold != null && Number.isFinite(r.sold)) m = Math.max(m, r.sold)
      if (r.activeLicenses != null && Number.isFinite(r.activeLicenses)) m = Math.max(m, r.activeLicenses)
    }
    if (m <= 0) return 14000
    return Math.ceil(m * 1.08)
  }, [rows])

  return (
    <ComposedChart
      data={rows}
      margin={{
        top: 8,
        right: 20,
        left: 16,
        bottom: 28,
      }}
      {...{ overflow: 'visible' }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
      <XAxis dataKey="month" interval={0} height={52} tick={CHART_MONTHLY_X_TICK} tickMargin={6} />
      <YAxis
        yAxisId="left"
        orientation="left"
        width={54}
        tick={CHART_AXIS_TICK}
        domain={[0, yMax]}
        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
      />
      <Tooltip content={Fy26ThermostatMonthlyTooltip} cursor={{ fill: '#fff' }} />
      <Bar
        yAxisId="left"
        dataKey="sold"
        name="Thermostats sold"
        fill="rgba(0, 151, 224, 0.38)"
        radius={[4, 4, 0, 0]}
        label={({ x, y, width, value, index }) => {
          if (lastSoldIndex < 0 || index !== lastSoldIndex || value == null || !Number.isFinite(value)) {
            return null
          }
          if (x == null || width == null || y == null) return null
          return (
            <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={9} fontWeight={600} fill="#0097e0">
              Thermostats sold
            </text>
          )
        }}
      />
      {avgSold != null && (
        <ReferenceLine
          yAxisId="left"
          y={avgSold}
          stroke="#0d9488"
          strokeWidth={2}
          strokeDasharray="6 4"
          name="Avg monthly sold"
          label={({ viewBox }) => {
            if (viewBox == null || typeof viewBox !== 'object') return null
            const { x = 0, y = 0, width = 0 } = viewBox
            const text = `Avg ${Math.round(avgSold).toLocaleString()}`
            return (
              <text
                x={x + width - 6}
                y={y - 20}
                fill="#0f766e"
                fontSize={11}
                fontWeight={600}
                textAnchor="end"
              >
                {text}
              </text>
            )
          }}
        />
      )}
      {hasLicenseLine && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="activeLicenses"
          name="Active licenses"
          stroke={ACTIVE_LICENSES_LINE_COLOR}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          label={({ index, x, y }) =>
            lastLicenseIndex >= 0 && index === lastLicenseIndex ? (
              <text
                x={x}
                y={y - 20}
                textAnchor="middle"
                fontSize={12}
                fill={ACTIVE_LICENSES_LINE_COLOR}
                fontWeight={500}
              >
                Active licenses
              </text>
            ) : null}
        />
      )}
    </ComposedChart>
  )
}

/**
 * Plan vs monthly actual (YTD) for thermostat / users / licenses — under Goals on the Digital Apps playbook.
 */
export function Fy26GoalsBusinessModelTracking() {
  const [metricId, setMetricId] = useState(FY26_GOALS_TRACKING_METRICS[0].id)
  const metric = FY26_GOALS_TRACKING_METRICS.find((m) => m.id === metricId) ?? FY26_GOALS_TRACKING_METRICS[0]

  const chartData = useMemo(
    () => (metricId === 'fyThermostatsSold' ? [] : buildFy26GoalsMonthlyChartData(metricId)),
    [metricId],
  )
  const keyMetricsRows = useMemo(() => getFy26GoalsKeyMetricsRows(), [])
  const skyportCareKeyMetricsRows = useMemo(() => getFy26GoalsSkyportCareKeyMetricsRows(), [])

  const thermostatMonthlyRows = useMemo(() => buildFy26MonthlyThermostatChartRows(), [])
  const thermostatMonthlyHasData = useMemo(
    () => fy26MonthlyThermostatChartHasAnyData(thermostatMonthlyRows),
    [thermostatMonthlyRows],
  )

  const isThermostatMonthlyMetric = metricId === 'fyThermostatsSold'

  const lineGoalsChartHasData = useMemo(() => fy26GoalsLineChartHasAnyData(metricId), [metricId])

  return (
    <div className="fy26-goals-bm-tracking">
      <h4 className="fy26-goals-bm-tracking-title">
        Thermostat Sales &amp; Connectivity, SkyportHome Users, SkyportCare Active Licenses
      </h4>
      <div className="fy26-goals-bm-tracking-grid">
        <div className="fy26-goals-bm-tracking-chart-panel">
          <div className="fy25-chart-split-header fy25-chart-split-header--monthly fy26-goals-bm-metric-tabs-header">
            <span
              className="fy25-chart-split-panel-label fy25-chart-split-panel-label--monthly"
              id={isThermostatMonthlyMetric ? 'fy26-goals-thermostat-monthly-heading' : undefined}
            >
              {isThermostatMonthlyMetric ? 'Monthly Data' : 'Metric'}
            </span>
            <div className="fy25-chart-tabs" role="tablist" aria-label="FY26 tracking metric">
              {FY26_GOALS_TRACKING_METRICS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={metricId === m.id}
                  tabIndex={metricId === m.id ? 0 : -1}
                  className={`fy25-chart-tab ${metricId === m.id ? 'fy25-chart-tab--active' : ''}`}
                  onClick={() => setMetricId(m.id)}
                >
                  {m.shortLabel}
                </button>
              ))}
            </div>
          </div>
          {isThermostatMonthlyMetric ? (
            <>
              <div className="fy26-goals-bm-thermostat-monthly-chart-wrap">
                <div className="fy25-thermostat-recharts-root fy26-goals-bm-chart-root">
                  <ResponsiveContainer width="100%" height={THERMOSTAT_MONTHLY_CHART_HEIGHT}>
                    <Fy26ThermostatMonthlyComposedChart rows={thermostatMonthlyRows} />
                  </ResponsiveContainer>
                </div>
                {!thermostatMonthlyHasData && (
                  <div className="fy26-goals-bm-monthly-empty-overlay" aria-hidden>
                    <span className="fy26-goals-bm-monthly-empty-overlay-text">
                      No monthly data yet — chart will fill in as FY26 results arrive.
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="fy26-goals-bm-tracking-metric-fullname">{metric.label}</p>
              <div className="fy26-goals-bm-thermostat-monthly-chart-wrap">
                <div className="fy25-thermostat-recharts-root fy26-goals-bm-chart-root">
                  <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <LineChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" />
                      <XAxis dataKey="month" tick={MONTH_AXIS_TICK} tickMargin={6} interval={0} height={48} />
                      <YAxis
                        width={52}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        domain={lineGoalsChartHasData ? [0, 'auto'] : [0, 1]}
                        tickFormatter={(v) =>
                          v >= 1_000_000
                            ? `${(v / 1_000_000).toFixed(1)}M`
                            : v >= 1000
                              ? `${Math.round(v / 1000)}K`
                              : String(v)
                        }
                      />
                      <Tooltip content={<GoalsTrackingTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="plan"
                        name="Plan (YTD)"
                        stroke={metric.strokePlan}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual (YTD)"
                        stroke={metric.strokeActual}
                        strokeWidth={2.25}
                        strokeDasharray="5 4"
                        dot={{ r: 3.5 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {!lineGoalsChartHasData && (
                  <div className="fy26-goals-bm-monthly-empty-overlay" aria-hidden>
                    <span className="fy26-goals-bm-monthly-empty-overlay-text">
                      No monthly data yet — chart will fill in as FY26 results arrive.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="fy26-goals-bm-tracking-table-panel">
          <h5 className="fy26-goals-bm-side-title">Key Metrics</h5>
          <div className="fy26-goals-bm-summary-scroll">
            <table className="fy26-goals-bm-summary-table">
              <thead>
                <tr>
                  <th scope="col" className="fy26-goals-bm-summary-table-metric-col">
                    Metric
                  </th>
                  <th scope="col">Target</th>
                  <th scope="col">Actual</th>
                </tr>
              </thead>
              <tbody>
                {keyMetricsRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    <td>{row.target}</td>
                    <td>{row.actual ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h5 className="fy26-goals-bm-side-title fy26-goals-bm-side-title--skyportcare">
            SkyportCare Metrics
          </h5>
          <div className="fy26-goals-bm-summary-scroll fy26-goals-bm-summary-scroll--skyportcare-no-y">
            <table className="fy26-goals-bm-summary-table">
              <thead>
                <tr>
                  <th scope="col" className="fy26-goals-bm-summary-table-metric-col">
                    Metric
                  </th>
                  <th scope="col">Target</th>
                  <th scope="col">Actual</th>
                </tr>
              </thead>
              <tbody>
                {skyportCareKeyMetricsRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    <td>{row.target}</td>
                    <td>{row.actual ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
