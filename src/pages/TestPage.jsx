import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
} from 'recharts'
import {
  DP_FUNNEL_FORECAST_COLUMNS,
  getFusion30TotalRevenueFY26to30BarData,
  getSkyportHomeUsersCumulativeFY26to30BarData,
  parsePctLabelToDecimal,
} from '../content/digitalPlatformsForecastFunnel.js'
import { getActiveLicensePenetrationFY23to25ChartData } from '../content/funnelActiveLicensePenetrationFYDisplay.js'
import {
  getCombinedEndUserCategoryEffortChartData,
  getEndUserCategoryProductSplitData,
} from '../content/combinedAppSuiteEndUserCategoryShare.js'
import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import './TestPage.css'

/** Same quarter-end cumulative series as FY26 all-time thermostat chart (Q4 '25 = partial through Feb FY26). */
const SPARKLINE_QUARTERLY = [
  { idx: 0, quarter: "Q1 '23", sold: 213_167, connected: 114_981 },
  { idx: 1, quarter: "Q1 '24", sold: 334_695, connected: 172_806 },
  { idx: 2, quarter: "Q1 '25", sold: 503_170, connected: 299_991 },
  { idx: 3, quarter: "Q4 '25", sold: 610_064, connected: 341_229 },
]

/** Domain range 6 halves pixel spacing vs [0,3]; shift right so Q1'23 sits nearer the Y-axis. */
const LINE_X_DOMAIN = [-0.25, 5.75]
const LINE_X_TICKS = [0, 1, 2, 3]

const Y_MAX = 650_000

const SOLD_COLOR = '#0097e0'
const CONNECTED_COLOR = '#0d9488'
/** Thermostats chart “dark background” mode: panel + light lines (contrast on ~#000040 navy). */
const THERMOSTAT_DARK_PANEL_BG = '#000040'
const THERMOSTAT_LINE_SOLD_ON_DARK = '#a5d8ff'
const THERMOSTAT_LINE_CONNECTED_ON_DARK = '#7fd9be'
/** SkyportCare roadmap-mix bars on #000040 — light mint fill for contrast on the dark panel. */
const APP_SUITE_CARE_MIX_BAR_ON_DARK = '#b8f5d8'
/** Fusion30 outlook: purple SkyportHome users (bars use solid; FY26 chart uses semi-transparent). */
const SKYPORTHOME_USERS_PURPLE = '#7c3aed'

/** Bar labels above SkyportHome user columns (e.g. 467K, 1.1M, 2.6M). */
function formatUsersAbbrev(n) {
  if (!Number.isFinite(n)) return ''
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    const rounded = Math.round(m * 10) / 10
    return `${String(rounded).replace(/\.0$/, '')}M`
  }
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

const SKYPORTHOME_USERS_BAR_DATA = getSkyportHomeUsersCumulativeFY26to30BarData().map((row) => ({
  ...row,
  labelAbove: formatUsersAbbrev(row.users),
}))

const SKYPORTHOME_USERS_Y_MAX = 2_800_000
const SKYPORTHOME_USERS_Y_TICKS = [0, 1_400_000, 2_800_000]
const SKYPORTHOME_USERS_SOURCE =
  'Cumulative SkyportHome users at fiscal year-end — Digital Platforms business model (same series as the purple line on FY26 Fusion30 outlook).'

/** Fusion30 / business model revenue bars (matches FY26 orange-forward styling). */
const FUSION30_REVENUE_ORANGE = '#ea580c'

function formatRevenueAbbrev(n) {
  if (!Number.isFinite(n)) return ''
  const m = n / 1_000_000
  const rounded = Math.round(m * 10) / 10
  return `$${String(rounded).replace(/\.0$/, '')}M`
}

function yTickRevenueM(v) {
  if (v === 0) return '$0'
  return `$${v / 1_000_000}M`
}

const FUSION30_REVENUE_BAR_DATA = getFusion30TotalRevenueFY26to30BarData().map((row) => ({
  ...row,
  labelAbove: formatRevenueAbbrev(row.revenue),
}))

const FUSION30_REVENUE_Y_MAX = 140_000_000
const FUSION30_REVENUE_Y_TICKS = [0, 70_000_000, 140_000_000]
const FUSION30_REVENUE_SOURCE =
  'Total revenue ($) — Digital Platforms business model (FY26 Fusion30 table: SkyportCare license + enterprise license).'

const revenueTooltipFormatter = (value) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
        value,
      )
    : value

/** SkyportHome FY26–derived snapshot (approximate volumes). */
const FEEDBACK_BAR_DATA = [
  { category: 'Written Reviews', count: 900, labelAbove: '~900' },
  { category: 'Support Feedback', count: 5400, labelAbove: '~5,400' },
]

