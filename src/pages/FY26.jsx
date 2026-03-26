import { useState, useLayoutEffect, useEffect, useRef, useId } from 'react'
import { useParams, Navigate, Link, NavLink, useLocation } from 'react-router-dom'
import {
  FY26_BASE,
  FY26_DEFAULT_SECTION_ID,
  FY26_NAV_ITEMS,
  FY26_TOP_NAV_IDS,
  FY26_TOP_NAV_TITLES,
} from '../constants/fy26Nav'
import {
  ComposedChart,
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
  useXAxisScale,
  useYAxisScale,
} from 'recharts'
import './DigitalStrategy.css'
import './FY26.css'
import {
  ThermostatLocationsMapProvider,
  ThermostatLocationsMapInlineLink,
} from '../components/ThermostatLocationsMap'
import { DigitalPlatformsBusinessModelTable } from '../components/DigitalPlatformsBusinessModelTable'
import FY26PageNav from '../components/FY26PageNav'
import { Fy26DigitalAppsRoadmapEmbeds } from '../components/Fy26DigitalAppsRoadmapEmbeds'
import { Fy26GoalsBusinessModelTracking } from '../components/Fy26GoalsBusinessModelTracking'
import {
  getDigitalPlatformsForecastYearlyChartData,
  getDigitalPlatformsForecastCumulativeChartData,
  getDigitalPlatformsForecastFunnelColumnsForTable,
} from '../content/digitalPlatformsForecastFunnel'

/** FY2023 units sold + active SkyportCare licenses (Apr'23–Mar'24). */
const FY23_THERMOSTAT_MONTHLY_DATA = [
  { month: "Apr'23", sold: 7503, activeLicenses: 367 },
  { month: "May'23", sold: 9925, activeLicenses: 355 },
  { month: "Jun'23", sold: 13262, activeLicenses: 652 },
  { month: "Jul'23", sold: 10573, activeLicenses: 674 },
  { month: "Aug'23", sold: 11104, activeLicenses: 636 },
  { month: "Sep'23", sold: 7565, activeLicenses: 432 },
  { month: "Oct'23", sold: 7511, activeLicenses: 502 },
  { month: "Nov'23", sold: 6766, activeLicenses: 438 },
  { month: "Dec'23", sold: 6337, activeLicenses: 368 },
  { month: "Jan'24", sold: 7017, activeLicenses: 558 },
  { month: "Feb'24", sold: 7717, activeLicenses: 435 },
  { month: "Mar'24", sold: 11223, activeLicenses: 439 },
]

/** FY2024 units sold + active SkyportCare licenses (Apr'24–Mar'25). */
const FY24_THERMOSTAT_MONTHLY_DATA = [
  { month: "Apr'24", sold: 11059, activeLicenses: 367 },
  { month: "May'24", sold: 14484, activeLicenses: 613 },
  { month: "Jun'24", sold: 20172, activeLicenses: 645 },
  { month: "Jul'24", sold: 21250, activeLicenses: 859 },
  { month: "Aug'24", sold: 18543, activeLicenses: 726 },
  { month: "Sep'24", sold: 12503, activeLicenses: 546 },
  { month: "Oct'24", sold: 12109, activeLicenses: 702 },
  { month: "Nov'24", sold: 8560, activeLicenses: 668 },
  { month: "Dec'24", sold: 9539, activeLicenses: 661 },
  { month: "Jan'25", sold: 7658, activeLicenses: 765 },
  { month: "Feb'25", sold: 10185, activeLicenses: 699 },
  { month: "Mar'25", sold: 12714, activeLicenses: 600 },
]

const FY25_THERMOSTAT_MONTHLY_DATA = [
  { month: "Apr'25", sold: 15439, activeLicenses: 680 },
  { month: "May'25", sold: 18909, activeLicenses: 730 },
  { month: "Jun'25", sold: 21066, activeLicenses: 827 },
  { month: "Jul'25", sold: 20739, activeLicenses: 954 },
  { month: "Aug'25", sold: 15453, activeLicenses: 856 },
  { month: "Sep'25", sold: 12025, activeLicenses: 707 },
  { month: "Oct'25", sold: 12748, activeLicenses: 847 },
  { month: "Nov'25", sold: 9042, activeLicenses: 873 },
  { month: "Dec'25", sold: 13399, activeLicenses: 977 },
  { month: "Jan'26", sold: 11424, activeLicenses: 962 },
  { month: "Feb'26", sold: 12064, activeLicenses: 1014 },
]

/** Left FY monthly chart height (px). */
const THERMOSTAT_FY_CHART_HEIGHT = 400

/** Active licenses line — rusty orange (left monthly + All-Time charts, table accent). */
const FY26_ACTIVE_LICENSES_LINE_COLOR = '#c25621'
/** All-time chart: SkyportHome registered users (single point between Q3 and Q4 FY25). */
const FY26_SKYPORTHOME_USERS_LINE_COLOR = '#7c3aed'

/**
 * FY23 fiscal year (Apr'23–Mar'24): cumulative total thermostats sales by month.
 * Right All-Time chart uses quarter-end values (Jun, Sep, Dec, Mar).
 */
const FY23_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY = [
  189_980, 199_905, 213_167, 223_740, 234_844, 242_409, 249_920, 256_686, 263_023, 270_040, 277_757,
  288_980,
]

/** FY23 (Apr'23–Mar'24): cumulative connected thermostats (cloud/app), by month. */
const FY23_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY = [
  99_826, 105_125, 114_981, 121_036, 127_251, 132_549, 131_437, 135_558, 139_286, 142_533, 146_026,
  149_689,
]

/** FY23 (Apr'23–Mar'24): cumulative active Cloud Services licenses, by month. */
const FY23_ACTIVE_LICENSES_CUMULATIVE_MONTHLY = [
  3_639, 4_025, 4_651, 5_325, 5_961, 6_393, 6_895, 7_333, 7_701, 8_259, 8_694, 9_133,
]

/**
 * FY24 fiscal year (Apr'24–Mar'25): cumulative total thermostats sales by month.
 * Right All-Time chart uses quarter-end values (Jun, Sep, Dec, Mar).
 */
const FY24_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY = [
  300_039, 314_523, 334_695, 355_945, 374_488, 386_991, 399_100, 407_660, 417_199, 424_857, 435_042,
  447_756,
]

/** FY24 (Apr'24–Mar'25): cumulative connected thermostats (cloud/app), by month. */
const FY24_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY = [
  156_063, 166_317, 172_806, 184_126, 193_334, 201_802, 205_000, 207_754, 216_362, 223_917, 229_685,
  246_796,
]

/** FY24 (Apr'24–Mar'25): active Cloud Services licenses by month (quarter-end points on All-Time chart). */
const FY24_ACTIVE_LICENSES_CUMULATIVE_MONTHLY = [
  8_177, 8_790, 9_435, 8_628, 8_879, 9_434, 9_690, 10_236, 10_826, 9_612, 9_874, 10_062,
]

/**
 * FY25 in progress (Apr'25–Feb'26): cumulative total thermostats sales by month (11 months; Mar'26 not yet).
 * All-Time chart: Q4 '25 uses end-of-Feb cumulative (Jan+Feb of Q4) until March quarter-end exists.
 */
const FY25_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY = [
  463_195, 482_104, 503_170, 523_909, 539_362, 551_387, 564_135, 573_177, 586_576, 598_000, 610_064,
]

/** FY25 in progress (Apr'25–Feb'26): cumulative connected thermostats, by month (11 months; Mar'26 not yet). */
const FY25_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY = [
  269_593, 294_481, 299_991, 304_528, 294_532, 302_743, 311_895, 318_949, 328_155, 335_302, 341_229,
]

/** FY25 in progress (Apr'25–Feb'26): active Cloud Services licenses by month (11 months; Mar'26 not yet). */
const FY25_ACTIVE_LICENSES_CUMULATIVE_MONTHLY = [
  10_265, 10_400, 10_584, 10_720, 10_917, 11_076, 11_280, 11_521, 11_833, 11_963, 13_308,
]

/** Fiscal quarter-end month indices in FY (0=Apr … 11=Mar): Q1 Jun=2, Q2 Sep=5, Q3 Dec=8, Q4 Mar=11. */
const FY_FISCAL_QUARTER_END_MONTH_INDEX = [2, 5, 8, 11]

/** SkyportHome users count (dot between Q3 and Q4 FY25; value also on Q4 row for tooltip). */
const SKYPORTHOME_ALL_TIME_VALUE = 317_000

/**
 * Quarter-end points FY23 → FY24 → FY25. If fiscal Q4 (Mar) is missing but Jan/Feb exist,
 * a single Q4 row uses the latest month-end cumulative (partial quarter, e.g. 2 months).
 */
const ALL_TIME_RIGHT_QUARTERLY_SPAN = (() => {
  const rows = []
  const q4MonthIdx = FY_FISCAL_QUARTER_END_MONTH_INDEX[3]
  const q3MonthIdx = FY_FISCAL_QUARTER_END_MONTH_INDEX[2]

  const segments = [
    {
      suffix: "'23",
      months: FY23_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY,
      connectedMonths: FY23_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY,
      activeLicensesMonths: FY23_ACTIVE_LICENSES_CUMULATIVE_MONTHLY,
    },
    {
      suffix: "'24",
      months: FY24_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY,
      connectedMonths: FY24_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY,
      activeLicensesMonths: FY24_ACTIVE_LICENSES_CUMULATIVE_MONTHLY,
    },
    {
      suffix: "'25",
      months: FY25_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY,
      connectedMonths: FY25_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY,
      activeLicensesMonths: FY25_ACTIVE_LICENSES_CUMULATIVE_MONTHLY,
    },
  ]
  for (const { suffix, months, connectedMonths, activeLicensesMonths } of segments) {
    for (let q = 0; q < 4; q++) {
      const monthIdx = FY_FISCAL_QUARTER_END_MONTH_INDEX[q]
      if (monthIdx >= months.length) {
        if (q === 3) {
          const lastAvail = months.length - 1
          const hasPartialQ4 = lastAvail > q3MonthIdx && lastAvail < q4MonthIdx
          if (hasPartialQ4) {
            const mi = lastAvail
            const conn =
              connectedMonths && mi < connectedMonths.length ? connectedMonths[mi] : null
            const act =
              activeLicensesMonths && mi < activeLicensesMonths.length ? activeLicensesMonths[mi] : null
            const throughLabel =
              suffix === "'25" && FY25_THERMOSTAT_MONTHLY_DATA[mi]?.month
                ? FY25_THERMOSTAT_MONTHLY_DATA[mi].month
                : null
            rows.push({
              period: `Q4 ${suffix}`,
              cumulative: months[mi],
              connectedCumulative: conn,
              activeLicensesCumulative: act,
              q4PartialNote: throughLabel
                ? `Cumulative through ${throughLabel} (partial Q4; Mar pending)`
                : 'Partial Q4 (Mar quarter-end pending)',
            })
          } else {
            rows.push({
              period: `Q4 ${suffix}`,
              cumulative: null,
              connectedCumulative: null,
              activeLicensesCumulative: null,
            })
          }
        }
        continue
      }
      const connectedCumulative =
        connectedMonths && monthIdx < connectedMonths.length ? connectedMonths[monthIdx] : null
      const activeLicensesCumulative =
        activeLicensesMonths && monthIdx < activeLicensesMonths.length ? activeLicensesMonths[monthIdx] : null
      rows.push({
        period: `Q${q + 1} ${suffix}`,
        cumulative: months[monthIdx],
        connectedCumulative,
        activeLicensesCumulative,
      })
    }
  }
  const q4Fy25 = rows.find((r) => r.period === "Q4 '25")
  if (q4Fy25) {
    q4Fy25.skyportHomeUsers = SKYPORTHOME_ALL_TIME_VALUE
  }
  return rows
})()

/** Tooltip / legend copy for SkyportHome users point (~317K). */
const SKYPORTHOME_ALL_TIME_ACCOUNTS_CALLOUT = 'SkyportHome Accounts: ~317K'
/** Inline label on the all-time chart: value line, then product name below. */
const SKYPORTHOME_ALL_TIME_POINT_LABEL_VALUE = '~317K'
const SKYPORTHOME_ALL_TIME_POINT_LABEL_NAME = 'SkyportHome'

/** Last index in All-Time series that has any series data (excludes trailing Q4 row when all null). */
const ALL_TIME_RIGHT_QUARTERLY_SPAN_LAST_DATA_INDEX = (() => {
  const rows = ALL_TIME_RIGHT_QUARTERLY_SPAN
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i]
    if (r.cumulative != null || r.connectedCumulative != null || r.activeLicensesCumulative != null) {
      return i
    }
  }
  return Math.max(0, rows.length - 1)
})()

/** FY monthly series for thermostat chart (left). */
const THERMOSTAT_SALES_CHART_DATA = {
  FY25: FY25_THERMOSTAT_MONTHLY_DATA,
  FY24: FY24_THERMOSTAT_MONTHLY_DATA,
  FY23: FY23_THERMOSTAT_MONTHLY_DATA,
}

const THERMOSTAT_FY_TABS = [
  { id: 'FY23', label: 'FY23' },
  { id: 'FY24', label: 'FY24' },
  { id: 'FY25', label: 'FY25' },
]

/** Installed base funnel table: Active License Penetration FY columns (presentation). */
const FUNNEL_ACTIVE_LICENSE_PENETRATION_FY_DISPLAY = {
  FY25: { pct: '6%', absParen: '(4,600)' },
  FY24: { pct: '6%', absParen: '(5,700)' },
  FY23: { pct: '4%', absParen: '(1,700)' },
}

/** Installed base funnel table: Paid Annual License Penetration FY columns (presentation). */
const FUNNEL_PAID_ANNUAL_PENETRATION_FY_DISPLAY = {
  FY25: '0.4%',
  FY24: '0.3%',
  FY23: '0.1%',
}

/** Installed base funnel table: Paid Lifetime License Penetration FY columns (presentation). */
const FUNNEL_PAID_LIFETIME_PENETRATION_FY_DISPLAY = {
  FY25: '4.6%',
  FY24: '2.6%',
  FY23: '3.4%',
}

/** Active license counts by type (FY columns + all‑time), under “Active Licenses” breakdown. */
const FUNNEL_ACTIVE_LICENSE_TYPE_BREAKDOWN = {
  bundled: { FY23: 1157, FY24: 4780, FY25: 3608, allTime: 9545 },
  oneYear: { FY23: 69, FY24: 214, FY25: 35, allTime: 318 },
  lifetime: { FY23: 449, FY24: 655, FY25: 992, allTime: 3320 },
}

const CONNECTED_CUMULATIVE_BY_FY = {
  FY23: FY23_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY,
  FY24: FY24_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY,
  FY25: FY25_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY,
}

const ACTIVE_LICENSES_CUMULATIVE_BY_FY = {
  FY23: FY23_ACTIVE_LICENSES_CUMULATIVE_MONTHLY,
  FY24: FY24_ACTIVE_LICENSES_CUMULATIVE_MONTHLY,
  FY25: FY25_ACTIVE_LICENSES_CUMULATIVE_MONTHLY,
}

/** Sum of in‑FY thermostat units sold (monthly `sold`), same basis as the left chart. */
function sumThermostatsSoldInFy(fyId) {
  const rows = THERMOSTAT_SALES_CHART_DATA[fyId]
  if (!rows?.length) return 0
  return rows.reduce((acc, r) => acc + (Number(r.sold) || 0), 0)
}

