import {
  getDigitalPlatformsForecastYearlyChartData,
  getDigitalPlatformsForecastFunnelColumnsForTable,
} from './digitalPlatformsForecastFunnel'

/** Fiscal FY26 months (Apr'25–Mar'26), aligned with business model FY26 column. */
export const FY26_GOALS_FISCAL_MONTH_LABELS = [
  "Apr '25",
  "May '25",
  "Jun '25",
  "Jul '25",
  "Aug '25",
  "Sep '25",
  "Oct '25",
  "Nov '25",
  "Dec '25",
  "Jan '26",
  "Feb '26",
  "Mar '26",
]

/**
 * When true, month-by-month Plan (YTD) uses a linear ramp from the Digital Platforms business model
 * FY26 activity targets. When false, Plan YTD is empty (—) until you set this to true or add another source.
 */
export const FY26_GOALS_MONTHLY_INCLUDE_MODEL_PLAN = false

/**
 * Monthly actuals (YTD cumulative) per metric — null until reported.
 * Edit here as FY26 results arrive; chart and table pick this up automatically.
 */
export const FY26_GOALS_MONTHLY_ACTUALS = {
  fyThermostatsSold: Array(12).fill(null),
  fyConnectedThermostats: Array(12).fill(null),
  fySkyportHomeUsersNetNew: Array(12).fill(null),
  fyActiveLicensesNetNew: Array(12).fill(null),
}

/**
 * FY26 left “Monthly Data” chart (same shape as FY25): per-fiscal-month thermostats sold (bars) and
 * active licenses (line). Use `null` until that month is reported — chart stays empty until values exist.
 */
export const FY26_GOALS_MONTHLY_THERMOSTAT_SOLD = Array(12).fill(null)
export const FY26_GOALS_MONTHLY_THERMOSTAT_ACTIVE_LICENSES = Array(12).fill(null)

export function buildFy26MonthlyThermostatChartRows() {
  return FY26_GOALS_FISCAL_MONTH_LABELS.map((month, i) => ({
    month,
    sold: FY26_GOALS_MONTHLY_THERMOSTAT_SOLD[i],
    activeLicenses: FY26_GOALS_MONTHLY_THERMOSTAT_ACTIVE_LICENSES[i],
  }))
}

export function fy26MonthlyThermostatChartHasAnyData(rows) {
  return rows.some(
    (r) =>
      (r.sold != null && Number.isFinite(r.sold)) ||
      (r.activeLicenses != null && Number.isFinite(r.activeLicenses)),
  )
}

export function fy26MonthlyThermostatAverageSold(rows) {
  const vals = rows.map((r) => r.sold).filter((v) => v != null && Number.isFinite(v))
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function fy26MonthlyThermostatHasLicenseLine(rows) {
  return rows.some((r) => r.activeLicenses != null && Number.isFinite(r.activeLicenses) && r.activeLicenses > 0)
}

export const FY26_GOALS_TRACKING_METRICS = [
  {
    id: 'fyThermostatsSold',
    label: 'FY thermostats sold',
    shortLabel: 'Thermostats sold',
    strokePlan: '#0097e0',
    strokeActual: '#0369a1',
  },
  {
    id: 'fyConnectedThermostats',
    label: 'FY connected thermostats',
    shortLabel: 'Connected',
    strokePlan: '#0d9488',
    strokeActual: '#0f766e',
  },
  {
    id: 'fySkyportHomeUsersNetNew',
    label: 'FY SkyportHome users (net new)',
    shortLabel: 'Users (net new)',
    strokePlan: '#7c3aed',
    strokeActual: '#5b21b6',
  },
  {
    id: 'fyActiveLicensesNetNew',
    label: 'Active licenses (FY net new)',
    shortLabel: 'Active licenses',
    strokePlan: '#dc2626',
    strokeActual: '#b91c1c',
  },
]

function roundNear(n) {
  return Math.round(n)
}

function getFy26ActivityRow() {
  return getDigitalPlatformsForecastYearlyChartData().find((r) => r.period === 'FY26') ?? null
}

function getFy26FunnelCol() {
  return getDigitalPlatformsForecastFunnelColumnsForTable().find((c) => c.id === 'FY26') ?? null
}

/** Linear YTD plan: (monthIndex+1)/12 × full-year activity target. */
export function fy26PlanYtdAtMonth(fyTotal, monthIndex) {
  if (!Number.isFinite(fyTotal) || fyTotal <= 0) return 0
  return roundNear(((monthIndex + 1) / 12) * fyTotal)
}

export function getFy26ActivityTargets() {
  const row = getFy26ActivityRow()
  return {
    fyThermostatsSold: row?.fyThermostatsAllBrands ?? 0,
    fyConnectedThermostats: row?.fyConnectedThermostats ?? 0,
    fySkyportHomeUsersNetNew: row?.fySkyportHomeUsers ?? 0,
    fyActiveLicensesNetNew: row?.fyActiveLicensesNetNew ?? 0,
  }
}

function getFy26GoalsSummarySource() {
  const act = getFy26ActivityRow()
  const col = getFy26FunnelCol()
  if (!act || !col) return null
  return { act, col }
}

/**
 * Key Metrics / SkyportCare Metrics — Actual column. String or number as reported; null until filled.
 */
export const FY26_GOALS_KEY_METRICS_ACTUALS = {
  fyThermostatsSold: null,
  fyConnectedThermostats: null,
  fyConnectedPct: null,
  fySkyportHomeUsersNetNew: null,
  dealerParticipation: null,
  oneYearActiveLicensesEoy: null,
  lifetimeActiveLicensesEoy: null,
}

function formatKeyMetricActual(v) {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString('en-US')
  return String(v)
}

/** Top Key Metrics table (thermostats, connectivity, SkyportHome users). */
export function getFy26GoalsKeyMetricsRows() {
  const src = getFy26GoalsSummarySource()
  if (!src) return []
  const { act, col } = src
  return [
    {
      id: 'fyThermostatsSold',
      label: 'FY thermostats sold',
      target: act.fyThermostatsAllBrands.toLocaleString('en-US'),
      actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.fyThermostatsSold),
    },
    {
      id: 'fyConnectedThermostats',
      label: 'FY connected thermostats',
      target: act.fyConnectedThermostats.toLocaleString('en-US'),
      actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.fyConnectedThermostats),
    },
    {
      id: 'fyConnectedPct',
      label: '% of FY thermostats connected',
      target: `${Math.round(col.connectedPct)}%`,
      actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.fyConnectedPct),
    },
    {
      id: 'fySkyportHomeUsersNetNew',
      label: 'FY SkyportHome users — net new',
      target: act.fySkyportHomeUsers.toLocaleString('en-US'),
      actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.fySkyportHomeUsersNetNew),
    },
  ]
}