const FEEDBACK_Y_TICKS = [0, 3000, 6000]
const FEEDBACK_BAR_COLOR = '#0097e0'

/** SkyportHome + SkyportCare roadmap rows: share by end-user category (five pillars only). */
const APP_SUITE_END_USER_MIX_DATA = getCombinedEndUserCategoryEffortChartData()
const APP_SUITE_SPLIT_DATA = getEndUserCategoryProductSplitData()
const APP_SUITE_SPLIT_PEAK = Math.max(
  0,
  ...APP_SUITE_SPLIT_DATA.flatMap((d) => [d.homeOnlyPct, d.careOnlyPct]),
)
const APP_SUITE_SPLIT_Y_MAX = Math.min(100, Math.max(40, Math.ceil(APP_SUITE_SPLIT_PEAK / 5) * 5))
const APP_SUITE_SPLIT_Y_TICKS = (() => {
  const step = APP_SUITE_SPLIT_Y_MAX <= 50 ? 10 : 20
  /** @type {number[]} */
  const out = []
  for (let v = 0; v <= APP_SUITE_SPLIT_Y_MAX; v += step) out.push(v)
  return out
})()
const APP_SUITE_END_USER_MIX_Y_MAX = Math.min(
  100,
  Math.ceil(Math.max(...APP_SUITE_END_USER_MIX_DATA.map((d) => d.combinedPct), 0) / 5) * 5 + 5,
)
const APP_SUITE_END_USER_MIX_SOURCE =
  'SkyportHome and SkyportCare feature roadmaps (App Suite): each segment is the share of in-scope feature rows in that end-user category. Only the five pillars above are counted; shares sum to 100% across those rows.'

function appSuiteEndUserMixTopLabel(props) {
  const { x, y, width, payload } = props
  if (x == null || y == null || width == null || !payload) return null
  const label = `${Math.round(payload.combinedPct * 10) / 10}%`
  const cx = x + width / 2
  const cy = y - 8
  return (
    <text x={cx} y={cy} fill="#334155" fontSize={13} fontWeight={600} textAnchor="middle">
      {label}
    </text>
  )
}

/** X-axis ticks for roadmap-mix bars: numeric scale (values are still percentage points of share). */
function appSuiteSplitAxisTickNumber(v) {
  return String(v)
}

const APP_SUITE_DARK_TOOLTIP = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid rgba(248, 250, 252, 0.14)',
  background: '#0a0a55',
  color: '#f1f5f9',
}

const APP_SUITE_LIGHT_TOOLTIP = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  color: '#0f172a',
}

/** Light pastel fills for App Suite compare grid (white / gray panel). */
const APP_SUITE_HOME_BAR_LIGHT = '#bfdbfe'
const APP_SUITE_CARE_BAR_LIGHT = '#a7f3d0'

/** Must not set `barSize` on `<Bar />` or Recharts ignores `barCategoryGap` (v3). */
const BAR_CATEGORY_GAP = '32%'
const BAR_MAX_WIDTH = 52

/** Active license penetration FY26–FY30 from Digital Platforms business model (same source as FY26 Fusion30 installed-base funnel). */
const LICENSE_ROADMAP_DATA = DP_FUNNEL_FORECAST_COLUMNS.map((row) => {
  const label = row.activeLicensePenetrationLabel
  const pct = parsePctLabelToDecimal(label) * 100
  return {
    fiscalYear: row.id,
    pct,
    labelAbove: label,
  }
})

const LICENSE_ROADMAP_Y_TICKS = [0, 10, 20]
const LICENSE_FOOTNOTE = 'Ranges: current ~3–4%, target ~6–8%'
const LICENSE_ROADMAP_SOURCE =
  'FY26–FY30 bars use active license penetration from the Digital Platforms business model forecast (FY30 strategy / Fusion30 funnel).'

/** FY23–FY25 from SkyportCare installed-base funnel (same % as FY26 Digital Apps funnel table). */
const PENETRATION_BY_YEAR_DATA = getActiveLicensePenetrationFY23to25ChartData()

const PENETRATION_BY_YEAR_Y_TICKS = [0, 4, 8]
const PENETRATION_BY_YEAR_SOURCE =
  'FY23–FY25: Active License Penetration from the FY26 installed-base funnel (SkyportCare / Digital Apps).'

/** Wi‑Fi connected thermostat penetration targets (FIT scope only), FY26–FY30. */
const FIT_WIFI_PENETRATION_DATA = [
  { fiscalYear: 'FY26', pct: 60, labelAbove: '60%' },
  { fiscalYear: 'FY27', pct: 65, labelAbove: '65%' },
  { fiscalYear: 'FY28', pct: 70, labelAbove: '70%' },
  { fiscalYear: 'FY29', pct: 75, labelAbove: '75%' },
  { fiscalYear: 'FY30', pct: 80, labelAbove: '80%' },
]