/** Latest all‑time cumulative snapshot (through last month in FY25 partial data). */
function getAllTimeFunnelSnapshot() {
  const tArr = FY25_TOTAL_THERMOSTAT_SALES_CUMULATIVE_MONTHLY
  const cArr = FY25_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY
  const aArr = FY25_ACTIVE_LICENSES_CUMULATIVE_MONTHLY
  const i = tArr.length - 1
  const total = tArr[i] ?? 0
  const connected = cArr[Math.min(i, cArr.length - 1)] ?? 0
  const active = aArr[Math.min(i, aArr.length - 1)] ?? 0
  const pctConnected = total > 0 ? (connected / total) * 100 : 0
  const pctActiveOfConnected = connected > 0 ? (active / connected) * 100 : 0
  return { total, connected, active, pctConnected, pctActiveOfConnected }
}

/**
 * FY funnel: in‑FY units sold; net new connected & active licenses from Apr through last reported month,
 * as % of in‑FY sold.
 */
function getFyActivationFunnelMetrics(fyId) {
  const rows = THERMOSTAT_SALES_CHART_DATA[fyId]
  const conn = CONNECTED_CUMULATIVE_BY_FY[fyId]
  const act = ACTIVE_LICENSES_CUMULATIVE_BY_FY[fyId]
  if (!rows?.length || !conn?.length || !act?.length) return null
  const lastI = rows.length - 1
  if (lastI >= conn.length || lastI >= act.length) return null
  const sold = sumThermostatsSoldInFy(fyId)
  const connectedNew = Math.max(0, (conn[lastI] ?? 0) - (conn[0] ?? 0))
  const activeNew = Math.max(0, (act[lastI] ?? 0) - (act[0] ?? 0))
  const connectedPct = sold > 0 ? (connectedNew / sold) * 100 : 0
  const activePct = sold > 0 ? (activeNew / sold) * 100 : 0
  return {
    fyId,
    sold,
    connectedNew,
    activeNew,
    connectedPct,
    activePct,
  }
}

function formatFunnelPctForDisplay(p) {
  if (!Number.isFinite(p) || p <= 0) return '0%'
  if (p >= 10) return `${Math.round(p)}%`
  const rounded = Math.round(p * 10) / 10
  return `${String(rounded).replace(/\.0$/, '')}%`
}

const ACTIVE_LICENSES_TIP =
  'This is equal to Bundled Active Licenses + 1-Year Active Licenses + Lifetime Active Licenses.'

const ACTIVE_LICENSE_PENETRATION_TIP =
  'This is the total active licenses as a % of Thermostats Connected — Active License Penetration reflects platform adoption and defines the monetizable pool.'

const PAID_ANNUAL_LICENSE_PENETRATION_TIP =
  'This is the total active paid 1-Year licenses as a % of Connected Systems.'

const PAID_LIFETIME_LICENSE_PENETRATION_TIP =
  'This is the total active paid lifetime licenses as a % of Connected Systems.'

const FORECAST_YEARLY_CHART_DATA = getDigitalPlatformsForecastYearlyChartData()
const FORECAST_CUMULATIVE_CHART_DATA = getDigitalPlatformsForecastCumulativeChartData()
const FORECAST_CUMULATIVE_CHART_LAST_INDEX = Math.max(0, FORECAST_CUMULATIVE_CHART_DATA.length - 1)
const FORECAST_FUNNEL_TABLE_COLS = getDigitalPlatformsForecastFunnelColumnsForTable()

function forecastTooltipSeriesColor(entry) {
  if (!entry?.dataKey) return '#64748b'
  if (entry.dataKey === 'fyThermostatsAllBrands') return '#0097e0'
  if (entry.dataKey === 'fyConnectedThermostats') return '#0d9488'
  if (entry.dataKey === 'fySkyportHomeUsers') return FY26_SKYPORTHOME_USERS_LINE_COLOR
  if (entry.dataKey === 'fyActiveLicensesNetNew') return '#b91c1c'
  return '#64748b'
}