/** Dealer participation count shown as Target on the first SkyportCare Metrics row. */
const FY26_SKYPORTCARE_DEALER_PARTICIPATION_TARGET = 2718

/** SkyportCare Metrics table (dealer participation + license EOY targets from funnel). */
export function getFy26GoalsSkyportCareKeyMetricsRows() {
  const col = getFy26FunnelCol()
  const rows = [
    {
      id: 'dealerParticipation',
      label: 'Dealer participation',
      target: FY26_SKYPORTCARE_DEALER_PARTICIPATION_TARGET.toLocaleString('en-US'),
      actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.dealerParticipation),
    },
  ]
  if (col) {
    rows.push(
      {
        id: 'oneYearActiveLicensesEoy',
        label: '1-Year Active Licenses',
        target: col.oneYearActiveLicensesEoy.toLocaleString('en-US'),
        actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.oneYearActiveLicensesEoy),
      },
      {
        id: 'lifetimeActiveLicensesEoy',
        label: 'Lifetime Active Licenses',
        target: col.lifetimeActiveLicensesEoy.toLocaleString('en-US'),
        actual: formatKeyMetricActual(FY26_GOALS_KEY_METRICS_ACTUALS.lifetimeActiveLicensesEoy),
      },
    )
  }
  return rows
}

export function buildFy26GoalsMonthlyTableRows(metricId) {
  const targets = getFy26ActivityTargets()
  const fyTotal = targets[metricId] ?? 0
  const actuals = FY26_GOALS_MONTHLY_ACTUALS[metricId] ?? Array(12).fill(null)

  return FY26_GOALS_FISCAL_MONTH_LABELS.map((month, i) => {
    const planYtd =
      FY26_GOALS_MONTHLY_INCLUDE_MODEL_PLAN && Number.isFinite(fyTotal) && fyTotal > 0
        ? fy26PlanYtdAtMonth(fyTotal, i)
        : null
    const actual = actuals[i]
    const variance =
      actual != null &&
      Number.isFinite(actual) &&
      planYtd != null &&
      Number.isFinite(planYtd)
        ? actual - planYtd
        : null
    return { month, planYtd, actual, variance }
  })
}

export function buildFy26GoalsMonthlyChartData(metricId) {
  return buildFy26GoalsMonthlyTableRows(metricId).map((r) => ({
    month: r.month,
    plan: r.planYtd,
    actual: r.actual,
  }))
}

export function fy26GoalsLineChartHasAnyData(metricId) {
  return buildFy26GoalsMonthlyChartData(metricId).some(
    (r) =>
      (r.plan != null && Number.isFinite(r.plan)) ||
      (r.actual != null && Number.isFinite(r.actual)),
  )
}