const FIT_WIFI_PENETRATION_Y_TICKS = [0, 40, 80, 100]

function yTickK(v) {
  if (v === 0) return '0'
  if (v >= 1_000_000) return `${v / 1_000_000}M`
  return `${v / 1000}K`
}

/** Line-end labels use the same color as the line stroke. */
function endLineLabel(text, lineColor) {
  const lastIdx = SPARKLINE_QUARTERLY.length - 1
  const gapBelowDot = 14
  return function SparklineEndLabel(props) {
    const { x, y, index } = props
    if (index !== lastIdx || x == null || y == null) return null
    return (
      <text
        x={x}
        y={y + gapBelowDot}
        fill={lineColor}
        fontSize={12}
        fontWeight={600}
        dominantBaseline="hanging"
        textAnchor="middle"
      >
        {text}
      </text>
    )
  }
}

/**
 * @param {{
 *   chartId: string
 *   title: string
 *   subtitle: string
 *   pctKey: 'homeOnlyPct' | 'careOnlyPct'
 *   countKey: 'homeCount' | 'careCount'
 *   productLabel: string
 *   barFill: string
 * }} props
 */
function AppSuiteEndUserMixDarkChart({ chartId, title, subtitle, pctKey, countKey, productLabel, barFill }) {
  return (
    <div className="test-page-tile test-page-tile--feedback test-page-tile--app-suite-dark-wrap" id={chartId}>
      <div className="test-page-app-suite-mix-dark-panel">
        <h2 className="test-page-app-suite-mix-dark-title">{title}</h2>
        <p className="test-page-app-suite-mix-dark-sub">{subtitle}</p>
        <div className="test-page-feedback-chart-wrap test-page-feedback-chart-wrap--taller test-page-app-suite-mix-dark-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={APP_SUITE_SPLIT_DATA}
              margin={{ top: 8, right: 12, left: 8, bottom: 32 }}
              barCategoryGap={BAR_CATEGORY_GAP}
              isAnimationActive={false}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.14)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, APP_SUITE_SPLIT_Y_MAX]}
                ticks={APP_SUITE_SPLIT_Y_TICKS}
                axisLine={{ stroke: '#ffffff' }}
                tickLine={false}
                tick={{ fill: '#ffffff', fontSize: 13 }}
                tickFormatter={appSuiteSplitAxisTickNumber}
              />
              <YAxis
                type="category"
                dataKey="categoryShort"
                width={128}
                axisLine={{ stroke: '#ffffff' }}
                tickLine={false}
                tick={{ fill: '#ffffff', fontSize: 13 }}
                interval={0}
              />
              <Tooltip
                formatter={(value, _name, entry) => {
                  if (typeof value !== 'number') return [value, productLabel]
                  const rounded = Math.round(value * 10) / 10
                  const row = entry?.payload
                  const n = row?.[countKey]
                  const countPart = typeof n === 'number' ? ` (${n} feature${n !== 1 ? 's' : ''})` : ''
                  return [`${rounded}%${countPart}`, productLabel]
                }}
                labelFormatter={(_, p) => p?.[0]?.payload?.category ?? ''}
                contentStyle={APP_SUITE_DARK_TOOLTIP}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{ fill: 'rgba(248, 250, 252, 0.06)' }}
              />
              <Bar
                dataKey={pctKey}
                name={productLabel}
                fill={barFill}
                fillOpacity={0.95}
                radius={[0, 6, 6, 0]}
                maxBarSize={BAR_MAX_WIDTH}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="test-page-app-suite-mix-dark-foot">
          Share of in-scope features in each pillar for this product only (five categories sum to 100%).
        </p>
      </div>
    </div>
  )
}