/** Shared tooltip styling to match other FY25/FY26 charts. */
function BusinessModelForecastQuarterlyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const rows = payload.filter(
    (e) =>
      e != null &&
      e.type !== 'none' &&
      e.value != null &&
      !(typeof e.value === 'number' && Number.isNaN(e.value)) &&
      (e.dataKey === 'fyThermostatsAllBrands' ||
        e.dataKey === 'fyConnectedThermostats' ||
        e.dataKey === 'fySkyportHomeUsers' ||
        e.dataKey === 'fyActiveLicensesNetNew'),
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
              style={{ background: forecastTooltipSeriesColor(e) }}
              aria-hidden
            />
            <span className="fy25-recharts-tooltip-name">{e.name}</span>
            <span className="fy25-recharts-tooltip-value">{formatThermostatTooltipValue(e.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatForecastFyBarDataLabel(v) {
  if (v == null || !Number.isFinite(v)) return ''
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 10_000) return `${Math.round(v / 1000)}K`
  return `${Math.round(v)}`
}

function renderForecastLastBarValueLabel(fill, labelText) {
  return ({ x, y, width, value, index }) => {
    const lastIndex = FORECAST_YEARLY_CHART_DATA.length - 1
    if (index !== lastIndex || value == null || !Number.isFinite(value)) return null
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={fill}
      >
        {labelText}
      </text>
    )
  }
}

/** Left outlook panel: FY26–FY30 activity as grouped bars (+ FY net‑new active licenses, red). */
function BusinessModelForecastFyBarsChart() {
  return (
    <ComposedChart
      data={FORECAST_YEARLY_CHART_DATA}
      margin={{ top: 22, right: 20, left: 16, bottom: 8 }}
      {...{ overflow: 'visible' }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
      <XAxis
        dataKey="period"
        interval={0}
        height={32}
        tick={FY26_RECHARTS_FORECAST_X_TICK}
        tickMargin={6}
      />
      <YAxis
        yAxisId="left"
        orientation="left"
        width={54}
        tick={FY26_RECHARTS_QUARTERLY_AXIS_TICK}
        tickFormatter={(v) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
        }
        axisLine={{ stroke: 'var(--border, #e2e8f0)' }}
        tickLine={{ stroke: 'var(--border, #e2e8f0)' }}
      />
      <Tooltip content={<BusinessModelForecastQuarterlyTooltip />} cursor={{ fill: '#fff' }} />
      <Bar
        yAxisId="left"
        dataKey="fyThermostatsAllBrands"
        name="FY thermostats (all brands)"
        fill="rgba(0, 151, 224, 0.45)"
        radius={[3, 3, 0, 0]}
        maxBarSize={24}
      >
        <LabelList
          content={renderForecastLastBarValueLabel('#0369a1', 'Thermostats sold')}
        />
      </Bar>
      <Bar
        yAxisId="left"
        dataKey="fyConnectedThermostats"
        name="FY connected thermostats"
        fill="rgba(13, 148, 136, 0.5)"
        radius={[3, 3, 0, 0]}
        maxBarSize={24}
      >
        <LabelList
          content={renderForecastLastBarValueLabel('#0f766e', 'Connected thermostats')}
        />
      </Bar>
      <Bar
        yAxisId="left"
        dataKey="fySkyportHomeUsers"
        name="FY SkyportHome users (net new)"
        fill="rgba(124, 58, 237, 0.45)"
        radius={[3, 3, 0, 0]}
        maxBarSize={24}
      >
        <LabelList
          content={renderForecastLastBarValueLabel('#6d28d9', 'SkyportHome users')}
        />
      </Bar>
      <Bar
        yAxisId="left"
        dataKey="fyActiveLicensesNetNew"
        name="Active licenses (FY net new)"
        fill="rgba(220, 38, 38, 0.55)"
        radius={[3, 3, 0, 0]}
        maxBarSize={24}
      >
        <LabelList
          content={renderForecastLastBarValueLabel('#b91c1c', 'Active licenses')}
        />
      </Bar>
    </ComposedChart>
  )
}

/** Right outlook panel: FY25–FY30 fiscal year‑end cumulative lines (same shape as FY25 All‑Time chart). */
function BusinessModelForecastAllTimeCumulativeChart() {
  return (
    <LineChart
      data={FORECAST_CUMULATIVE_CHART_DATA}
      margin={{ top: 18, right: 20, left: 16, bottom: 4 }}
      {...{ overflow: 'visible' }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
      <XAxis
        dataKey="period"
        interval={0}
        height={32}
        tick={FY26_RECHARTS_FORECAST_X_TICK}
        tickMargin={6}
      />
      <YAxis
        yAxisId="left"
        orientation="left"
        width={54}
        tick={FY26_RECHARTS_QUARTERLY_AXIS_TICK}
        tickFormatter={(v) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
        }
        axisLine={{ stroke: 'var(--border, #e2e8f0)' }}
        tickLine={{ stroke: 'var(--border, #e2e8f0)' }}
      />
      <Tooltip content={AllTimeChartTooltip} cursor={{ stroke: '#cbd5e1' }} />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="cumulative"
        name="Total thermostats sold (cumulative)"
        stroke="#0097e0"
        strokeWidth={2.75}
        dot={{ r: 4, fill: '#0097e0', stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 6 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === FORECAST_CUMULATIVE_CHART_LAST_INDEX && value != null ? (
            <text x={x - 10} y={y - 4} textAnchor="end" fontSize={11} fill="#0097e0" fontWeight={600}>
              Thermostats sold
            </text>
          ) : null}
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="connectedCumulative"
        name="Connected thermostats (cumulative)"
        stroke="#0d9488"
        strokeWidth={2.5}
        dot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 6 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === FORECAST_CUMULATIVE_CHART_LAST_INDEX && value != null ? (
            <text x={x - 10} y={y - 12} textAnchor="end" fontSize={11} fill="#0f766e" fontWeight={600}>
              Connected
            </text>
          ) : null}
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="activeLicensesCumulative"
        name="Active licenses (FY-end cumulative)"
        stroke={FY26_ACTIVE_LICENSES_LINE_COLOR}
        strokeWidth={2.25}
        dot={{ r: 3.5, fill: FY26_ACTIVE_LICENSES_LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 5 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === FORECAST_CUMULATIVE_CHART_LAST_INDEX && value != null ? (
            <text x={x - 10} y={y - 14} textAnchor="end" fontSize={11} fill={FY26_ACTIVE_LICENSES_LINE_COLOR} fontWeight={500}>
              Active licenses
            </text>
          ) : null}
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="usersCumulative"
        name="SkyportHome users (FY-end cumulative)"
        stroke={FY26_SKYPORTHOME_USERS_LINE_COLOR}
        strokeWidth={2.25}
        dot={{ r: 3.5, fill: FY26_SKYPORTHOME_USERS_LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 5 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === Math.max(0, FORECAST_CUMULATIVE_CHART_LAST_INDEX - 1) && value != null ? (
            <text
              x={x + 8}
              y={y + 16}
              textAnchor="start"
              fontSize={11}
              fill={FY26_SKYPORTHOME_USERS_LINE_COLOR}
              fontWeight={600}
            >
              <tspan x={x + 8} dy={0}>
                SkyportHome
              </tspan>
              <tspan x={x + 8} dy={13}>
                users
              </tspan>
            </text>
          ) : null}
      />
    </LineChart>
  )
}

function InstalledBaseFunnelTable({ allTimeFunnel, licenseBreakdownOpen, onLicenseBreakdownOpenChange }) {
  const activeLicensesTipId = useId()
  const activeLicensePenetrationTipId = useId()
  const paidAnnualLicensePenetrationTipId = useId()
  const paidLifetimeLicensePenetrationTipId = useId()
  const fyCols = THERMOSTAT_FY_TABS.map((tab) => ({
    ...tab,
    m: getFyActivationFunnelMetrics(tab.id),
    paid: getFyPaidPenetrationOfConnected(tab.id),
  }))

  const licenseBreakdownRowIds =
    'fy25-funnel-row-active-licenses fy25-funnel-row-license-bundled fy25-funnel-row-license-1year fy25-funnel-row-license-lifetime-active fy25-funnel-row-paid-annual fy25-funnel-row-paid-lifetime'

  const licenseTypeBreakdownCells = (byFy) => (
    <>
      {fyCols.map(({ id }) => (
        <td key={id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
          {(byFy[id] ?? 0).toLocaleString('en-US')}
        </td>
      ))}
      <td className="fy25-funnel-table-num fy25-funnel-table-num--count">
        {(byFy.allTime ?? 0).toLocaleString('en-US')}
      </td>
    </>
  )

  return (
    <div className="fy25-funnel-table-scroll">
      <table className="fy25-funnel-table">
        <thead>
          <tr>
            <th scope="col" className="fy25-funnel-table-th-metric">
              Metric
            </th>
            {THERMOSTAT_FY_TABS.map((tab) => (
              <th key={tab.id} scope="col" className="fy25-funnel-table-th-data">
                {tab.label}
              </th>
            ))}
            <th scope="col" className="fy25-funnel-table-th-data">
              All‑Time
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              Thermostats sold
            </th>
            {fyCols.map(({ id, m }) => (
              <td key={id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                {m ? m.sold.toLocaleString() : '—'}
              </td>
            ))}
            <td className="fy25-funnel-table-num fy25-funnel-table-num--count">
              {allTimeFunnel.total.toLocaleString()}
            </td>
          </tr>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              Thermostats Connected
            </th>
            {fyCols.map(({ id, m }) => (
              <td key={id} className="fy25-funnel-table-num fy25-funnel-table-num--connected">
                {m ? (
                  <>
                    {m.connectedNew.toLocaleString('en-US')}{' '}
                    <span className="fy25-funnel-table-inline-paren">
                      ({formatFunnelPctForDisplay(m.connectedPct)})
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </td>
            ))}
            <td className="fy25-funnel-table-num fy25-funnel-table-num--connected">
              {allTimeFunnel.connected.toLocaleString('en-US')}{' '}
              <span className="fy25-funnel-table-inline-paren">
                ({formatFunnelPctForDisplay(allTimeFunnel.pctConnected)})
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              <span className="fy25-funnel-metric-label-wrap">
                Active License Penetration
                <span className="fy25-funnel-metric-help-wrap">
                  <button
                    type="button"
                    className="fy25-funnel-metric-help"
                    aria-label="Help: Active License Penetration"
                    aria-describedby={activeLicensePenetrationTipId}
                  >
                    ?
                  </button>
                  <span id={activeLicensePenetrationTipId} role="tooltip" className="fy25-funnel-metric-tooltip">
                    {ACTIVE_LICENSE_PENETRATION_TIP}
                  </span>
                </span>
                <button
                  type="button"
                  className="fy25-funnel-alp-expand"
                  aria-expanded={licenseBreakdownOpen}
                  aria-controls={licenseBreakdownRowIds}
                  aria-label={
                    licenseBreakdownOpen
                      ? 'Hide Active Licenses breakdown and paid license penetration rows'
                      : 'Show Active Licenses breakdown and paid license penetration rows'
                  }
                  onClick={() => onLicenseBreakdownOpenChange(!licenseBreakdownOpen)}
                >
                  {licenseBreakdownOpen ? '[-]' : '[+]'}
                </button>
              </span>
            </th>
            {fyCols.map(({ id, m }) => {
              const alpFy = FUNNEL_ACTIVE_LICENSE_PENETRATION_FY_DISPLAY[id]
              return (
                <td key={id} className="fy25-funnel-table-num">
                  {alpFy ? (
                    <span className="fy25-funnel-table-pct fy25-funnel-table-pct--emph">{alpFy.pct}</span>
                  ) : m ? (
                    <span className="fy25-funnel-table-pct fy25-funnel-table-pct--emph">
                      {formatFunnelPctForDisplay(m.activePct)}
                    </span>
                  ) : (
                    <span className="fy25-funnel-table-na">—</span>
                  )}
                </td>
              )
            })}
            <td className="fy25-funnel-table-num">
              <span className="fy25-funnel-table-pct fy25-funnel-table-pct--emph">
                {formatFunnelPctForDisplay(allTimeFunnel.pctActiveOfConnected)}
              </span>
            </td>
          </tr>
          {licenseBreakdownOpen && (
            <>
              <tr id="fy25-funnel-row-active-licenses">
                <th scope="row" className="fy25-funnel-table-rowhead">
                  <span className="fy25-funnel-metric-label-wrap">
                    Active Licenses
                    <span className="fy25-funnel-metric-help-wrap">
                      <button
                        type="button"
                        className="fy25-funnel-metric-help"
                        aria-label="Help: Active Licenses"
                        aria-describedby={activeLicensesTipId}
                      >
                        ?
                      </button>
                      <span id={activeLicensesTipId} role="tooltip" className="fy25-funnel-metric-tooltip">
                        {ACTIVE_LICENSES_TIP}
                      </span>
                    </span>
                  </span>
                </th>
                {fyCols.map(({ id, m }) => {
                  const alpFy = FUNNEL_ACTIVE_LICENSE_PENETRATION_FY_DISPLAY[id]
                  const fyCount =
                    alpFy != null ? alpFy.absParen.replace(/^\(|\)$/g, '') : m?.activeNew.toLocaleString('en-US')
                  return (
                    <td key={id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                      {fyCount ?? '—'}
                    </td>
                  )
                })}
                <td className="fy25-funnel-table-num fy25-funnel-table-num--count">
                  {allTimeFunnel.active.toLocaleString('en-US')}
                </td>
              </tr>
              <tr id="fy25-funnel-row-license-bundled">
                <th scope="row" className="fy25-funnel-table-rowhead fy25-funnel-table-rowhead--sub">
                  Bundled Active Licenses
                </th>
                {licenseTypeBreakdownCells(FUNNEL_ACTIVE_LICENSE_TYPE_BREAKDOWN.bundled)}
              </tr>
              <tr id="fy25-funnel-row-license-1year">
                <th scope="row" className="fy25-funnel-table-rowhead fy25-funnel-table-rowhead--sub">
                  1-Year Active Licenses
                </th>
                {licenseTypeBreakdownCells(FUNNEL_ACTIVE_LICENSE_TYPE_BREAKDOWN.oneYear)}
              </tr>
              <tr id="fy25-funnel-row-license-lifetime-active">
                <th scope="row" className="fy25-funnel-table-rowhead fy25-funnel-table-rowhead--sub">
                  Lifetime Active Licenses
                </th>
                {licenseTypeBreakdownCells(FUNNEL_ACTIVE_LICENSE_TYPE_BREAKDOWN.lifetime)}
              </tr>
              <tr id="fy25-funnel-row-paid-annual">
                <th scope="row" className="fy25-funnel-table-rowhead">
                  <span className="fy25-funnel-metric-label-wrap">
                    Paid Annual License Penetration
                    <span className="fy25-funnel-metric-help-wrap fy25-funnel-metric-help-wrap--tooltip-above">
                      <button
                        type="button"
                        className="fy25-funnel-metric-help"
                        aria-label="Help: Paid Annual License Penetration"
                        aria-describedby={paidAnnualLicensePenetrationTipId}
                      >
                        ?
                      </button>
                      <span
                        id={paidAnnualLicensePenetrationTipId}
                        role="tooltip"
                        className="fy25-funnel-metric-tooltip"
                      >
                        {PAID_ANNUAL_LICENSE_PENETRATION_TIP}
                      </span>
                    </span>
                  </span>
                </th>
                {fyCols.map(({ id, paid }) => {
                  const annualFyPct = FUNNEL_PAID_ANNUAL_PENETRATION_FY_DISPLAY[id]
                  return (
                    <td key={id} className="fy25-funnel-table-num fy25-funnel-table-num--paid-pct">
                      {annualFyPct != null ? (
                        <span className="fy25-funnel-table-pct">{annualFyPct}</span>
                      ) : paid ? (
                        <span className="fy25-funnel-table-pct">{formatFunnelPctForDisplay(paid.pctAnnual)}</span>
                      ) : (
                        <span className="fy25-funnel-table-na">—</span>
                      )}
                    </td>
                  )
                })}
                <td className="fy25-funnel-table-num fy25-funnel-table-num--paid-pct">
                  <span className="fy25-funnel-table-pct">
                    {formatFunnelPctForDisplay(allTimeFunnel.paidAnnualOfConnectedPct)}
                  </span>
                </td>
              </tr>
              <tr className="fy25-funnel-table-tr-last" id="fy25-funnel-row-paid-lifetime">
                <th scope="row" className="fy25-funnel-table-rowhead">
                  <span className="fy25-funnel-metric-label-wrap">
                    Paid Lifetime License Penetration
                    <span className="fy25-funnel-metric-help-wrap fy25-funnel-metric-help-wrap--tooltip-above">
                      <button
                        type="button"
                        className="fy25-funnel-metric-help"
                        aria-label="Help: Paid Lifetime License Penetration"
                        aria-describedby={paidLifetimeLicensePenetrationTipId}
                      >
                        ?
                      </button>
                      <span
                        id={paidLifetimeLicensePenetrationTipId}
                        role="tooltip"
                        className="fy25-funnel-metric-tooltip"
                      >
                        {PAID_LIFETIME_LICENSE_PENETRATION_TIP}
                      </span>
                    </span>
                  </span>
                </th>
                {fyCols.map(({ id, paid }) => {
                  const lifetimeFyPct = FUNNEL_PAID_LIFETIME_PENETRATION_FY_DISPLAY[id]
                  return (
                    <td key={id} className="fy25-funnel-table-num fy25-funnel-table-num--paid-pct">
                      {lifetimeFyPct != null ? (
                        <span className="fy25-funnel-table-pct">{lifetimeFyPct}</span>
                      ) : paid ? (
                        <span className="fy25-funnel-table-pct">{formatFunnelPctForDisplay(paid.pctLifetime)}</span>
                      ) : (
                        <span className="fy25-funnel-table-na">—</span>
                      )}
                    </td>
                  )
                })}
                <td className="fy25-funnel-table-num fy25-funnel-table-num--paid-pct">
                  <span className="fy25-funnel-table-pct">
                    {formatFunnelPctForDisplay(allTimeFunnel.paidLifetimeOfConnectedPct)}
                  </span>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Forecast funnel: FY26–FY30 columns from business model (no all‑time column; colors match FY25 funnel table). */
function InstalledBaseForecastFunnelTable({ presentExpandAll }) {
  const [licenseBreakdownOpen, setLicenseBreakdownOpen] = useState(false)
  useLayoutEffect(() => {
    if (presentExpandAll) setLicenseBreakdownOpen(true)
  }, [presentExpandAll])
  const activeLicensesTipId = useId()
  const activeLicensePenetrationTipId = useId()
  const paidAnnualLicensePenetrationTipId = useId()
  const paidLifetimeLicensePenetrationTipId = useId()

  return (
    <div className="fy25-funnel-table-scroll">
      <table className="fy25-funnel-table">
        <thead>
          <tr>
            <th scope="col" className="fy25-funnel-table-th-metric">
              Metric
            </th>
            {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
              <th key={col.id} scope="col" className="fy25-funnel-table-th-data">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              Thermostats sold
            </th>
            {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
              <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                {col.fyThermostatsSold.toLocaleString()}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              Thermostats Connected
            </th>
            {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
              <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--connected">
                {col.fyConnectedNew.toLocaleString('en-US')}{' '}
                <span className="fy25-funnel-table-inline-paren">
                  ({formatFunnelPctForDisplay(col.connectedPct)})
                </span>
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              <span className="fy25-funnel-metric-label-wrap">
                Active License Penetration
                <span className="fy25-funnel-metric-help-wrap">
                  <button
                    type="button"
                    className="fy25-funnel-metric-help"
                    aria-label="Help: Active License Penetration"
                    aria-describedby={activeLicensePenetrationTipId}
                  >
                    ?
                  </button>
                  <span id={activeLicensePenetrationTipId} role="tooltip" className="fy25-funnel-metric-tooltip">
                    {ACTIVE_LICENSE_PENETRATION_TIP}
                  </span>
                </span>
                <button
                  type="button"
                  className="fy25-funnel-alp-expand"
                  aria-expanded={licenseBreakdownOpen}
                  aria-controls="fy26-ff-funnel-row-active-licenses fy26-ff-funnel-row-license-bundled fy26-ff-funnel-row-license-1year fy26-ff-funnel-row-license-lifetime-active fy26-ff-funnel-row-paid-annual fy26-ff-funnel-row-paid-lifetime"
                  aria-label={
                    licenseBreakdownOpen
                      ? 'Hide Active Licenses breakdown and paid license penetration rows'
                      : 'Show Active Licenses breakdown and paid license penetration rows'
                  }
                  onClick={() => setLicenseBreakdownOpen((o) => !o)}
                >
                  {licenseBreakdownOpen ? '[-]' : '[+]'}
                </button>
              </span>
            </th>
            {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
              <td key={col.id} className="fy25-funnel-table-num">
                <span className="fy25-funnel-table-pct fy25-funnel-table-pct--emph">
                  {col.activeLicensePenetrationLabel}
                </span>
              </td>
            ))}
          </tr>
          {licenseBreakdownOpen && (
            <>
              <tr id="fy26-ff-funnel-row-active-licenses">
                <th scope="row" className="fy25-funnel-table-rowhead">
                  <span className="fy25-funnel-metric-label-wrap">
                    Active Licenses
                    <span className="fy25-funnel-metric-help-wrap">
                      <button
                        type="button"
                        className="fy25-funnel-metric-help"
                        aria-label="Help: Active Licenses"
                        aria-describedby={activeLicensesTipId}
                      >
                        ?
                      </button>
                      <span id={activeLicensesTipId} role="tooltip" className="fy25-funnel-metric-tooltip">
                        {ACTIVE_LICENSES_TIP}
                      </span>
                    </span>
                  </span>
                </th>
                {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
                  <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                    {col.activeLicensesEoy.toLocaleString('en-US')}
                  </td>
                ))}
              </tr>
              <tr id="fy26-ff-funnel-row-license-bundled">
                <th scope="row" className="fy25-funnel-table-rowhead fy25-funnel-table-rowhead--sub">
                  Bundled Active Licenses
                </th>
                {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
                  <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                    {col.bundledActiveLicensesEoy.toLocaleString('en-US')}
                  </td>
                ))}
              </tr>
              <tr id="fy26-ff-funnel-row-license-1year">
                <th scope="row" className="fy25-funnel-table-rowhead fy25-funnel-table-rowhead--sub">
                  1-Year Active Licenses
                </th>
                {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
                  <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                    {col.oneYearActiveLicensesEoy.toLocaleString('en-US')}
                  </td>
                ))}
              </tr>
              <tr id="fy26-ff-funnel-row-license-lifetime-active">
                <th scope="row" className="fy25-funnel-table-rowhead fy25-funnel-table-rowhead--sub">
                  Lifetime Active Licenses
                </th>
                {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
                  <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--count">
                    {col.lifetimeActiveLicensesEoy.toLocaleString('en-US')}
                  </td>
                ))}
              </tr>
              <tr id="fy26-ff-funnel-row-paid-annual">
                <th scope="row" className="fy25-funnel-table-rowhead">
                  <span className="fy25-funnel-metric-label-wrap">
                    Paid Annual License Penetration
                    <span className="fy25-funnel-metric-help-wrap fy25-funnel-metric-help-wrap--tooltip-above">
                      <button
                        type="button"
                        className="fy25-funnel-metric-help"
                        aria-label="Help: Paid Annual License Penetration"
                        aria-describedby={paidAnnualLicensePenetrationTipId}
                      >
                        ?
                      </button>
                      <span
                        id={paidAnnualLicensePenetrationTipId}
                        role="tooltip"
                        className="fy25-funnel-metric-tooltip"
                      >
                        {PAID_ANNUAL_LICENSE_PENETRATION_TIP}
                      </span>
                    </span>
                  </span>
                </th>
                {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
                  <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--paid-pct">
                    <span className="fy25-funnel-table-pct">{col.paidAnnualPenetrationLabel}</span>
                  </td>
                ))}
              </tr>
              <tr className="fy25-funnel-table-tr-last" id="fy26-ff-funnel-row-paid-lifetime">
                <th scope="row" className="fy25-funnel-table-rowhead">
                  <span className="fy25-funnel-metric-label-wrap">
                    Paid Lifetime License Penetration
                    <span className="fy25-funnel-metric-help-wrap fy25-funnel-metric-help-wrap--tooltip-above">
                      <button
                        type="button"
                        className="fy25-funnel-metric-help"
                        aria-label="Help: Paid Lifetime License Penetration"
                        aria-describedby={paidLifetimeLicensePenetrationTipId}
                      >
                        ?
                      </button>
                      <span
                        id={paidLifetimeLicensePenetrationTipId}
                        role="tooltip"
                        className="fy25-funnel-metric-tooltip"
                      >
                        {PAID_LIFETIME_LICENSE_PENETRATION_TIP}
                      </span>
                    </span>
                  </span>
                </th>
                {FORECAST_FUNNEL_TABLE_COLS.map((col) => (
                  <td key={col.id} className="fy25-funnel-table-num fy25-funnel-table-num--paid-pct">
                    <span className="fy25-funnel-table-pct">{col.paidLifetimePenetrationLabel}</span>
                  </td>
                ))}
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

function isThermostatChartPlaceholder(rows) {
  return rows.length > 0 && rows.every((r) => r.sold === 0 && r.activeLicenses === 0)
}

function thermostatChartHasLicenseSeries(rows) {
  return rows.some((r) => (r.activeLicenses ?? 0) > 0)
}

/** Mean of monthly `sold` values for FY left chart average line. */
function averageMonthlyUnitsSold(rows) {
  if (!rows?.length) return null
  const sum = rows.reduce((acc, r) => acc + (Number(r.sold) || 0), 0)
  return sum / rows.length
}

const FY26_INPAGE_HASH_IDS = [
  'fy25-review',
  'fy25-installed-base-activation-funnel',
  'skyport-home',
  'fy25-thermostat-sales-skyportcare',
  'fy25-skyporthome-experience-sentiment',
  'fy25-planned-vs-actual',
  'fy26-plan',
  'fy26-outcomes',
  'fy26-goals-business-model-tracking',
  'fy26-strategic-themes',
  'fy26-execution-plan',
  'fy26-interaction-alignment',
  'fy26-outcome-trigger-a',
  'fy26-outcome-trigger-b',
  'fy26-outcome-trigger-c',
  'fy26-outcome-trigger-d',
  'fusion30-summary',
  'fusion30-forecast-outlook',
  'fusion30-strategic-aims',
  'digital-platforms-business-model',
]

/** Full “FY26 Playbook: {section}” heading is the section switcher (single dropdown). */
function Fy26PlaybookTitleDropdown({ sectionId }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [sectionId])

  const currentLabel = FY26_TOP_NAV_TITLES[sectionId] ?? 'Playbook'
  const fullTitle = `FY26 Playbook: ${currentLabel}`

  return (
    <div className="fy26-playbook-title-dropdown fy26-section-dropdown" ref={wrapRef}>
      <h1 className="fy26-playbook-heading">
        <button
          type="button"
          className="fy26-playbook-heading-trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`${fullTitle}. Open menu to change playbook section.`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="fy26-playbook-heading-text">{fullTitle}</span>
          <span className="fy26-section-dropdown-caret" aria-hidden>
            ▾
          </span>
        </button>
      </h1>
      {open && (
        <ul className="fy26-section-dropdown-menu" role="listbox" aria-label="FY26 playbook sections">
          {FY26_NAV_ITEMS.map(({ sectionId: id, label }) => (
            <li key={id} className="fy26-section-dropdown-li" role="presentation">
              <NavLink
                to={`${FY26_BASE}/${id}`}
                className={({ isActive }) =>
                  `fy26-section-dropdown-item${isActive ? ' fy26-section-dropdown-item--active' : ''}`
                }
                role="option"
                aria-selected={sectionId === id}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Derives badge color + summary bucket from the "Actual" column (initiative status). */
function getPlannedInitiativeActualStatus(actual) {
  const s = String(actual ?? '').trim().normalize('NFC')
  if (!s || s === '—') return 'not-started'
  const lower = s.toLowerCase().replace(/\s+/g, ' ')
  // In progress first — avoids any odd regex fall-through to "completed"
  if (lower.includes('work in progress') || lower.includes('partially completed')) return 'partial'
  // Legacy copy like "October' 25" → treat as in progress, not completed
  if (
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s*['']?\s*\d{2}\b/i.test(
      s,
    )
  ) {
    return 'partial'
  }
  if (lower === 'not started' || lower.startsWith('not started')) return 'not-started'
  if (/^\s*✅?\s*completed\b/i.test(s) || /^complete[d.]?\s*$/i.test(lower)) return 'completed'
  return 'completed'
}

/** App Store & Play Store public ratings — saturated bar colors (left chart). */
const SKYPORT_PUBLIC_SENTIMENT_CHART = {
  stackedRow: {
    star1: 350,
    star2: 130,
    star3: 125,
    star4: 90,
    star5: 225,
  },
  segments: [
    { key: 'star1', star: '1★', name: '1★ Very Negative', fill: '#b91c1c' },
    { key: 'star2', star: '2★', name: '2★ Negative', fill: '#ea580c' },
    { key: 'star3', star: '3★', name: '3★ Neutral', fill: '#94a3b8' },
    { key: 'star4', star: '4★', name: '4★ Positive', fill: '#4ade80' },
    { key: 'star5', star: '5★', name: '5★ Very Positive', fill: '#14532d' },
  ],
}

/** Count cited in Public Sentiment intro (App Store & Play Store reviews with text feedback). */
const SKYPORT_PUBLIC_STORE_WRITTEN_REVIEWS_COUNT = 900

/** Labels the public sentiment bar chart for assistive tech (sibling caption in DOM). */
const SKYPORT_PUBLIC_SENTIMENT_CAPTION_ID = 'skyport-home-public-sentiment-caption'

/** Monthly license-type counts for funnel paid-penetration lookups (`getLicenseMonthlyRow`). */
const SKYPORTHOME_LICENSE_MONTHLY_ROWS = [
  { month: '2020-09', bundledActive: 0, bundledInactive: 0, lifetimeActive: 3, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2020-10', bundledActive: 0, bundledInactive: 0, lifetimeActive: 37, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2020-11', bundledActive: 0, bundledInactive: 0, lifetimeActive: 226, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2020-12', bundledActive: 0, bundledInactive: 0, lifetimeActive: 333, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-01', bundledActive: 0, bundledInactive: 0, lifetimeActive: 440, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-02', bundledActive: 0, bundledInactive: 0, lifetimeActive: 532, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-03', bundledActive: 0, bundledInactive: 0, lifetimeActive: 619, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-04', bundledActive: 0, bundledInactive: 0, lifetimeActive: 683, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-05', bundledActive: 0, bundledInactive: 0, lifetimeActive: 798, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-06', bundledActive: 0, bundledInactive: 0, lifetimeActive: 867, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-07', bundledActive: 0, bundledInactive: 0, lifetimeActive: 906, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-08', bundledActive: 0, bundledInactive: 0, lifetimeActive: 915, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-09', bundledActive: 0, bundledInactive: 0, lifetimeActive: 961, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-10', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1020, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-11', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1072, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2021-12', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1121, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-01', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1135, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-02', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1185, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-03', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1224, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-04', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1239, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-05', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1268, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-06', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1336, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-07', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1384, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-08', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1392, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-09', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1399, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-10', bundledActive: 0, bundledInactive: 0, lifetimeActive: 1433, oneYearActive: 0, oneYearInactive: 0 },
  { month: '2022-11', bundledActive: 199, bundledInactive: 0, lifetimeActive: 1423, oneYearActive: 9, oneYearInactive: 0 },
  { month: '2022-12', bundledActive: 396, bundledInactive: 0, lifetimeActive: 1444, oneYearActive: 19, oneYearInactive: 0 },
  { month: '2023-01', bundledActive: 611, bundledInactive: 0, lifetimeActive: 1481, oneYearActive: 29, oneYearInactive: 0 },
  { month: '2023-02', bundledActive: 862, bundledInactive: 0, lifetimeActive: 1578, oneYearActive: 42, oneYearInactive: 0 },
  { month: '2023-03', bundledActive: 1157, bundledInactive: 0, lifetimeActive: 1673, oneYearActive: 69, oneYearInactive: 0 },
  { month: '2023-04', bundledActive: 1530, bundledInactive: 0, lifetimeActive: 1770, oneYearActive: 88, oneYearInactive: 0 },
  { month: '2023-05', bundledActive: 1868, bundledInactive: 0, lifetimeActive: 1834, oneYearActive: 98, oneYearInactive: 0 },
  { month: '2023-06', bundledActive: 2370, bundledInactive: 0, lifetimeActive: 1884, oneYearActive: 122, oneYearInactive: 0 },
  { month: '2023-07', bundledActive: 3016, bundledInactive: 0, lifetimeActive: 1925, oneYearActive: 139, oneYearInactive: 0 },
  { month: '2023-08', bundledActive: 3544, bundledInactive: 0, lifetimeActive: 1964, oneYearActive: 205, oneYearInactive: 0 },
  { month: '2023-09', bundledActive: 3918, bundledInactive: 0, lifetimeActive: 2009, oneYearActive: 288, oneYearInactive: 0 },
  { month: '2023-10', bundledActive: 4335, bundledInactive: 0, lifetimeActive: 2065, oneYearActive: 297, oneYearInactive: 0 },
  { month: '2023-11', bundledActive: 4668, bundledInactive: 83, lifetimeActive: 2112, oneYearActive: 308, oneYearInactive: 0 },
  { month: '2023-12', bundledActive: 4983, bundledInactive: 154, lifetimeActive: 2163, oneYearActive: 306, oneYearInactive: 10 },
  { month: '2024-01', bundledActive: 5387, bundledInactive: 252, lifetimeActive: 2217, oneYearActive: 306, oneYearInactive: 19 },
  { month: '2024-02', bundledActive: 5636, bundledInactive: 416, lifetimeActive: 2274, oneYearActive: 299, oneYearInactive: 31 },
  { month: '2024-03', bundledActive: 5937, bundledInactive: 590, lifetimeActive: 2328, oneYearActive: 283, oneYearInactive: 51 },
  { month: '2024-04', bundledActive: 6139, bundledInactive: 831, lifetimeActive: 2377, oneYearActive: 268, oneYearInactive: 74 },
  { month: '2024-05', bundledActive: 6437, bundledInactive: 1120, lifetimeActive: 2413, oneYearActive: 259, oneYearInactive: 88 },
  { month: '2024-06', bundledActive: 6755, bundledInactive: 1426, lifetimeActive: 2448, oneYearActive: 256, oneYearInactive: 99 },
  { month: '2024-07', bundledActive: 7018, bundledInactive: 1946, lifetimeActive: 2501, oneYearActive: 242, oneYearInactive: 127 },
  { month: '2024-08', bundledActive: 7108, bundledInactive: 2540, lifetimeActive: 2541, oneYearActive: 239, oneYearInactive: 139 },
  { month: '2024-09', bundledActive: 7137, bundledInactive: 3009, lifetimeActive: 2567, oneYearActive: 175, oneYearInactive: 206 },
  { month: '2024-10', bundledActive: 7478, bundledInactive: 3320, lifetimeActive: 2599, oneYearActive: 101, oneYearInactive: 288 },
  { month: '2024-11', bundledActive: 7668, bundledInactive: 3719, lifetimeActive: 2658, oneYearActive: 134, oneYearInactive: 298 },
  { month: '2024-12', bundledActive: 7875, bundledInactive: 4103, lifetimeActive: 2688, oneYearActive: 138, oneYearInactive: 309 },
  { month: '2025-01', bundledActive: 7548, bundledInactive: 5140, lifetimeActive: 2710, oneYearActive: 146, oneYearInactive: 316 },
  { month: '2025-02', bundledActive: 7674, bundledInactive: 5658, lifetimeActive: 2752, oneYearActive: 158, oneYearInactive: 325 },
  { month: '2025-03', bundledActive: 7841, bundledInactive: 6071, lifetimeActive: 2782, oneYearActive: 159, oneYearInactive: 330 },
  { month: '2025-04', bundledActive: 8020, bundledInactive: 6530, lifetimeActive: 2815, oneYearActive: 164, oneYearInactive: 334 },
  { month: '2025-05', bundledActive: 8230, bundledInactive: 6990, lifetimeActive: 2856, oneYearActive: 181, oneYearInactive: 342 },
  { month: '2025-06', bundledActive: 8386, bundledInactive: 7580, lifetimeActive: 2892, oneYearActive: 196, oneYearInactive: 347 },
  { month: '2025-07', bundledActive: 8684, bundledInactive: 8187, lifetimeActive: 2932, oneYearActive: 214, oneYearInactive: 355 },
  { month: '2025-08', bundledActive: 8702, bundledInactive: 8989, lifetimeActive: 2970, oneYearActive: 221, oneYearInactive: 369 },
  { month: '2025-09', bundledActive: 8643, bundledInactive: 9659, lifetimeActive: 3005, oneYearActive: 235, oneYearInactive: 378 },
  { month: '2025-10', bundledActive: 8952, bundledInactive: 10157, lifetimeActive: 3056, oneYearActive: 246, oneYearInactive: 381 },
  { month: '2025-11', bundledActive: 9103, bundledInactive: 10823, lifetimeActive: 3093, oneYearActive: 279, oneYearInactive: 389 },
  { month: '2025-12', bundledActive: 9384, bundledInactive: 11396, lifetimeActive: 3174, oneYearActive: 257, oneYearInactive: 433 },
  { month: '2026-01', bundledActive: 9603, bundledInactive: 11998, lifetimeActive: 3222, oneYearActive: 280, oneYearInactive: 447 },
  { month: '2026-02', bundledActive: 9643, bundledInactive: 12718, lifetimeActive: 3287, oneYearActive: 302, oneYearInactive: 469 },
  { month: '2026-03', bundledActive: 9545, bundledInactive: 13367, lifetimeActive: 3320, oneYearActive: 318, oneYearInactive: 483 },
]

function getLicenseMonthlyRow(ym) {
  return SKYPORTHOME_LICENSE_MONTHLY_ROWS.find((r) => r.month === ym) ?? null
}

/** Same “latest month” basis as funnel connected snapshot (last FY25 thermostat export month). */
const FUNNEL_PAID_LICENSE_ALIGNMENT_MONTH = '2026-02'

/**
 * SkyportHome 1‑year active & lifetime active vs connected base (same denominator as Active License Penetration).
 */
function enrichAllTimeFunnelWithPaidPenetration(base) {
  const lic = getLicenseMonthlyRow(FUNNEL_PAID_LICENSE_ALIGNMENT_MONTH)
  const c = base.connected
  const lifetime = lic?.lifetimeActive ?? 0
  const annual = lic?.oneYearActive ?? 0
  return {
    ...base,
    paidAnnualOfConnectedPct: c > 0 ? (annual / c) * 100 : 0,
    paidAnnualAbs: annual,
    paidLifetimeOfConnectedPct: c > 0 ? (lifetime / c) * 100 : 0,
    paidLifetimeAbs: lifetime,
  }
}

/** Fiscal FY end (Mar) or FY25 partial (Feb&apos;26): license CSV row + cumulative connected at that point. */
const FY_PAID_PENETRATION_ENDPOINTS = {
  FY23: {
    month: '2024-03',
    connected: FY23_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY[11] ?? 0,
  },
  FY24: {
    month: '2025-03',
    connected: FY24_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY[11] ?? 0,
  },
  FY25: {
    month: '2026-02',
    connected:
      FY25_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY[
        FY25_CONNECTED_THERMOSTATS_CUMULATIVE_MONTHLY.length - 1
      ] ?? 0,
  },
}

function getFyPaidPenetrationOfConnected(fyId) {
  const ep = FY_PAID_PENETRATION_ENDPOINTS[fyId]
  if (!ep) return null
  const lic = getLicenseMonthlyRow(ep.month)
  if (!lic) return null
  const c = ep.connected
  const lifetime = lic.lifetimeActive
  const annual = lic.oneYearActive
  return {
    pctAnnual: c > 0 ? (annual / c) * 100 : 0,
    absAnnual: annual,
    pctLifetime: c > 0 ? (lifetime / c) * 100 : 0,
    absLifetime: lifetime,
  }
}

/** Default axis tick typography — Y ticks match X on each FY26 playbook chart */
const FY26_RECHARTS_AXIS_TICK = {
  fontSize: 13,
  fill: '#666',
  fontWeight: 400,
}

/** Horizontal X-axis ticks (Skyport bar charts + FY monthly chart). */
const FY26_RECHARTS_X_TICK = {
  ...FY26_RECHARTS_AXIS_TICK,
  angle: 0,
}

/** All-time quarterly chart: angled X and Y use same 12px as original X. */
const FY26_RECHARTS_QUARTERLY_AXIS_TICK = {
  fontSize: 12,
  fill: '#666',
  fontWeight: 400,
}

const FY26_RECHARTS_QUARTERLY_X_TICK = {
  ...FY26_RECHARTS_QUARTERLY_AXIS_TICK,
  angle: -28,
}

/** Outlook forecast charts (FY26–FY30 / FY25–FY30): short labels — horizontal ticks. */
const FY26_RECHARTS_FORECAST_X_TICK = {
  ...FY26_RECHARTS_QUARTERLY_AXIS_TICK,
  angle: 0,
}

/** FY monthly thermostat chart: 12 month labels — angle avoids overlap on narrow widths. */
const FY26_RECHARTS_MONTHLY_X_TICK = {
  ...FY26_RECHARTS_QUARTERLY_AXIS_TICK,
  angle: -32,
  textAnchor: 'end',
}

function SkyportPublicSentimentVerticalBars({ captionId = SKYPORT_PUBLIC_SENTIMENT_CAPTION_ID }) {
  const row = SKYPORT_PUBLIC_SENTIMENT_CHART.stackedRow
  const data = SKYPORT_PUBLIC_SENTIMENT_CHART.segments.map((s) => ({
    star: s.star,
    count: row[s.key],
    fill: s.fill,
    legend: s.name,
  }))
  return (
    <div
      className="fy25-skyport-home-chart-wrap fy25-skyport-home-chart-wrap--public-vertical"
      role="figure"
      aria-labelledby={captionId}
    >
      <div className="fy25-skyport-home-chart-inner fy25-skyport-home-chart-inner--public-vertical">
        <ResponsiveContainer width="100%" height={288}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 20, bottom: 4 }}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="star"
              interval={0}
              height={22}
              tick={FY26_RECHARTS_X_TICK}
              tickMargin={4}
            />
            <YAxis
              width={38}
              tick={FY26_RECHARTS_AXIS_TICK}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
              label={({ viewBox }) => {
                if (!viewBox || viewBox.height == null) return null
                const { x = 0, y = 0, width = 0, height = 0 } = viewBox
                const cx = x + width / 2
                const cy = y + height / 2
                return (
                  <g transform={`translate(${cx - 14}, ${cy}) rotate(-90)`}>
                    <text x={0} y={0} textAnchor="middle" fontSize={12} fill="#6b7280" fontWeight={500}>
                      Written Reviews
                    </text>
                  </g>
                )
              }}
            />
            <Tooltip
              formatter={(value) => [`~${Number(value).toLocaleString()}`, 'Reviews']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.legend ?? ''}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}>
              {data.map((d) => (
                <Cell key={d.star} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const SKYPORT_SUPPORT_HELP_SIMPLE_ROWS = [
  {
    label: 'Very Negative',
    shortLabel: 'Very neg.',
    description: 'strong frustration or failure language',
    count: 110,
    tone: 'very-negative',
  },
  {
    label: 'Negative',
    shortLabel: 'Negative',
    description: 'dissatisfaction or complaints',
    count: 470,
    tone: 'negative',
  },
  {
    label: 'Neutral',
    shortLabel: 'Neutral',
    description: 'questions, how\u2011to requests, or unclear system behavior',
    count: 3550,
    tone: 'neutral',
  },
  {
    label: 'Positive',
    shortLabel: 'Positive',
    description: 'satisfaction or appreciation',
    count: 1140,
    tone: 'positive',
  },
  {
    label: 'Very Positive',
    shortLabel: 'Very pos.',
    description: 'strong praise',
    count: 120,
    tone: 'very-positive',
  },
]

/** Light bar fills — same ramp as public (left) chart. */
const SKYPORT_SUPPORT_HELP_TONE_FILL = {
  'very-negative': '#fecaca',
  negative: '#fed7aa',
  neutral: '#e2e8f0',
  positive: '#bbf7d0',
  'very-positive': '#a7f3d0',
}

/** Count cited in Observed Sentiment intro (support & app‑help feedback entries). */
const SKYPORT_SUPPORT_HELP_DATASET_ENTRY_COUNT = 5400

/** Labels the support & help sentiment bar chart for assistive tech. */
const SKYPORT_SUPPORT_SENTIMENT_CAPTION_ID = 'skyport-home-support-sentiment-caption'

function SkyportSupportHelpSentimentVerticalBars({ captionId = SKYPORT_SUPPORT_SENTIMENT_CAPTION_ID }) {
  const data = SKYPORT_SUPPORT_HELP_SIMPLE_ROWS.map((row) => ({
    shortLabel: row.shortLabel,
    count: row.count,
    fill: SKYPORT_SUPPORT_HELP_TONE_FILL[row.tone],
    legend: `${row.label} (${row.description})`,
  }))
  return (
    <div
      className="fy25-skyport-home-chart-wrap fy25-skyport-home-chart-wrap--support-vertical"
      role="figure"
      aria-labelledby={captionId}
    >
      <div className="fy25-skyport-home-chart-inner fy25-skyport-home-chart-inner--support-vertical">
        <ResponsiveContainer width="100%" height={288}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 22, bottom: 4 }}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="shortLabel"
              interval={0}
              height={22}
              tick={FY26_RECHARTS_X_TICK}
              tickMargin={4}
            />
            <YAxis
              width={38}
              tick={FY26_RECHARTS_AXIS_TICK}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
              label={({ viewBox }) => {
                if (!viewBox || viewBox.height == null) return null
                const { x = 0, y = 0, width = 0, height = 0 } = viewBox
                const cx = x + width / 2
                const cy = y + height / 2
                return (
                  <g transform={`translate(${cx - 16}, ${cy}) rotate(-90)`}>
                    <text x={0} y={0} textAnchor="middle" fontSize={11} fill="#6b7280" fontWeight={500}>
                      <tspan x={0} dy={-11}>
                        Support Feedback
                      </tspan>
                      <tspan x={0} dy={15}>
                        Entries
                      </tspan>
                    </text>
                  </g>
                )
              }}
            />
            <Tooltip
              formatter={(value) => [`~${Number(value).toLocaleString()}`, 'Entries']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.legend ?? ''}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}>
              {data.map((d) => (
                <Cell key={d.shortLabel} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SkyportSupportHelpFeedbackSimple({ className = '' }) {
  return (
    <div className={`fy25-skyport-home-subblock fy25-skyport-home-support-block ${className}`.trim()}>
      <p id={SKYPORT_SUPPORT_SENTIMENT_CAPTION_ID} className="fy25-skyport-home-support-combined-intro">
        <strong>Observed Sentiment (Support Feedback):</strong>{' '}
        Based on ~{SKYPORT_SUPPORT_HELP_DATASET_ENTRY_COUNT.toLocaleString()} support and app{'\u2011'}help feedback
        entries.
      </p>
      <SkyportSupportHelpSentimentVerticalBars />
    </div>
  )
}

/** @param {{ pairs: Array<[string, 'd' | 'p' | 'r']> }} props */
function SkyportHomeReviewIssueSpans({ pairs }) {
  return pairs.map(([text, tone], i) => {
    const cls =
      tone === 'p'
        ? 'fy25-sh-issue-partial'
        : tone === 'r'
          ? 'fy25-sh-issue-resolved'
          : 'fy25-sh-issue-default'
    return (
      <span key={i} className={cls}>
        {text}
      </span>
    )
  })
}

const SKYPORTHOME_STORE_REVIEWS_ROWS = [
  {
    category: 'Wi‑Fi / Cloud Issues',
    segments: [
      ['Offline devices, cloud not connecting, ', 'd'],
      ['frequent disconnect cycles', 'p'],
      ['; cloud handshake failures; ', 'd'],
      [
        'devices appear offline in app even when Wi‑Fi connected; 6‑digit pairing code not showing',
        'p',
      ],
    ],
    frequency: 'Very High',
    impact: 'Critical',
    action:
      'Strengthen connectivity engine; implement robust auto‑recover logic; improve cloud handshake diagnostics',
    complaints: 1406,
  },
  {
    category: 'Login / Account',
    segments: [
      [
        'Users unable to log in; password reset failures; app/thermostat account mismatch',
        'r',
      ],
      ['; cannot add secondary users', 'd'],
    ],
    frequency: 'High',
    impact: 'High',
    action:
      'Modernize identity system; improve recovery flows; add multi‑user onboarding; unify app and device account logic',
    complaints: 855,
  },
  {
    category: 'App UX / Reliability',
    segments: [
      ['Energy usage not loading; ', 'd'],
      ['app freezes', 'p'],
      ['; confusion on the right Skyport app', 'd'],
    ],
    frequency: 'High',
    impact: 'High',
    action:
      'Strengthen app QA; improve device discovery; provide clearer migration steps; improve update reliability',
    complaints: 633,
  },
  {
    category: 'Geofencing / Away Logic',
    segments: [
      [
        'Away triggers when any single person leaves; geofence fails to detect return; app requires being open to work; OS background permissions issues',
        'p',
      ],
    ],
    frequency: 'Medium',
    impact: 'High',
    action:
      'Implement household‑aware presence (“anyone home” logic); add background permission diagnostics; improve geofence stability',
    complaints: 169,
  },
  {
    category: 'Scheduling / Controls',
    segments: [
      ['Can’t add schedule events; ', 'p'],
      ['setpoint ranges confusing; overrides cancel schedules', 'p'],
      ['; time zone inconsistencies', 'd'],
    ],
    frequency: 'Medium',
    impact: 'Medium',
    action:
      'Redesign scheduling UX; add single‑setpoint option; fix override logic; normalize time zone behavior',
    complaints: 259,
  },
]

const SKYPORTHOME_UX_ENGAGEMENT_ROWS = [
  {
    category: 'Feature Gaps Impacting Core UX',
    issues:
      'Limited energy report functionality, no humidity granularity; limited fan control (“run fan for X minutes”); missing advanced schedules; weak smart‑home integrations (HomeKit, improved Google/Alexa)',
    frequency: 'High',
    impact: 'High',
    action:
      'Build feature parity with leading thermostats (Nest/Ecobee); introduce usage analytics; add remote sensors; enhance ecosystem integrations; expand scheduling modes',
  },
  {
    category: 'Thermostat Interaction & Interface Friction',
    issues:
      'Hard‑to‑use hardware UI; slow or unresponsive touch; wheel control inconsistent; thermostat and app UI mismatch; inaccurate temperature readings hurt trust',
    frequency: 'Medium',
    impact: 'High',
    action:
      'Improve hardware responsiveness; unify thermostat + app UI logic; add calibration tools; simplify on‑device controls',
  },
  {
    category: 'Setup & Onboarding Pain Points',
    issues:
      'Difficult pairing; repeated code failures; geofence setup unclear; address validation problems; frequent need to re‑enter credentials; initial setup not intuitive',
    frequency: 'High',
    impact: 'High',
    action:
      'Redesign onboarding flow; simplify pairing; add auto‑verification; improve error messaging; stabilize initial Wi‑Fi and account setup',
  },
  {
    category: 'Navigation & Transparency Issues',
    issues:
      'Too many steps for simple actions; back button behavior inconsistent; schedule timeline removed; app does not show system status (aux heat, compressor level, runtime, current mode)',
    frequency: 'Medium',
    impact: 'High',
    action:
      'Simplify navigation; reintroduce schedule timeline; surface real‑time HVAC insights; improve dashboard clarity',
  },
  {
    category: 'Household & Multi‑User Experience Gaps',
    issues:
      'Must share same login; no secondary profiles; geofence only tied to one device; away mode misfires when one user leaves; no user‑level permissions',
    frequency: 'Medium',
    impact: 'High',
    action:
      'Implement true multi‑user support; household‑aware geofencing; individual user settings; better presence logic',
  },
  {
    category: 'Localization & Regional Support Issues',
    issues:
      'Celsius/Fahrenheit mismatches; location or address bugs; app not aligned with international regions; inconsistent outdoor/indoor reporting',
    frequency: 'Low–Medium',
    impact: 'Medium',
    action:
      'Expand localization capabilities; fix ZIP/address validation; ensure metric/imperial consistency; improve region detection',
  },
]

function SkyportHomeReviewTablesBlock() {
  return (
    <div className="fy25-skyport-home-review-tables" aria-label="SkyportHome store review and UX themes">
      <p className="fy25-skyport-home-review-tables-legend" role="note">
        <span className="fy25-sh-legend-label">Key issues</span>
        <span className="fy25-sh-legend-item">
          <span className="fy25-sh-issue-partial fy25-sh-legend-swatch" aria-hidden>
            ●
          </span>{' '}
          Partially resolved
        </span>
        <span className="fy25-sh-legend-item">
          <span className="fy25-sh-issue-resolved fy25-sh-legend-swatch" aria-hidden>
            ●
          </span>{' '}
          Resolved
        </span>
        <span className="fy25-sh-legend-item">
          <span className="fy25-sh-issue-default fy25-sh-legend-swatch" aria-hidden>
            ●
          </span>{' '}
          Not resolved
        </span>
      </p>
      <div className="fy25-skyport-home-review-tables-grid">
        <div className="fy25-sh-table-panel">
          <h5 className="fy25-sh-table-title">App Store and Play&nbsp;Store Reviews</h5>
          <div className="fy25-sh-table-scroll">
            <table className="fy25-sh-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Key issues / requests</th>
                  <th scope="col">Frequency</th>
                  <th scope="col">Impact</th>
                  <th scope="col">Recommended action</th>
                  <th scope="col" className="fy25-sh-table-col-num">
                    # complaints
                  </th>
                </tr>
              </thead>
              <tbody>
                {SKYPORTHOME_STORE_REVIEWS_ROWS.map((row) => (
                  <tr key={row.category}>
                    <th scope="row">{row.category}</th>
                    <td>
                      <SkyportHomeReviewIssueSpans pairs={row.segments} />
                    </td>
                    <td className="fy25-sh-table-metric">{row.frequency}</td>
                    <td className="fy25-sh-table-metric">{row.impact}</td>
                    <td>{row.action}</td>
                    <td className="fy25-sh-table-num">{row.complaints.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="fy25-sh-table-panel">
          <h5 className="fy25-sh-table-title">
            App Store and Play&nbsp;Store: UX &amp; Engagement Feedback
          </h5>
          <div className="fy25-sh-table-scroll">
            <table className="fy25-sh-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Key issues / requests</th>
                  <th scope="col">Frequency</th>
                  <th scope="col">Impact</th>
                  <th scope="col">Recommended action</th>
                </tr>
              </thead>
              <tbody>
                {SKYPORTHOME_UX_ENGAGEMENT_ROWS.map((row) => (
                  <tr key={row.category}>
                    <th scope="row">{row.category}</th>
                    <td>{row.issues}</td>
                    <td className="fy25-sh-table-metric">{row.frequency}</td>
                    <td className="fy25-sh-table-metric">{row.impact}</td>
                    <td>{row.action}</td>
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

function SkyportHomeUserFeedbackCard({ presentExpandAll }) {
  const [showFeedbackBreakdown, setShowFeedbackBreakdown] = useState(false)
  useLayoutEffect(() => {
    if (presentExpandAll) setShowFeedbackBreakdown(true)
  }, [presentExpandAll])
  const expandBtnId = 'skyport-home-feedback-expand-btn'
  const expandPanelId = 'skyport-home-feedback-expand-panel'

  return (
    <div className="fy25-skyport-home-card">
      <div className="fy25-skyport-home-card-header">
        <h4 className="fy25-skyport-home-title" id="fy25-skyporthome-experience-sentiment">
          SkyportHome Experience Quality &amp; Sentiment
        </h4>
        <button
          type="button"
          className="fy25-skyport-home-feedback-details-link"
          id={expandBtnId}
          aria-expanded={showFeedbackBreakdown}
          aria-controls={expandPanelId}
          onClick={() => setShowFeedbackBreakdown((v) => !v)}
        >
          {showFeedbackBreakdown ? 'Collapse details' : 'View details'}
        </button>
      </div>

      {showFeedbackBreakdown && (
        <div
          id={expandPanelId}
          className="fy25-skyport-home-expand-panel fy25-skyport-home-expand-panel--combined"
          role="region"
          aria-labelledby={expandBtnId}
        >
          <div className="fy25-skyport-home-feedback-split">
            <div className="fy25-skyport-home-feedback-split-col fy25-skyport-home-feedback-split-col--store">
              <div className="fy25-skyport-home-subblock fy25-skyport-home-subblock--store-split">
                <p id={SKYPORT_PUBLIC_SENTIMENT_CAPTION_ID} className="fy25-skyport-home-store-combined-intro">
                  <strong>Public Sentiment (Written Reviews):</strong>{' '}
                  Based on ~{SKYPORT_PUBLIC_STORE_WRITTEN_REVIEWS_COUNT.toLocaleString()} App Store and Play Store reviews
                  with text feedback.
                </p>
                <SkyportPublicSentimentVerticalBars />
              </div>
            </div>
            <div className="fy25-skyport-home-feedback-split-col fy25-skyport-home-feedback-split-col--help">
              <SkyportSupportHelpFeedbackSimple className="fy25-skyport-home-support-block--split-col" />
            </div>
          </div>
          <SkyportHomeReviewTablesBlock />
        </div>
      )}

      <div className="fy25-takeaway fy25-takeaway--skyport-after-charts">
        <p className="fy25-takeaway-paragraph">
          <strong className="fy25-takeaway-inline-label">Takeaway:</strong>{' '}
          Negative and unresolved experiences outweigh
          positive ones, revealing a persistent digital experience gap.
        </p>
      </div>
    </div>
  )
}

/** Feature detail template: num, title, description, targetDate, actual (status) */
const FY25_PLANNED_VS_ACTUAL_FEATURES = [
  {
    num: 1,
    title: 'Brand unification (FY24 Carryover)',
    description: 'Move from dedicated dealer and homeowner solutions tied to product brands to a DNA branded solution for dealers and homeowners.',
    targetDate: "June '25",
    actual: 'Completed',
  },
  {
    num: 2,
    title: 'Altherma Product Launch and CS Support',
    description: 'Expand Cloud Services to support Altherma providing tools to improve install, diagnostics and trouble shooting. Enhance the homeowner experience with the installing dealer, and elevate the Daikin experience for the homeowner.',
    targetDate: "September '25",
    actual: 'Not Started',
  },
  {
    num: 3,
    title: 'Private Label support',
    description: 'Support FIT sales goals by providing a path for very large partners (i.e. Johnstone, WATSCO, etc.) to private label FIT & the homeowner app experience to their brand. Aligns goals of large partners with DNA goals and enabling sales recovery.',
    targetDate: "December '25",
    actual: 'Not Started',
  },
  {
    num: 4,
    title: 'Cloud Connected 24V Lead Generation (FY24 Carryover)',
    description: 'Implement cloud-based algorithms to identify replacement ops. Alerts communicated to dealers and homeowners based on inefficient run, and end of life algorithm. Daikin dealers utilize leads to identify FIT replacement sales opportunities.',
    targetDate: "November '26",
    actual: 'Work in progress',
  },
  {
    num: 5,
    title: 'Demand Response Ready',
    description: 'Support pilot program work in the "Smart" (Partial load) demand response space. Showcase superior performance of Daikin Inverter systems to achieve grid shedding while maintaining desired comfort of homeowners participating in pilot programs. Utilize cloud data to inform product teams of system performance during curtailment events.',
    targetDate: "May '25",
    actual: 'Work in progress',
  },
  {
    num: 6,
    title: 'Enhanced Energy Reports 2.0 (FY Carryover)',
    description: 'Transition our monthly report from email only to the homeowner app. Gamifying engagement to drive consumer understanding of Inverter technology, and spur ongoing engagement with Daikin brand.',
    targetDate: "February '26",
    actual: 'Not Started',
  },
  {
    num: 7,
    title: 'Quality Install Enhancements (FY24 Carryover)',
    description: 'Enhance the Quality Install process based on VOC from internal stakeholders and dealer council. Focus on reducing installation time, aligning with existing dealer processes, and ensuring reporting captures key data requirements for utility and rebate programs.',
    targetDate: "March '26",
    actual: 'Not Started',
  },
  {
    num: 8,
    title: 'Maintenance report',
    description: "Launch report utilizing cloud data to support dealers' routine maintenance visits. Report will enhance existing processes utilizing data available in Daikin Cloud.",
    targetDate: "March '26",
    actual: 'Not Started',
  },
  {
    num: 9,
    title: 'Support for proprietary zoning products',
    description: 'Streamline the installation and configuration of Daikin proprietary zoning solution with set-up support via mobile app. Cloud Services Quality Install will enable dealers to quickly view, set, and test all zone board and dampers within a zoned system, while also validating airflow, charge, and system configuration.',
    targetDate: "December '25",
    actual: 'Work in progress',
  },
  {
    num: 10,
    title: 'Automatic Warranty Registration for E-Prem products (FY24 Carryover)',
    description: 'Value-add to the Cloud Services offering, by automatically registering E-Premium products warranty when homeowners activate Cloud Services. Increases dealer value by decreasing the manual processes and data entry required, while ensuring homeowners who purchase E-premium products get a high-end experience.',
    targetDate: "March '26",
    actual: 'Not Started',
  },
]

function formatThermostatTooltipValue(v) {
  if (v == null || (typeof v === 'number' && Number.isNaN(v))) return '—'
  return typeof v === 'number' ? v.toLocaleString() : String(v)
}

/** Swatch + label tint (Recharts often omits `payload.color` for <Bar />). */
const TOOLTIP_THERMOSTATS_SOLD_SWATCH = '#0097e0'

function monthlyTooltipSeriesColor(entry) {
  if (entry?.color) return entry.color
  return entry?.dataKey === 'sold' ? TOOLTIP_THERMOSTATS_SOLD_SWATCH : FY26_ACTIVE_LICENSES_LINE_COLOR
}

function allTimeTooltipSeriesColor(entry) {
  if (entry?.color) return entry.color
  if (entry?.dataKey === 'cumulative') return '#0097e0'
  if (entry?.dataKey === 'connectedCumulative') return '#0d9488'
  if (entry?.dataKey === 'activeLicensesCumulative') return FY26_ACTIVE_LICENSES_LINE_COLOR
  if (entry?.dataKey === 'skyportHomeUsers') return FY26_SKYPORTHOME_USERS_LINE_COLOR
  return '#64748b'
}

/** Custom tooltip — box: colored square per series, all copy in black. */
function FyMonthlyChartTooltip({ active, payload, label }) {
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
              style={{ background: monthlyTooltipSeriesColor(e) }}
              aria-hidden
            />
            <span className="fy25-recharts-tooltip-name">{e.name}</span>
            <span className="fy25-recharts-tooltip-value">{formatThermostatTooltipValue(e.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AllTimeChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row0 = payload[0]?.payload
  let header = label
  if (label != null && label !== '') {
    if (row0?.q4PartialNote) header = `${label} — ${row0.q4PartialNote}`
    else if (row0?.skyportHomeUsers != null) header = SKYPORTHOME_ALL_TIME_ACCOUNTS_CALLOUT
    else if (String(label).match(/^FY\d{2}/)) header = `${label} — fiscal year-end`
    else header = String(label).match(/^Q\d/) ? `${label} — quarter-end` : String(label)
  }
  const rows = payload.filter(
    (e) =>
      e != null &&
      e.type !== 'none' &&
      e.value != null &&
      !(typeof e.value === 'number' && Number.isNaN(e.value)),
  )
  return (
    <div className="fy25-recharts-tooltip">
      {header != null && header !== '' && <div className="fy25-recharts-tooltip-label">{header}</div>}
      <ul className="fy25-recharts-tooltip-list">
        {rows.map((e, i) => (
          <li key={`${e.dataKey}-${i}`} className="fy25-recharts-tooltip-item">
            <span
              className="fy25-recharts-tooltip-swatch"
              style={{ background: allTimeTooltipSeriesColor(e) }}
              aria-hidden
            />
            <span className="fy25-recharts-tooltip-name">{e.name}</span>
            <span className="fy25-recharts-tooltip-value">{formatThermostatTooltipValue(e.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Left: monthly units sold (bars) + active licenses (line) + average sold (horizontal ref line). */
function ThermostatFyMonthlyChart({ fyId }) {
  const fyRows = THERMOSTAT_SALES_CHART_DATA[fyId]
  const avgSold = averageMonthlyUnitsSold(fyRows)
  return (
    <ComposedChart
      data={fyRows}
      margin={{
        top: 8,
        right: 20,
        left: 16,
        bottom: 28,
      }}
      {...{ overflow: 'visible' }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
      <XAxis
        dataKey="month"
        interval={0}
        height={52}
        tick={FY26_RECHARTS_MONTHLY_X_TICK}
        tickMargin={6}
      />
      <YAxis
        yAxisId="left"
        orientation="left"
        width={54}
        tick={FY26_RECHARTS_AXIS_TICK}
        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
      />
      <Tooltip content={FyMonthlyChartTooltip} cursor={{ fill: '#fff' }} />
      <Bar
        yAxisId="left"
        dataKey="sold"
        name="Thermostats sold"
        fill="rgba(0, 151, 224, 0.38)"
        radius={[4, 4, 0, 0]}
        label={({ x, y, width, value, index }) => {
          if (fyId !== 'FY25') return null
          const lastIndex = fyRows.length - 1
          if (index !== lastIndex || value == null || !Number.isFinite(value) || x == null || width == null || y == null) {
            return null
          }
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
      {thermostatChartHasLicenseSeries(fyRows) && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="activeLicenses"
          name="Active licenses"
          stroke={FY26_ACTIVE_LICENSES_LINE_COLOR}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          label={({ index, x, y }) =>
            index === fyRows.length - 1 ? (
              <text x={x} y={y - 20} textAnchor="middle" fontSize={12} fill={FY26_ACTIVE_LICENSES_LINE_COLOR} fontWeight={500}>
                Active licenses
              </text>
            ) : null}
        />
      )}
    </ComposedChart>
  )
}

/**
 * Purple dot + label halfway between FY25 Q3 and Q4 band centers (x-axis labels unchanged).
 * Hooks require chart context — render only inside LineChart.
 */
function AllTimeSkyportHomeBetweenQ3Q4Overlay() {
  const xScale = useXAxisScale(0)
  const yScale = useYAxisScale('left')
  if (!xScale || !yScale) return null
  const xQ3 = xScale("Q3 '25", { position: 'middle' })
  const xQ4 = xScale("Q4 '25", { position: 'middle' })
  if (xQ3 == null || xQ4 == null) return null
  const cx = (xQ3 + xQ4) / 2 + 10
  const cy = yScale(SKYPORTHOME_ALL_TIME_VALUE)
  if (cy == null || Number.isNaN(cx) || Number.isNaN(cy)) return null
  const r = 4.5
  return (
    <g pointerEvents="none" aria-hidden className="fy25-alltime-skyport-overlay">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={FY26_SKYPORTHOME_USERS_LINE_COLOR}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x={cx + 6}
        y={cy + 14}
        textAnchor="end"
        dominantBaseline="hanging"
        fontSize={11}
        fill={FY26_SKYPORTHOME_USERS_LINE_COLOR}
        fontWeight={600}
      >
        <tspan x={cx + 6} dy={0}>
          {SKYPORTHOME_ALL_TIME_POINT_LABEL_VALUE}
        </tspan>
        <tspan x={cx + 6} dy={13}>
          {SKYPORTHOME_ALL_TIME_POINT_LABEL_NAME}
        </tspan>
      </text>
    </g>
  )
}

/** Right All-Time: all three series on one left Y scale (counts). */
function ThermostatRightAllTimeQuarterlyChart() {
  return (
    <LineChart
      data={ALL_TIME_RIGHT_QUARTERLY_SPAN}
      margin={{ top: 22, right: 20, left: 16, bottom: 4 }}
      {...{ overflow: 'visible' }}
    >
      <CartesianGrid yAxisId="left" strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
      <XAxis
        dataKey="period"
        interval={0}
        height={30}
        tick={FY26_RECHARTS_QUARTERLY_X_TICK}
        tickMargin={2}
        textAnchor="end"
      />
      <YAxis
        yAxisId="left"
        orientation="left"
        width={54}
        tick={FY26_RECHARTS_QUARTERLY_AXIS_TICK}
        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
      />
      <Tooltip content={AllTimeChartTooltip} cursor={{ stroke: '#cbd5e1' }} />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="cumulative"
        name="Total thermostats sold (cumulative)"
        stroke="#0097e0"
        strokeWidth={2.75}
        dot={{ r: 4, fill: '#0097e0', stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 6 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === ALL_TIME_RIGHT_QUARTERLY_SPAN_LAST_DATA_INDEX && value != null ? (
            <text x={x - 10} y={y - 12} textAnchor="end" fontSize={11} fill="#0097e0" fontWeight={600}>
              Thermostats sold
            </text>
          ) : null}
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="connectedCumulative"
        name="Connected thermostats (cumulative)"
        stroke="#0d9488"
        strokeWidth={2.5}
        dot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 6 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === ALL_TIME_RIGHT_QUARTERLY_SPAN_LAST_DATA_INDEX && value != null ? (
            <text x={x - 10} y={y - 12} textAnchor="end" fontSize={11} fill="#0f766e" fontWeight={600}>
              Connected
            </text>
          ) : null}
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="activeLicensesCumulative"
        name="Active licenses (quarter-end)"
        stroke={FY26_ACTIVE_LICENSES_LINE_COLOR}
        strokeWidth={2.25}
        dot={{ r: 3.5, fill: FY26_ACTIVE_LICENSES_LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
        activeDot={{ r: 5 }}
        connectNulls={false}
        label={({ index, x, y, value }) =>
          index === ALL_TIME_RIGHT_QUARTERLY_SPAN_LAST_DATA_INDEX && value != null ? (
            <text x={x - 10} y={y - 14} textAnchor="end" fontSize={11} fill={FY26_ACTIVE_LICENSES_LINE_COLOR} fontWeight={500}>
              Active licenses
            </text>
          ) : null}
      />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="skyportHomeUsers"
        name="SkyportHome Accounts"
        stroke="transparent"
        strokeWidth={0}
        dot={false}
        activeDot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <AllTimeSkyportHomeBetweenQ3Q4Overlay />
    </LineChart>
  )
}

export default function FY26() {
  const { sectionId } = useParams()
  const location = useLocation()
  const [showPlannedDetails, setShowPlannedDetails] = useState(false)
  const [thermostatChartTabId, setThermostatChartTabId] = useState('FY23')
  const [outcomeExpanded, setOutcomeExpanded] = useState({
    a: false,
    b: false,
    c: false,
    d: false,
  })
  const outcomesAllExpanded =
    outcomeExpanded.a &&
    outcomeExpanded.b &&
    outcomeExpanded.c &&
    outcomeExpanded.d
  const isValid = FY26_TOP_NAV_IDS.includes(sectionId)
  if (!isValid) return <Navigate to={`${FY26_BASE}/${FY26_DEFAULT_SECTION_ID}`} replace />

  const isDigitalPlatform = sectionId === 'digital-platform'

  const allTimeFunnel = enrichAllTimeFunnelWithPaidPenetration(getAllTimeFunnelSnapshot())
  const businessModelDetailsRef = useRef(null)
  const [presentModeOpen, setPresentModeOpen] = useState(false)
  const [installedFunnelLicenseBreakdownOpen, setInstalledFunnelLicenseBreakdownOpen] = useState(false)

  useLayoutEffect(() => {
    if (!presentModeOpen) return undefined
    setShowPlannedDetails(true)
    setOutcomeExpanded({ a: true, b: true, c: true, d: true })
    if (businessModelDetailsRef.current) businessModelDetailsRef.current.open = true
    if (isDigitalPlatform) setInstalledFunnelLicenseBreakdownOpen(true)
    return undefined
  }, [presentModeOpen, isDigitalPlatform])

  useLayoutEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!FY26_INPAGE_HASH_IDS.includes(id)) return
    if (id === 'digital-platforms-business-model' && businessModelDetailsRef.current) {
      businessModelDetailsRef.current.open = true
    }
    if (isDigitalPlatform) {
      const goalKey = id.match(/^fy26-outcome-trigger-([abcd])$/)?.[1]
      if (goalKey) {
        setOutcomeExpanded((s) => ({ ...s, [goalKey]: true }))
      }
    }
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [location.hash, sectionId, isDigitalPlatform])

  return (
    <article className={`fy26-page${isDigitalPlatform ? '' : ' fy26-page--simple'}`}>
      <header className="ds-header fy26-header">
        <div className="fy26-header-title-row">
          <div className="fy26-header-title-cluster">
            <Fy26PlaybookTitleDropdown sectionId={sectionId} />
          </div>
        </div>
      </header>
      <div key={sectionId} className="fy26-page-transition-surface">
        <div className="ds-layout fy26-layout">
        <FY26PageNav
          sectionId={sectionId}
          presentOpen={presentModeOpen}
          onPresentOpenChange={setPresentModeOpen}
          installedFunnelLicenseBreakdownOpen={
            isDigitalPlatform ? installedFunnelLicenseBreakdownOpen : undefined
          }
          onInstalledFunnelLicenseBreakdownOpenChange={
            isDigitalPlatform ? setInstalledFunnelLicenseBreakdownOpen : undefined
          }
        />
        <div className="ds-sections">
          <section className="ds-section ds-section-single">
            <div className="ds-section-header" id="fy25-review">
              <span className="ds-section-badge">1</span>
              <h2 className="ds-section-title ds-section-title-single">
                {sectionId === 'digital-platform' ? 'FY25 Review — Execution Reality' : 'FY25 Review'}
              </h2>
            </div>
            {sectionId === 'digital-platform' ? (
            <ThermostatLocationsMapProvider>
            <div className="fy25-review-body">
              <div className="fy25-graphs-row">
                <div className="fy25-visual fy25-funnel fy25-funnel--combined">
                  <div id="fy25-installed-base-activation-funnel">
                    <h5 className="fy25-visual-title fy25-funnel-combined-title">
                      Installed Base Activation Funnel
                    </h5>
                    <InstalledBaseFunnelTable
                      allTimeFunnel={allTimeFunnel}
                      licenseBreakdownOpen={installedFunnelLicenseBreakdownOpen}
                      onLicenseBreakdownOpenChange={setInstalledFunnelLicenseBreakdownOpen}
                    />
                    <div className="fy25-funnel-activation-takeaway" role="note">
                      <p className="fy25-funnel-activation-takeaway__p">
                        <strong className="fy25-funnel-activation-takeaway__lead">Takeaway:</strong>{' '}
                        FY25 showed continued hardware scale, but declining connectivity rates highlight
                        execution gaps at install and commissioning. FY26 focus must shift to tightening
                        activation and conversion to turn installed systems into a monetizable digital base.
                      </p>
                    </div>
                  </div>
                  <p className="fy25-funnel-thermostat-footprint-line" role="note">
                    {'Thermostat Locations ('}
                    <ThermostatLocationsMapInlineLink>see map</ThermostatLocationsMapInlineLink>
                    {'): Large and widespread footprint — the issue is execution, not reach.'}
                  </p>
                </div>
              </div>

              <div className="fy25-monthly-chart-wrap">
                <h5
                  className="fy25-visual-title fy25-chart-main-heading"
                  id="fy25-thermostat-sales-skyportcare"
                >
                  Thermostat Sales &amp; Connectivity, SkyportHome Users, SkyportCare Active Licenses
                </h5>
                <div className="fy25-chart-dual-row">
                  <div className="fy25-chart-dual-cell fy25-chart-split-panel fy25-chart-split-panel--fy">
                    <div className="fy25-chart-split-header fy25-chart-split-header--monthly">
                      <span className="fy25-chart-split-panel-label fy25-chart-split-panel-label--monthly" id="thermostat-monthly-heading">
                        Monthly Data
                      </span>
                      <div className="fy25-chart-tabs" role="tablist" aria-label="Fiscal year">
                        {THERMOSTAT_FY_TABS.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`thermostat-tab-${tab.id}`}
                            aria-selected={thermostatChartTabId === tab.id}
                            aria-controls="thermostat-fy-chart-panel"
                            tabIndex={thermostatChartTabId === tab.id ? 0 : -1}
                            className={`fy25-chart-tab ${thermostatChartTabId === tab.id ? 'fy25-chart-tab--active' : ''}`}
                            onClick={() => setThermostatChartTabId(tab.id)}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div
                      id="thermostat-fy-chart-panel"
                      role="tabpanel"
                      aria-labelledby={`thermostat-tab-${thermostatChartTabId}`}
                    >
                      {isThermostatChartPlaceholder(THERMOSTAT_SALES_CHART_DATA[thermostatChartTabId]) && (
                        <p className="fy25-chart-data-pending" role="status">
                          Monthly data for {thermostatChartTabId} will be provided.
                        </p>
                      )}
                      <div className="fy25-thermostat-recharts-root">
                        <ResponsiveContainer width="100%" height={THERMOSTAT_FY_CHART_HEIGHT}>
                          <ThermostatFyMonthlyChart fyId={thermostatChartTabId} />
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  <div className="fy25-chart-dual-cell fy25-chart-split-panel fy25-chart-split-panel--alltime">
                    <div className="fy25-chart-split-header fy25-chart-split-header--alltime-only">
                      <span className="fy25-chart-split-panel-label fy25-chart-split-panel-label--alltime" id="thermostat-alltime-heading">
                        FY23 - FY25 (Cumulative)
                      </span>
                    </div>
                    <div
                      id="thermostat-alltime-chart-panel"
                      role="region"
                      aria-labelledby="thermostat-alltime-heading"
                    >
                      <div className="fy25-thermostat-recharts-root">
                        <ResponsiveContainer width="100%" height={THERMOSTAT_FY_CHART_HEIGHT}>
                          <ThermostatRightAllTimeQuarterlyChart />
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="fy25-funnel-dealer-callout fy25-skyportcare-dealer-adoption" role="note">
                  SkyportCare Dealer Adoption: ~11% (1,978 / 18,123) dealers actively using SkyportCare — limiting
                  system activation and platform utilization.
                </p>

                <div className="fy25-takeaway fy25-takeaway--thermostat-opportunity">
                  <p className="fy25-takeaway-paragraph">
                    <strong className="fy25-takeaway-inline-label">Opportunity:</strong>{' '}
                    Closing the activation gap converts existing hardware volume into a monetizable digital base,
                    enabling renewals, upgrades, and long&#8209;term recurring value.
                  </p>
                </div>
              </div>

              <div className="fy25-planned-full">
                <div className="fy25-planned-card">
                  <div className="fy25-planned-header">
                    <h4 className="fy25-planned-card-title" id="fy25-planned-vs-actual">
                      Planned vs Actual initiatives
                    </h4>
                    <div className="fy25-planned-bulk-actions">
                      <button
                        type="button"
                        className="fy26-strategic-themes-bulk-btn"
                        onClick={() => setShowPlannedDetails((v) => !v)}
                        aria-expanded={showPlannedDetails}
                      >
                        {showPlannedDetails
                          ? 'Collapse initiative details'
                          : 'Expand initiative details'}
                      </button>
                    </div>
                  </div>
                  {!showPlannedDetails && (() => {
                    const order = [0, 5, 1, 6, 2, 7, 3, 8, 4, 9]
                    let notStarted = 0, partial = 0, completed = 0
                    order.forEach((i) => {
                      const f = FY25_PLANNED_VS_ACTUAL_FEATURES[i]
                      const st = getPlannedInitiativeActualStatus(f.actual)
                      if (st === 'not-started') notStarted++; else if (st === 'partial') partial++; else completed++
                    })
                    return (
                      <div className="fy25-planned-collapsed">
                        <p className="fy25-planned-context">Most FY25 software initiatives were planned but not operationalized at scale.</p>
                        <p className="fy25-planned-summary">
                          <span className="fy25-summary-dot fy25-summary-not-started" aria-hidden>🔴</span> Not Started ({notStarted})
                          {' '}<span className="fy25-summary-dot fy25-summary-partial" aria-hidden>🟡</span> Work in progress ({partial})
                          {' '}<span className="fy25-summary-dot fy25-summary-completed" aria-hidden>✅</span> Completed ({completed})
                        </p>
                      </div>
                    )
                  })()}
                  {showPlannedDetails && (
                  <>
                  <p className="fy25-planned-context">The majority of FY25 software initiatives were planned but not operationalized at scale.</p>
                  <div className="fy25-feature-cols">
                          {[0, 5, 1, 6, 2, 7, 3, 8, 4, 9].map((i) => {
                            const f = FY25_PLANNED_VS_ACTUAL_FEATURES[i]
                            const actualStatus = getPlannedInitiativeActualStatus(f.actual)
                            const sentences = f.description.split(/(?<!i\.e)(?<!e\.g)(?<!etc)\.\s+/).map((s) => s.trim()).filter(Boolean)
                            const hasBullets = sentences.length > 1
                            return (
                              <div key={f.num} className="fy25-feature-item">
                                <div className="fy25-feature-title-row">
                                  <span className="fy25-feature-badge">{f.num}</span>
                                  <span className="fy25-feature-title">{f.title}</span>
                                </div>
                                {hasBullets ? (
                                  <ul className="fy25-list fy25-feature-desc">
                                    {sentences.map((s, j) => (
                                      <li key={j}>{s}{s.endsWith('.') ? '' : '.'}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="fy25-feature-desc">{f.description}</p>
                                )}
                                <p className="fy25-feature-meta">
                                  <strong>Target Date:</strong> {f.targetDate} · <strong>Actual:</strong>{' '}
                                  <span className={`fy25-actual fy25-actual-${actualStatus}`}>{actualStatus === 'completed' && <span className="fy25-actual-check" aria-hidden>✅ </span>}{f.actual}</span>
                                </p>
                              </div>
                            )
                          })}
                  </div>
                  </>
                  )}
                </div>
              </div>

              <div className="fy25-skyport-home-wrap" id="skyport-home">
                <SkyportHomeUserFeedbackCard presentExpandAll={presentModeOpen} />
              </div>

              <div className="fy25-takeaway">
                <h4 className="fy25-takeaway-title">Takeaway</h4>
                <ul className="fy25-takeaway-list">
                  <li>
                    Hardware demand was strong, but digital activation and engagement did not scale, with little
                    consistent analytics in place to understand where users dropped or why.
                  </li>
                  <li>
                    The activation gap persisted throughout FY25, indicating a systemic execution issue, not
                    seasonality.
                  </li>
                  <li>
                    Most planned software initiatives did not operationalize at scale, and the lack of
                    instrumentation limited visibility into engagement, retention, and downstream monetization.
                  </li>
                  <li>
                    Closing the activation gap represents the largest near‑term growth opportunity without
                    incremental hardware volume.
                  </li>
                </ul>
                <p className="fy25-takeaway-bottomline">
                  <strong>Bottom line:</strong> Strategy was not the issue. Execution ownership, prioritization,
                  throughput, and limited analytics constrained progress.
                </p>
              </div>
            </div>
            </ThermostatLocationsMapProvider>
            ) : (
            <div className="ds-content">
              <p className="ds-subheading"><strong>Results vs plan</strong></p>
              <p className="ds-subheading"><strong>Playbook theme execution and impact</strong></p>
              <p className="ds-subheading"><strong>Summary and explanation of gaps, countermeasures moving forward</strong></p>
            </div>
            )}
          </section>
          <section className="ds-section ds-section-single">
            <div className="ds-section-header" id="fy26-plan">
              <span className="ds-section-badge">2</span>
              <h2 className="ds-section-title ds-section-title-single">FY26 – Operating Focus</h2>
            </div>
            {isDigitalPlatform ? (
              <div className="fy26-plan-cards">
                <>
                  <p className="fy26-plan-strategy-preamble-text">
                    Our strategy follows a clear progression: activate connected systems, engage homeowners and
                    dealers consistently, and retain value through renewals, services, and lifecycle monetization.
                  </p>
                  <div className="fy26-mini-card fy26-outcomes-box" id="fy26-outcomes">
                    <div className="fy26-outcomes-header">
                      <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                        <a href="#fy26-outcomes" className="fy26-outcomes-heading-anchor">
                          <span className="fy26-plan-letter-badge">A</span>
                          <span>Goals</span>
                        </a>
                      </h4>
                      <div className="fy26-strategic-themes-bulk-actions">
                        <button
                          type="button"
                          className="fy26-strategic-themes-bulk-btn"
                          onClick={() =>
                            outcomesAllExpanded
                              ? setOutcomeExpanded({
                                  a: false,
                                  b: false,
                                  c: false,
                                  d: false,
                                })
                              : setOutcomeExpanded({
                                  a: true,
                                  b: true,
                                  c: true,
                                  d: true,
                                })
                          }
                          aria-expanded={outcomesAllExpanded}
                        >
                          {outcomesAllExpanded ? 'Collapse all' : 'Expand all'}
                        </button>
                      </div>
                    </div>
                    <div className="fy26-outcomes-goals-grid" role="list">
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, b: !s.b }))
                          }
                          aria-expanded={outcomeExpanded.b}
                          id="fy26-outcome-trigger-b"
                          aria-controls="fy26-outcome-panel-b"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.b ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.b ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Increase Ongoing Homeowner Engagement
                          </span>
                        </button>
                        {outcomeExpanded.b && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-b"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-b"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase repeat, value‑driven homeowner engagement through{' '}
                                  <strong>SkyportHome</strong>.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Establish consistent monthly engagement across the connected homeowner base, with
                                  ≥50% SkyportHome MAU and ≥35% of connected homeowners taking at least one
                                  meaningful value action per month.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Engagement is the leading indicator for retention, renewal, upsell, and
                                  long‑term value.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  Monthly active users (MAU), Users with ≥1 meaningful monthly action, insight /
                                  report interaction rate
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, a: !s.a }))
                          }
                          aria-expanded={outcomeExpanded.a}
                          id="fy26-outcome-trigger-a"
                          aria-controls="fy26-outcome-panel-a"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.a ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.a ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Increase Dealer‑Led Digital Adoption
                          </span>
                        </button>
                        {outcomeExpanded.a && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-a"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-a"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase active <strong>SkyportCare</strong> licenses as a percentage of
                                  connected systems.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase active license penetration from ~3–4% to ~6–8% of connected systems by
                                  end of FY26.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Converts existing hardware volume into recurring, high‑margin digital value
                                  without incremental equipment sales.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  Active License Penetration (% of connected systems), Net new activations, Dealer
                                  participation rate (SkyportCare)
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, c: !s.c }))
                          }
                          aria-expanded={outcomeExpanded.c}
                          id="fy26-outcome-trigger-c"
                          aria-controls="fy26-outcome-panel-c"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.c ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.c ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Grow Predictable Recurring Digital Revenue
                          </span>
                        </button>
                        {outcomeExpanded.c && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-c"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-c"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Grow predictable, recurring digital revenue from <strong>SkyportCare</strong>{' '}
                                  licenses and platform services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Achieve ~$18M in recognized SkyportCare revenue in FY26, driven primarily by bundled
                                  year&#8209;1 licenses, while building Paid Annual renewal momentum.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Creates a scalable revenue layer that funds digital investment without margin
                                  dilution in the hardware business.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  Paid Annual &amp; Lifetime License Penetration, Renewal conversion rate (included →
                                  paid), Revenue per connected system
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="fy26-outcome-row" role="listitem">
                        <button
                          type="button"
                          className="fy26-outcome-collapse-trigger"
                          onClick={() =>
                            setOutcomeExpanded((s) => ({ ...s, d: !s.d }))
                          }
                          aria-expanded={outcomeExpanded.d}
                          id="fy26-outcome-trigger-d"
                          aria-controls="fy26-outcome-panel-d"
                        >
                          <span
                            className={`fy26-outcome-chevron ${outcomeExpanded.d ? 'is-open' : ''}`}
                            aria-hidden
                          >
                            {outcomeExpanded.d ? '▾' : '▸'}
                          </span>
                          <span className="fy26-outcome-collapse-title">
                            Increase Lifetime Value per Installed System
                          </span>
                        </button>
                        {outcomeExpanded.d && (
                          <div
                            className="fy26-outcome-expanded"
                            id="fy26-outcome-panel-d"
                            role="region"
                            aria-labelledby="fy26-outcome-trigger-d"
                          >
                            <ul className="fy26-outcome-detail-list">
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Goal: </span>
                                <span className="fy26-goal-colon-value">
                                  Increase lifetime value (LTV) per installed system through platform‑led
                                  services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Target: </span>
                                <span className="fy26-goal-colon-value">
                                  Begin shifting value capture from one‑time install economics toward multi‑year,
                                  per‑home value through active platform adoption and paid digital services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Business Impact: </span>
                                <span className="fy26-goal-colon-value">
                                  Maximizes return on the installed base while strengthening dealer loyalty
                                  through differentiated, data‑backed services.
                                </span>
                              </li>
                              <li className="fy26-outcome-detail-item">
                                <span className="fy26-goal-colon-label">Primary KPI(s): </span>
                                <span className="fy26-goal-colon-value">
                                  LTV per connected system, Multi‑service attachment rate, Retention / churn rate
                                </span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="fy26-mini-card fy26-goals-bm-tracking-card"
                    id="fy26-goals-business-model-tracking"
                  >
                    <Fy26GoalsBusinessModelTracking />
                  </div>
                  <div className="fy26-mini-card fy26-strategic-themes-box" id="fy26-strategic-themes">
                    <div className="fy26-strategic-themes-header">
                      <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                        <span className="fy26-plan-letter-badge">B</span>
                        <span>Strategic Themes</span>
                      </h4>
                    </div>
                    <ul className="fy26-strategic-themes-list">
                      <li>
                        <span className="fy26-strategic-themes-lead">Activation &amp; Onboarding:</span> Moves
                        systems from connected to activated, directly driving active license adoption and future
                        monetization.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Engagement &amp; Action:</span> Sustained
                        homeowner and dealer engagement that enables renewals, upsell, and lifecycle monetization.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Monetization &amp; Packaging:</span>{' '}
                        Predictable, scalable digital revenue aligned to FY26 DCBU budget objectives.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Platform &amp; Integration:</span> Consistent
                        execution at scale by eliminating fragmented tools and manual workarounds.
                      </li>
                      <li>
                        <span className="fy26-strategic-themes-lead">Operating Cadence &amp; Ownership:</span>{' '}
                        Execution throughput required to meet modeled FY26 growth assumptions.
                      </li>
                    </ul>
                  </div>
                  <div className="fy26-mini-card" id="fy26-execution-plan">
                    <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                      <span className="fy26-plan-letter-badge">C</span>
                      <span>Execution Plan</span>
                    </h4>
                    <p className="fy26-execution-plan-principle">
                      <span className="fy26-execution-plan-principle-label">UX Principle:</span> All FY26
                      execution prioritizes simple, consistent, and outcome-driven user experiences across{' '}
                      <strong>SkyportHome</strong> and <strong>SkyportCare</strong>.
                    </p>
                    <p className="fy26-execution-plan-ownership">
                      Execution is led through product‑level ownership, with development capacity augmented
                      through external partners.
                    </p>
                    <div className="fy26-execution-plan-table-wrap">
                      <table className="fy26-execution-plan-table">
                        <colgroup>
                          <col className="fy26-execution-plan-col-theme" />
                          <col className="fy26-execution-plan-col-actions" />
                          <col className="fy26-execution-plan-col-pic" />
                          <col className="fy26-execution-plan-col-deps" />
                          <col className="fy26-execution-plan-col-quarter" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">Strategic Theme</th>
                            <th scope="col" className="fy26-execution-plan-th-actions">
                              Key Actions
                            </th>
                            <th scope="col" className="fy26-execution-plan-th-pic">
                              PIC
                            </th>
                            <th scope="col" className="fy26-execution-plan-th-dependencies">
                              Key Dependencies
                            </th>
                            <th scope="col" className="fy26-execution-plan-th-quarter">
                              Target
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="fy26-execution-plan-theme-name" rowSpan={3}>
                              Activation &amp; Onboarding
                            </td>
                            <td>Simplify dealer &amp; homeowner activation flows</td>
                            <td className="fy26-execution-plan-pic" rowSpan={3}>
                              SkyportCare Product Management
                            </td>
                            <td className="fy26-execution-plan-dependencies">Platform services</td>
                            <td className="fy26-execution-plan-quarter">Q1–Q2 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Standardize activation at install &amp; commissioning (Quality Install as default path)
                            </td>
                            <td className="fy26-execution-plan-dependencies">Dealer processes</td>
                            <td className="fy26-execution-plan-quarter">Q1–Q2 FY26</td>
                          </tr>
                          <tr>
                            <td>Reduce friction from install → first value</td>
                            <td className="fy26-execution-plan-dependencies">UX design standards</td>
                            <td className="fy26-execution-plan-quarter">Q1–Q2 FY26</td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name" rowSpan={3}>
                              Engagement &amp; Action
                            </td>
                            <td>
                              Shift from passive monitoring to actionable insights (reports, alerts, recommended
                              actions)
                            </td>
                            <td className="fy26-execution-plan-pic" rowSpan={3}>
                              SkyportHome Product Management
                            </td>
                            <td className="fy26-execution-plan-dependencies">Data &amp; analytics</td>
                            <td className="fy26-execution-plan-quarter">Q2–Q3 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Establish recurring engagement loops across <strong>SkyportHome</strong> and{' '}
                              <strong>SkyportCare</strong>
                            </td>
                            <td className="fy26-execution-plan-dependencies">Notifications</td>
                            <td className="fy26-execution-plan-quarter">Q3–Q4 FY26</td>
                          </tr>
                          <tr>
                            <td>Surface dealer‑initiated actions through consistent homeowner experiences</td>
                            <td className="fy26-execution-plan-dependencies">UX design standards</td>
                            <td className="fy26-execution-plan-quarter">Q2–Q3 FY26</td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name" rowSpan={3}>
                              Monetization &amp; Packaging
                            </td>
                            <td>Simplify license packaging (bundles, defaults, renewal paths)</td>
                            <td className="fy26-execution-plan-pic" rowSpan={3}>
                              Platform / Monetization Product Management
                            </td>
                            <td className="fy26-execution-plan-dependencies">Finance &amp; pricing governance</td>
                            <td className="fy26-execution-plan-quarter">Q2–Q3 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Align pricing and packaging to dealer workflows and per‑home value models
                            </td>
                            <td className="fy26-execution-plan-dependencies">Billing systems</td>
                            <td className="fy26-execution-plan-quarter">Q2–Q3 FY26</td>
                          </tr>
                          <tr>
                            <td>Reduce cognitive and transactional friction to purchase and renew</td>
                            <td className="fy26-execution-plan-dependencies">Legal</td>
                            <td className="fy26-execution-plan-quarter">Q3–Q4 FY26</td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name" rowSpan={4}>
                              Platform &amp; Integration
                            </td>
                            <td>
                              Establish <strong>SkyportCare</strong> as the primary dealer front door with backend
                              integrations
                            </td>
                            <td className="fy26-execution-plan-pic" rowSpan={4}>
                              Platform Architecture / Product Management
                            </td>
                            <td className="fy26-execution-plan-dependencies">Digital tool integrations</td>
                            <td className="fy26-execution-plan-quarter">Q1–Q2 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Reduce dependency on emails, tribal knowledge, and disconnected tools
                            </td>
                            <td className="fy26-execution-plan-dependencies">Legacy tools</td>
                            <td className="fy26-execution-plan-quarter">Q2–Q3 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Enable feature reuse across <strong>SkyportHome</strong> and{' '}
                              <strong>SkyportCare</strong> through shared platform services
                            </td>
                            <td className="fy26-execution-plan-dependencies">Security</td>
                            <td className="fy26-execution-plan-quarter">Q3–Q4 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Establish a shared analytics and measurement layer across{' '}
                              <strong>SkyportHome</strong> and <strong>SkyportCare</strong>
                            </td>
                            <td className="fy26-execution-plan-dependencies">Digital tool integrations</td>
                            <td className="fy26-execution-plan-quarter">Q1–Q2 FY26</td>
                          </tr>
                          <tr>
                            <td className="fy26-execution-plan-theme-name" rowSpan={3}>
                              Operating Cadence &amp; Ownership
                            </td>
                            <td>Establish clear end‑to‑end product ownership per theme</td>
                            <td className="fy26-execution-plan-pic" rowSpan={3}>
                              Digital Leadership
                            </td>
                            <td className="fy26-execution-plan-dependencies">
                              Dedicated SkyportHome &amp; SkyportCare Product Managers
                            </td>
                            <td className="fy26-execution-plan-quarter">Q1–Q2 FY26</td>
                          </tr>
                          <tr>
                            <td>
                              Increase release cadence aligned to engagement and monetization goals
                            </td>
                            <td className="fy26-execution-plan-dependencies">Org alignment to product model</td>
                            <td className="fy26-execution-plan-quarter">FY26 (ongoing)</td>
                          </tr>
                          <tr>
                            <td>Shift from project‑based delivery to outcome‑based execution</td>
                            <td className="fy26-execution-plan-dependencies">Partner delivery capacity</td>
                            <td className="fy26-execution-plan-quarter">FY26 (ongoing)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="fy26-execution-plan-delivery-note">
                      <strong>Note:</strong> The <strong>Target</strong> column indicates execution focus and
                      sequencing within FY26. &ldquo;Ongoing&rdquo; items represent operating model changes and
                      cadence, not discrete feature delivery milestones.
                    </p>
                    <Fy26DigitalAppsRoadmapEmbeds forceExpandRoadmaps={presentModeOpen} />
                  </div>
                  <div className="fy26-mini-card" id="fy26-interaction-alignment">
                    <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                      <span className="fy26-plan-letter-badge">D</span>
                      <span>Interaction &amp; Alignment with Other Teams</span>
                    </h4>
                    <ul className="fy26-operating-model-list">
                      <li>
                        Digital Platforms owns end‑to‑end definition, prioritization, and orchestration of digital
                        experiences across <strong>SkyportHome</strong> and <strong>SkyportCare</strong>.
                      </li>
                      <li>
                        Controls Engineering owns hardware behavior, commissioning logic, and system‑level data
                        generation; digital teams consume and operationalize this data.
                      </li>
                      <li>
                        Sales &amp; Dealer Enablement partner on dealer workflows, onboarding, and adoption
                        feedback; digital teams define and scale standardized experiences.
                      </li>
                      <li>
                        IT / Platform Services support shared services (identity, security, infrastructure);
                        digital teams own product logic and user experience.
                      </li>
                      <li>
                        External software partners augment delivery capacity under Digital Platforms direction and
                        roadmap governance.
                      </li>
                    </ul>
                  </div>
                </>
              </div>
            ) : (
              <div className="ds-content fy26-plan-simple-list">
                <p className="ds-subheading">
                  <strong>A.</strong> Goals aligned to FY26 DCBU budget objectives.
                </p>
                <p className="ds-subheading">
                  <strong>B.</strong> Specific Themes to support achieving the DCBU budget objectives.
                </p>
                <p className="ds-subheading">
                  <strong>C.</strong> Clear action items with start/finish dates, PIC and dependencies.
                </p>
                <p className="ds-subheading">
                  <strong>D.</strong> Clarity on interaction and alignment with other stakeholders / teams of your
                  designated themes/initiatives.
                </p>
              </div>
            )}
          </section>
          <section className="ds-section ds-section-single fy26-fusion30-section">
            <div className="ds-section-header" id="fusion30-summary">
              <span className="ds-section-badge">3</span>
              <h2 className="ds-section-title ds-section-title-single">Fusion30 Summary - Strategic Horizon</h2>
            </div>
            {isDigitalPlatform ? (
              <>
                <div className="fy26-mini-card fy26-fusion30-forecast-card" id="fusion30-forecast-outlook">
                  <div className="fy26-forecast-installed-funnel fy26-fusion30-forecast-card__funnel">
                    <h5 className="fy26-forecast-installed-funnel-title">Installed Base Forecast Funnel</h5>
                    <InstalledBaseForecastFunnelTable presentExpandAll={presentModeOpen} />
                  </div>
                  <div
                    className="fy26-goals-outlook-chart fy26-fusion30-forecast-card__charts"
                    aria-label="Forecast outlook: left chart, FY26–FY30 activity bars including FY net-new active licenses; right chart, FY25–FY30 cumulative installed base (lines)"
                  >
                    <h5 className="fy26-goals-outlook-chart-title">
                      Forecast: Thermostat Sales &amp; Connectivity, SkyportHome Users, SkyportCare Active Licenses
                    </h5>
                    <div className="fy25-chart-dual-row fy26-goals-outlook-chart-dual">
                      <div className="fy25-chart-dual-cell fy25-chart-split-panel fy25-chart-split-panel--fy">
                        <div className="fy25-chart-split-header fy25-chart-split-header--alltime-only">
                          <span
                            className="fy25-chart-split-panel-label fy25-chart-split-panel-label--monthly"
                            id="fy26-forecast-fy-chart-heading"
                          >
                            FY26–FY30 (by year)
                          </span>
                        </div>
                        <div
                          className="fy25-thermostat-recharts-root fy26-goals-outlook-chart-wrap"
                          role="region"
                          aria-labelledby="fy26-forecast-fy-chart-heading"
                        >
                          <ResponsiveContainer width="100%" height={THERMOSTAT_FY_CHART_HEIGHT}>
                            <BusinessModelForecastFyBarsChart />
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="fy25-chart-dual-cell fy25-chart-split-panel fy25-chart-split-panel--alltime">
                        <div className="fy25-chart-split-header fy25-chart-split-header--alltime-only">
                          <span
                            className="fy25-chart-split-panel-label fy25-chart-split-panel-label--alltime"
                            id="fy26-forecast-alltime-chart-heading"
                          >
                            FY25 - FY30 (Cumulative)
                          </span>
                        </div>
                        <div
                          className="fy25-thermostat-recharts-root fy26-goals-outlook-chart-wrap"
                          role="region"
                          aria-labelledby="fy26-forecast-alltime-chart-heading"
                        >
                          <ResponsiveContainer width="100%" height={THERMOSTAT_FY_CHART_HEIGHT}>
                            <BusinessModelForecastAllTimeCumulativeChart />
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fy26-mini-card fy26-fusion30-aims-card" id="fusion30-strategic-aims">
                  <div className="ds-content fy26-fusion30-content">
                    <p className="ds-subheading">
                      <strong>What we aim to accomplish</strong>
                    </p>
                    <p className="fy26-fusion30-aims-intro">
                      By the Fusion30 horizon, digital platforms become a core growth engine that compounds value
                      across Daikin&apos;s installed base.
                    </p>
                    <ul className="fy26-fusion30-aims-list">
                      <li>
                        Reach 2M+ connected homeowners across <strong>SkyportHome</strong>
                      </li>
                      <li>
                        Achieve digital ubiquity across the installed base (~80% connected), with ~18% of systems
                        participating in active, dealer‑led <strong>SkyportCare</strong> workflows.
                      </li>
                      <li>
                        Build a $100M+ recurring digital revenue stream driven by paid services, renewals, and
                        lifecycle monetization.
                      </li>
                      <li>
                        Shift value capture from one‑time installs to multi‑year, per‑home value
                      </li>
                      <li>
                        Establish a scalable foundation for energy, electrification, and whole‑home services
                      </li>
                    </ul>
                    <p className="ds-subheading fy26-fusion30-how-heading">
                      <strong>How we will accomplish this</strong>
                    </p>
                    <ul className="fy26-fusion30-aims-list fy26-fusion30-how-list">
                      <li>
                        Execute across the full lifecycle: install → operate → service → replace
                      </li>
                      <li>
                        Use <strong>SkyportHome</strong> for homeowner engagement and <strong>SkyportCare</strong>{' '}
                        for dealer execution
                      </li>
                      <li>
                        Operate with product‑led ownership and outcome‑based prioritization
                      </li>
                      <li>
                        Convert connectivity into sustained engagement, dealer activation, and monetization across
                        ~2M connected homes.
                      </li>
                      <li>
                        Reduce fragmentation through shared platform services and UX‑first execution
                      </li>
                      <li>
                        Enable next‑generation business models—energy services, electrification, and whole‑home
                        solutions—once a scalable digital engagement and monetization foundation is in place.
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="ds-content">
                <p className="ds-subheading">
                  <strong>What you want to accomplish with Fusion30 (QAP Quantitative Goals)</strong>
                </p>
                <p className="ds-subheading">
                  <strong>How you will accomplish (Qualitative Actions, 5W/2H)</strong>
                </p>
              </div>
            )}
          </section>
          {isDigitalPlatform && (
            <div className="fy26-business-model-below-fusion30">
              <div className="fy26-business-model-block" id="digital-platforms-business-model">
                <details ref={businessModelDetailsRef} className="fy26-business-model-details">
                  <summary className="fy26-business-model-summary">
                    <span className="fy26-business-model-summary-label">
                      Digital Platforms Business Model
                    </span>
                  </summary>
                  <div className="fy26-business-model-details-body">
                    <DigitalPlatformsBusinessModelTable />
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </article>
  )
}