export default function TestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [thermostatChartDarkBg, setThermostatChartDarkBg] = useState(false)
  const thermostatsSoldStroke = thermostatChartDarkBg ? THERMOSTAT_LINE_SOLD_ON_DARK : SOLD_COLOR
  const thermostatsConnectedStroke = thermostatChartDarkBg ? THERMOSTAT_LINE_CONNECTED_ON_DARK : CONNECTED_COLOR
  const thermostatsDotRingStroke = thermostatChartDarkBg ? THERMOSTAT_DARK_PANEL_BG : '#fff'

  return (
    <article className="test-page">
      <h1>Test page</h1>
      <div className="test-page-demo-bar">
        <div className="test-page-demo-bar__intro">
          <p className="test-page-demo-bar__title">SkyportCare dealer demo</p>
          <p className="test-page-demo-bar__text">
            Full-screen dashboard mock (static numbers). Use the button or the menu below.
          </p>
        </div>
        <div className="test-page-demo-bar__actions">
          <Link className="test-page-demo-bar__cta" to="/test-page/care-demo/login">
            Open login (welcome)
          </Link>
          <Link className="test-page-demo-bar__cta test-page-demo-bar__cta--secondary" to="/test-page/care-demo">
            Open dashboard
          </Link>
          <label className="test-page-demo-bar__select-wrap" htmlFor="test-page-demo-select">
            <span className="test-page-demo-bar__select-label">Or switch view</span>
            <select
              id="test-page-demo-select"
              className="test-page-demo-bar__select"
              aria-label="Switch test view"
              value={
                location.pathname.startsWith('/test-page/care-demo')
                  ? location.pathname
                  : '/test-page'
              }
              onChange={(e) => navigate(e.target.value)}
            >
              <option value="/test-page">Test charts</option>
              <option value="/test-page/care-demo/login">Care login (welcome)</option>
              <option value="/test-page/care-demo">Care dashboard</option>
            </select>
          </label>
        </div>
      </div>
      <nav className="test-page-toc" aria-label="On this test page">
        <span className="test-page-toc-label">Jump to charts</span>
        <ul className="test-page-toc-list">
          <li className="test-page-toc-list__care-demo">
            <Link to="/test-page/care-demo/login">SkyportCare login — welcome & SSO (demo)</Link>
          </li>
          <li className="test-page-toc-list__care-demo">
            <Link to="/test-page/care-demo">SkyportCare dealer dashboard (demo)</Link>
          </li>
          <li>
            <a href="#test-thermostats-line">Thermostats sold vs connected</a>
          </li>
          <li>
            <a href="#test-skyport-home-users">SkyportHome users (FY26–30)</a>
          </li>
          <li>
            <a href="#test-fusion30-revenue">Fusion30 total revenue (FY26–30)</a>
          </li>
          <li>
            <a href="#test-feedback-volume">User feedback volume</a>
          </li>
          <li>
            <a href="#test-app-suite-end-user-mix">App Suite end-user category mix</a>
          </li>
          <li>
            <a href="#test-app-suite-end-user-mix-dark">App Suite mix by category (compare)</a>
          </li>
          <li>
            <a href="#test-app-suite-skyport-home-mix-dark">SkyportHome — end-user mix (dark)</a>
          </li>
          <li>
            <a href="#test-app-suite-skyport-care-mix-dark">SkyportCare — end-user mix (dark)</a>
          </li>
          <li>
            <a href="#test-license-roadmap">Active license penetration (FY26–30)</a>
          </li>
          <li>
            <a href="#test-penetration-by-year">Active penetration FY23–25</a>
          </li>
          <li>
            <a href="#test-fit-wifi">Wi‑Fi penetration (FIT)</a>
          </li>
        </ul>
      </nav>
      <div className="test-page-tile" id="test-thermostats-line">
        <div
          className={
            thermostatChartDarkBg
              ? 'test-page-thermostats-chart test-page-thermostats-chart--dark-bg'
              : 'test-page-thermostats-chart'
          }
        >
          <div className="test-page-tile-header test-page-thermostats-chart__header">
            <h2 className="test-page-line-chart-title">
              Thermostats Sold vs. Wi-Fi Connected (Cumulative)
            </h2>
            <label className="test-page-thermostats-chart__dark-toggle">
              <input
                type="checkbox"
                checked={thermostatChartDarkBg}
                onChange={(e) => setThermostatChartDarkBg(e.target.checked)}
              />
              <span>Style for dark background</span>
            </label>
          </div>
          <div className="test-page-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={SPARKLINE_QUARTERLY}
                margin={{ top: 8, right: 28, left: 12, bottom: 32 }}
                isAnimationActive={false}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={thermostatChartDarkBg ? 'rgba(248, 250, 252, 0.14)' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  dataKey="idx"
                  domain={LINE_X_DOMAIN}
                  ticks={LINE_X_TICKS}
                  tickFormatter={(v) => SPARKLINE_QUARTERLY[v]?.quarter ?? ''}
                  axisLine={{ stroke: thermostatChartDarkBg ? 'rgba(248, 250, 252, 0.35)' : '#cbd5e1' }}
                  tickLine={false}
                  tick={{ fill: thermostatChartDarkBg ? '#e2e8f0' : '#475569', fontSize: 15 }}
                  allowDecimals={false}
                />
                <YAxis
                  domain={[0, Y_MAX]}
                  ticks={[0, 300_000, 600_000]}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yTickK}
                  width={52}
                  tick={{ fill: thermostatChartDarkBg ? '#cbd5e1' : '#64748b', fontSize: 14 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString('en-US') : value,
                    name === 'sold' ? 'Thermostats sold (cumulative)' : 'Wi‑Fi connected (cumulative)',
                  ]}
                  labelFormatter={(label) =>
                    typeof label === 'number' && SPARKLINE_QUARTERLY[label]
                      ? SPARKLINE_QUARTERLY[label].quarter
                      : label
                  }
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: thermostatChartDarkBg
                      ? '1px solid rgba(248, 250, 252, 0.14)'
                      : '1px solid #e2e8f0',
                    background: thermostatChartDarkBg ? '#0a0a55' : '#fff',
                    color: thermostatChartDarkBg ? '#f1f5f9' : undefined,
                  }}
                  labelStyle={{ color: thermostatChartDarkBg ? '#e2e8f0' : '#334155' }}
                  itemStyle={{ color: thermostatChartDarkBg ? '#f8fafc' : '#0f172a' }}
                  cursor={{ stroke: thermostatChartDarkBg ? 'rgba(248, 250, 252, 0.25)' : '#cbd5e1' }}
                />
                <Line
                  type="monotone"
                  dataKey="sold"
                  name="sold"
                  stroke={thermostatsSoldStroke}
                  strokeWidth={2.25}
                  dot={{
                    r: 3.5,
                    fill: thermostatsSoldStroke,
                    stroke: thermostatsDotRingStroke,
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                >
                  <LabelList content={endLineLabel('Sold', thermostatsSoldStroke)} />
                </Line>
                <Line
                  type="monotone"
                  dataKey="connected"
                  name="connected"
                  stroke={thermostatsConnectedStroke}
                  strokeWidth={2.25}
                  dot={{
                    r: 3.5,
                    fill: thermostatsConnectedStroke,
                    stroke: thermostatsDotRingStroke,
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                >
                  <LabelList content={endLineLabel('Connected', thermostatsConnectedStroke)} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p
            className={
              thermostatChartDarkBg
                ? 'test-page-footnote test-page-footnote--on-dark'
                : 'test-page-footnote'
            }
          >
            FY25 connection rate declined vs FY24 (44% vs 57%)
          </p>
        </div>
      </div>

      <div className="test-page-tile test-page-tile--feedback" id="test-skyport-home-users">
        <h2 className="test-page-feedback-title">
          SkyportHome user growth
          <br />
          (cumulative users at fiscal year-end, FY26–FY30)
        </h2>
        <div className="test-page-feedback-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SKYPORTHOME_USERS_BAR_DATA}
              margin={{ top: 32, right: 12, left: 2, bottom: 10 }}
              barCategoryGap={BAR_CATEGORY_GAP}
              isAnimationActive={false}
            >
              <XAxis
                dataKey="fiscalYear"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 15 }}
                interval={0}
              />
              <YAxis
                domain={[0, SKYPORTHOME_USERS_Y_MAX]}
                ticks={SKYPORTHOME_USERS_Y_TICKS}
                axisLine={false}
                tickLine={false}
                width={52}
                tick={{ fill: '#64748b', fontSize: 14 }}
                tickFormatter={yTickK}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number' ? value.toLocaleString('en-US') : value
                }
                labelFormatter={(label) => label}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar
                dataKey="users"
                name="Cumulative users"
                fill={SKYPORTHOME_USERS_PURPLE}
                radius={[5, 5, 0, 0]}
                maxBarSize={44}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="labelAbove"
                  position="top"
                  fill="#4c1d95"
                  fontSize={13}
                  fontWeight={600}
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="test-page-feedback-footnote">{SKYPORTHOME_USERS_SOURCE}</p>
      </div>

      <div className="test-page-tile test-page-tile--feedback" id="test-fusion30-revenue">
        <h2 className="test-page-feedback-title">
          Fusion30 total revenue
          <br />
          (Digital Platforms model, FY26–FY30)
        </h2>
        <div className="test-page-feedback-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={FUSION30_REVENUE_BAR_DATA}
              margin={{ top: 32, right: 12, left: 2, bottom: 10 }}
              barCategoryGap={BAR_CATEGORY_GAP}
              isAnimationActive={false}
            >
              <XAxis
                dataKey="fiscalYear"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 15 }}
                interval={0}
              />
              <YAxis
                domain={[0, FUSION30_REVENUE_Y_MAX]}
                ticks={FUSION30_REVENUE_Y_TICKS}
                axisLine={false}
                tickLine={false}
                width={56}
                tick={{ fill: '#64748b', fontSize: 14 }}
                tickFormatter={yTickRevenueM}
              />
              <Tooltip
                formatter={(value) => [revenueTooltipFormatter(value), 'Revenue']}
                labelFormatter={(label) => label}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar
                dataKey="revenue"
                name="Total revenue"
                fill={FUSION30_REVENUE_ORANGE}
                radius={[5, 5, 0, 0]}
                maxBarSize={44}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="labelAbove"
                  position="top"
                  fill="#9a3412"
                  fontSize={13}
                  fontWeight={600}
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="test-page-feedback-footnote">{FUSION30_REVENUE_SOURCE}</p>
      </div>

      <div
        className="test-page-tile test-page-tile--feedback test-page-tile--app-suite-dark-wrap"
        id="test-feedback-volume"
      >
        <div className="test-page-app-suite-mix-dark-panel">
          <h2 className="test-page-app-suite-mix-dark-title">User Feedback Volume</h2>
          <div className="test-page-feedback-chart-wrap test-page-feedback-chart-wrap--taller test-page-app-suite-mix-dark-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FEEDBACK_BAR_DATA}
                margin={{ top: 32, right: 12, left: 2, bottom: 10 }}
                barCategoryGap={BAR_CATEGORY_GAP}
                isAnimationActive={false}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.12)" vertical={false} />
                <XAxis
                  dataKey="category"
                  axisLine={{ stroke: '#ffffff' }}
                  tickLine={false}
                  tick={{ fill: '#ffffff', fontSize: 15 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 6000]}
                  ticks={FEEDBACK_Y_TICKS}
                  axisLine={{ stroke: '#ffffff' }}
                  tickLine={false}
                  width={52}
                  tick={{ fill: '#ffffff', fontSize: 14 }}
                  tickFormatter={(v) => v.toLocaleString('en-US')}
                />
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number' ? `~${value.toLocaleString('en-US')}` : value
                  }
                  labelFormatter={(label) => label}
                  contentStyle={APP_SUITE_DARK_TOOLTIP}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(248, 250, 252, 0.06)' }}
                />
                <Bar
                  dataKey="count"
                  name="Volume"
                  fill={THERMOSTAT_LINE_SOLD_ON_DARK}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={BAR_MAX_WIDTH}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="labelAbove"
                    position="top"
                    fill="#0f172a"
                    fontSize={13}
                    fontWeight={600}
                    offset={6}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="test-page-tile test-page-tile--feedback" id="test-app-suite-end-user-mix">
        <h2 className="test-page-feedback-title">
          App Suite roadmap mix by end-user category
          <br />
          <span className="test-page-feedback-subtitle">SkyportHome + SkyportCare (share of effort)</span>
        </h2>
        <div className="test-page-feedback-chart-wrap test-page-feedback-chart-wrap--taller">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={APP_SUITE_END_USER_MIX_DATA}
              margin={{ top: 36, right: 12, left: 2, bottom: 8 }}
              barCategoryGap={BAR_CATEGORY_GAP}
              isAnimationActive={false}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="categoryShort"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 14 }}
                interval={0}
              />
              <YAxis
                domain={[0, APP_SUITE_END_USER_MIX_Y_MAX]}
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fill: '#64748b', fontSize: 13 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value, name, entry) => {
                  if (typeof value !== 'number') return [value, name]
                  const rounded = Math.round(value * 10) / 10
                  const row = entry?.payload
                  const isHome = name === 'SkyportHome'
                  const n = isHome ? row?.homeCount : row?.careCount
                  const countPart = typeof n === 'number' ? ` (${n} feature${n !== 1 ? 's' : ''})` : ''
                  return [`${rounded}%${countPart}`, name]
                }}
                labelFormatter={(_, p) => p?.[0]?.payload?.category ?? ''}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 4 }} />
              <Bar
                dataKey="homePct"
                name="SkyportHome"
                stackId="mix"
                fill={SOLD_COLOR}
                fillOpacity={0.88}
                radius={[0, 0, 0, 0]}
                maxBarSize={BAR_MAX_WIDTH}
                isAnimationActive={false}
              >
                <LabelList content={(p) => (p.payload?.carePct > 0 ? null : appSuiteEndUserMixTopLabel(p))} />
              </Bar>
              <Bar
                dataKey="carePct"
                name="SkyportCare"
                stackId="mix"
                fill={CONNECTED_COLOR}
                fillOpacity={0.88}
                radius={[6, 6, 0, 0]}
                maxBarSize={BAR_MAX_WIDTH}
                isAnimationActive={false}
              >
                <LabelList content={(p) => (p.payload?.carePct > 0 ? appSuiteEndUserMixTopLabel(p) : null)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="test-page-feedback-footnote">{APP_SUITE_END_USER_MIX_SOURCE}</p>
      </div>

      <div className="test-page-tile test-page-tile--feedback" id="test-app-suite-end-user-mix-dark">
        <h2 className="test-page-feedback-title">
          App Suite mix by category (compare)
          <br />
          <span className="test-page-feedback-subtitle">
            SkyportHome and SkyportCare separately · light theme · same data as stacked chart above
          </span>
        </h2>
        <div className="test-page-app-suite-compare-grid">
          <div className="test-page-app-suite-light-panel">
            <h3 className="test-page-app-suite-light-panel__title">SkyportHome</h3>
            <div className="test-page-app-suite-light-panel__chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={APP_SUITE_SPLIT_DATA}
                  margin={{ top: 8, right: 12, left: 8, bottom: 32 }}
                  barCategoryGap={BAR_CATEGORY_GAP}
                  isAnimationActive={false}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, APP_SUITE_SPLIT_Y_MAX]}
                    ticks={APP_SUITE_SPLIT_Y_TICKS}
                    axisLine={{ stroke: '#64748b' }}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13 }}
                    tickFormatter={appSuiteSplitAxisTickNumber}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryShort"
                    width={128}
                    axisLine={{ stroke: '#64748b' }}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value, _name, entry) => {
                      if (typeof value !== 'number') return [value, 'SkyportHome']
                      const rounded = Math.round(value * 10) / 10
                      const row = entry?.payload
                      const n = row?.homeCount
                      const countPart = typeof n === 'number' ? ` (${n} feature${n !== 1 ? 's' : ''})` : ''
                      return [`${rounded}%${countPart}`, 'SkyportHome']
                    }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.category ?? ''}
                    contentStyle={APP_SUITE_LIGHT_TOOLTIP}
                    labelStyle={{ color: '#0f172a' }}
                    itemStyle={{ color: '#0f172a' }}
                    cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }}
                  />
                  <Bar
                    dataKey="homeOnlyPct"
                    name="SkyportHome"
                    fill={APP_SUITE_HOME_BAR_LIGHT}
                    radius={[0, 8, 8, 0]}
                    maxBarSize={BAR_MAX_WIDTH}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="test-page-app-suite-light-panel">
            <h3 className="test-page-app-suite-light-panel__title">SkyportCare</h3>
            <div className="test-page-app-suite-light-panel__chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={APP_SUITE_SPLIT_DATA}
                  margin={{ top: 8, right: 12, left: 8, bottom: 32 }}
                  barCategoryGap={BAR_CATEGORY_GAP}
                  isAnimationActive={false}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, APP_SUITE_SPLIT_Y_MAX]}
                    ticks={APP_SUITE_SPLIT_Y_TICKS}
                    axisLine={{ stroke: '#64748b' }}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13 }}
                    tickFormatter={appSuiteSplitAxisTickNumber}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryShort"
                    width={128}
                    axisLine={{ stroke: '#64748b' }}
                    tickLine={false}
                    tick={{ fill: '#334155', fontSize: 13 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value, _name, entry) => {
                      if (typeof value !== 'number') return [value, 'SkyportCare']
                      const rounded = Math.round(value * 10) / 10
                      const row = entry?.payload
                      const n = row?.careCount
                      const countPart = typeof n === 'number' ? ` (${n} feature${n !== 1 ? 's' : ''})` : ''
                      return [`${rounded}%${countPart}`, 'SkyportCare']
                    }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.category ?? ''}
                    contentStyle={APP_SUITE_LIGHT_TOOLTIP}
                    labelStyle={{ color: '#0f172a' }}
                    itemStyle={{ color: '#0f172a' }}
                    cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }}
                  />
                  <Bar
                    dataKey="careOnlyPct"
                    name="SkyportCare"
                    fill={APP_SUITE_CARE_BAR_LIGHT}
                    radius={[0, 8, 8, 0]}
                    maxBarSize={BAR_MAX_WIDTH}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <p className="test-page-app-suite-compare-footnote">
          Per-product share of in-scope features by pillar (same rows as the stacked chart above). Horizontal scale is
          numeric (percentage points); hover for % and feature counts.
        </p>
      </div>

      <AppSuiteEndUserMixDarkChart
        chartId="test-app-suite-skyport-home-mix-dark"
        title="SkyportHome — roadmap mix by end-user category"
        subtitle="Share of SkyportHome in-scope features (five pillars)"
        pctKey="homeOnlyPct"
        countKey="homeCount"
        productLabel="SkyportHome"
        barFill={THERMOSTAT_LINE_SOLD_ON_DARK}
      />
      <AppSuiteEndUserMixDarkChart
        chartId="test-app-suite-skyport-care-mix-dark"
        title="SkyportCare — roadmap mix by end-user category"
        subtitle="Share of SkyportCare in-scope features (five pillars)"
        pctKey="careOnlyPct"
        countKey="careCount"
        productLabel="SkyportCare"
        barFill={APP_SUITE_CARE_MIX_BAR_ON_DARK}
      />

      <div className="test-page-tile test-page-tile--feedback" id="test-license-roadmap">
        <h2 className="test-page-feedback-title">
          Active License Penetration
          <br />
          (% of connected systems)
        </h2>
        <div className="test-page-feedback-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={LICENSE_ROADMAP_DATA}
              margin={{ top: 32, right: 12, left: 2, bottom: 10 }}
              barCategoryGap={BAR_CATEGORY_GAP}
              isAnimationActive={false}
            >
              <XAxis
                dataKey="fiscalYear"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 15 }}
                interval={0}
              />
              <YAxis
                domain={[0, 20]}
                ticks={LICENSE_ROADMAP_Y_TICKS}
                axisLine={false}
                tickLine={false}
                width={48}
                tick={{ fill: '#64748b', fontSize: 14 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number' ? `${value}% of connected systems` : value
                }
                labelFormatter={(label) => label}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar
                dataKey="pct"
                name="Penetration"
                fill={FEEDBACK_BAR_COLOR}
                radius={[5, 5, 0, 0]}
                maxBarSize={44}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="labelAbove"
                  position="top"
                  fill="#334155"
                  fontSize={13}
                  fontWeight={600}
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="test-page-feedback-footnote">{LICENSE_FOOTNOTE}</p>
        <p className="test-page-feedback-footnote">{LICENSE_ROADMAP_SOURCE}</p>
      </div>

      <div
        className="test-page-tile test-page-tile--feedback test-page-tile--app-suite-dark-wrap"
        id="test-penetration-by-year"
      >
        <div className="test-page-app-suite-mix-dark-panel">
          <h2 className="test-page-app-suite-mix-dark-title">Active penetration rate</h2>
          <p className="test-page-app-suite-mix-dark-sub">
            (% of connected systems, by fiscal year)
          </p>
          <div className="test-page-feedback-chart-wrap test-page-feedback-chart-wrap--taller test-page-app-suite-mix-dark-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PENETRATION_BY_YEAR_DATA}
                margin={{ top: 32, right: 12, left: 2, bottom: 10 }}
                barCategoryGap={BAR_CATEGORY_GAP}
                isAnimationActive={false}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.12)" vertical={false} />
                <XAxis
                  dataKey="fiscalYear"
                  axisLine={{ stroke: '#ffffff' }}
                  tickLine={false}
                  tick={{ fill: '#ffffff', fontSize: 15 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 8]}
                  ticks={PENETRATION_BY_YEAR_Y_TICKS}
                  axisLine={{ stroke: '#ffffff' }}
                  tickLine={false}
                  width={44}
                  tick={{ fill: '#ffffff', fontSize: 14 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) =>
                    typeof value === 'number' ? `${value}% of connected systems` : value
                  }
                  labelFormatter={(label) => label}
                  contentStyle={APP_SUITE_DARK_TOOLTIP}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(248, 250, 252, 0.06)' }}
                />
                <Bar
                  dataKey="pct"
                  name="Penetration rate"
                  fill={THERMOSTAT_LINE_CONNECTED_ON_DARK}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={BAR_MAX_WIDTH}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="labelAbove"
                    position="top"
                    fill="#0f172a"
                    fontSize={13}
                    fontWeight={600}
                    offset={6}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="test-page-app-suite-mix-dark-foot">{PENETRATION_BY_YEAR_SOURCE}</p>
        </div>
      </div>

      <div className="test-page-tile test-page-tile--feedback" id="test-fit-wifi">
        <h2 className="test-page-feedback-title">
          Wi‑Fi Connected Thermostat Penetration
          <br />
          (FIT only)
        </h2>
        <div className="test-page-feedback-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={FIT_WIFI_PENETRATION_DATA}
              margin={{ top: 32, right: 12, left: 2, bottom: 10 }}
              barCategoryGap={BAR_CATEGORY_GAP}
              isAnimationActive={false}
            >
              <XAxis
                dataKey="fiscalYear"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 15 }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                ticks={FIT_WIFI_PENETRATION_Y_TICKS}
                axisLine={false}
                tickLine={false}
                width={48}
                tick={{ fill: '#64748b', fontSize: 14 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number' ? `${value}% (FIT)` : value
                }
                labelFormatter={(label) => label}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar
                dataKey="pct"
                name="Penetration"
                fill={CONNECTED_COLOR}
                radius={[5, 5, 0, 0]}
                maxBarSize={44}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="labelAbove"
                  position="top"
                  fill="#334155"
                  fontSize={13}
                  fontWeight={600}
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  )
}
