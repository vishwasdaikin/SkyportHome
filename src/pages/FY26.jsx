import { useState, useLayoutEffect, useEffect, useRef } from 'react'
import { useParams, Navigate, Link, NavLink, useLocation } from 'react-router-dom'
import { FY26_BASE, FY26_NAV_ITEMS, FY26_TOP_NAV_IDS, FY26_TOP_NAV_TITLES } from '../constants/fy26Nav'
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
  Legend,
  Cell,
  useXAxisScale,
  useYAxisScale,
} from 'recharts'
import './DigitalStrategy.css'
import './FY26.css'

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
  10_265, 10_400, 10_584, 10_720, 10_917, 11_076, 11_280, 11_521, 11_833, 11_963, 12_165,
]

/** Fiscal quarter-end month indices in FY (0=Apr … 11=Mar): Q1 Jun=2, Q2 Sep=5, Q3 Dec=8, Q4 Mar=11. */
const FY_FISCAL_QUARTER_END_MONTH_INDEX = [2, 5, 8, 11]

/** SkyportHome users count (dot between Q3 and Q4 FY25; value also on Q4 row for tooltip). */
const SKYPORTHOME_ALL_TIME_VALUE = 280_000

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

/** Tooltip / legend copy for SkyportHome users point (~280K). */
const SKYPORTHOME_ALL_TIME_ACCOUNTS_CALLOUT = 'SkyportHome Accounts: ~280K'
/** Inline label on the all-time chart (same style as other series end labels). */
const SKYPORTHOME_ALL_TIME_POINT_LABEL = 'SkyportHome ~280K'

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
  { id: 'FY25', label: 'FY25' },
  { id: 'FY24', label: 'FY24' },
  { id: 'FY23', label: 'FY23' },
]

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
 * FY funnel (right card): in‑FY units sold; net new connected & active licenses from Apr through last reported month,
 * as % of in‑FY sold (matches prior FY25 ~44% / ~1.2% pattern from cumulative series).
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

/** Rounded “~72K” / “~2K” style for funnel parentheses. */
function formatFunnelTildeAbs(n) {
  if (!Number.isFinite(n) || n < 0) return '(~0)'
  if (n >= 1_000_000) return `(~${Math.round(n / 100_000) / 10}M)`
  if (n >= 1000) return `(~${Math.round(n / 1000)}K)`
  return `(~${Math.round(n).toLocaleString()})`
}

function InstalledBaseFunnelTable({ allTimeFunnel }) {
  const fyCols = THERMOSTAT_FY_TABS.map((tab) => ({
    ...tab,
    m: getFyActivationFunnelMetrics(tab.id),
  }))

  return (
    <div className="fy25-funnel-table-scroll">
      <table className="fy25-funnel-table">
        <thead>
          <tr>
            <th scope="col" className="fy25-funnel-table-th-metric">
              Metric
            </th>
            <th scope="col" className="fy25-funnel-table-th-data">
              All‑Time
            </th>
            {THERMOSTAT_FY_TABS.map((tab) => (
              <th key={tab.id} scope="col" className="fy25-funnel-table-th-data">
                {tab.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              Thermostats sold
            </th>
            <td className="fy25-funnel-table-num">{allTimeFunnel.total.toLocaleString()}</td>
            {fyCols.map(({ id, m }) => (
              <td key={id} className="fy25-funnel-table-num">
                {m ? m.sold.toLocaleString() : '—'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="fy25-funnel-table-rowhead">
              Connected to Cloud / App
            </th>
            <td className="fy25-funnel-table-stack">
              <span className="fy25-funnel-table-pct">{formatFunnelPctForDisplay(allTimeFunnel.pctConnected)}</span>
              <span className="fy25-funnel-table-abs">{formatFunnelTildeAbs(allTimeFunnel.connected)}</span>
            </td>
            {fyCols.map(({ id, m }) => (
              <td key={id} className="fy25-funnel-table-stack">
                {m ? (
                  <>
                    <span className="fy25-funnel-table-pct">{formatFunnelPctForDisplay(m.connectedPct)}</span>
                    <span className="fy25-funnel-table-abs">{formatFunnelTildeAbs(m.connectedNew)}</span>
                  </>
                ) : (
                  <span className="fy25-funnel-table-na">—</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="fy25-funnel-table-tr-last">
            <th scope="row" className="fy25-funnel-table-rowhead">
              Active Cloud Services licenses
            </th>
            <td className="fy25-funnel-table-stack">
              <span className="fy25-funnel-table-pct fy25-funnel-table-pct--emph">
                {formatFunnelPctForDisplay(allTimeFunnel.pctActiveOfConnected)}
              </span>
              <span className="fy25-funnel-table-abs">{formatFunnelTildeAbs(allTimeFunnel.active)}</span>
            </td>
            {fyCols.map(({ id, m }) => (
              <td key={id} className="fy25-funnel-table-stack">
                {m ? (
                  <>
                    <span className="fy25-funnel-table-pct fy25-funnel-table-pct--emph">
                      {formatFunnelPctForDisplay(m.activePct)}
                    </span>
                    <span className="fy25-funnel-table-abs">{formatFunnelTildeAbs(m.activeNew)}</span>
                  </>
                ) : (
                  <span className="fy25-funnel-table-na">—</span>
                )}
              </td>
            ))}
          </tr>
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

const FY26_INPAGE_HASH_IDS = ['fy25-review', 'fy26-plan', 'fusion30-summary']

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

function SkyportHomeUserFeedbackCard() {
  const [showFeedbackBreakdown, setShowFeedbackBreakdown] = useState(false)
  const expandBtnId = 'skyport-home-feedback-expand-btn'
  const expandPanelId = 'skyport-home-feedback-expand-panel'

  return (
    <div className="fy25-skyport-home-card">
      <div className="fy25-skyport-home-card-header">
        <h4 className="fy25-skyport-home-title">SkyportHome User Sentiment</h4>
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
        left: 52,
        bottom: 12,
      }}
      {...{ overflow: 'visible' }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" fill="#fff" />
      <XAxis dataKey="month" interval={0} height={28} tick={FY26_RECHARTS_X_TICK} tickMargin={6} />
      <YAxis
        yAxisId="left"
        orientation="left"
        width={52}
        tick={FY26_RECHARTS_AXIS_TICK}
        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
        label={({ viewBox }) => {
          if (!viewBox || viewBox.height == null) return null
          const { x = 0, y = 0, width = 0, height = 0 } = viewBox
          const cx = x + width / 2
          const cy = y + height / 2
          const labelInset = 14
          const dual = thermostatChartHasLicenseSeries(fyRows)
          return (
            <g transform={`translate(${cx - labelInset}, ${cy}) rotate(-90)`}>
              <text x={0} y={0} textAnchor="middle" fontSize={12} fill="#6b7280" fontWeight={500}>
                {dual ? (
                  <>
                    <tspan x={0} dy={-10}>
                      Thermostats sold
                    </tspan>
                    <tspan x={0} dy={20}>
                      Active licenses
                    </tspan>
                  </>
                ) : (
                  <tspan x={0} dy={0}>
                    Thermostats sold
                  </tspan>
                )}
              </text>
            </g>
          )
        }}
      />
      <Tooltip content={FyMonthlyChartTooltip} cursor={{ fill: '#fff' }} />
      <Bar yAxisId="left" dataKey="sold" name="Thermostats sold" fill="rgba(0, 151, 224, 0.38)" radius={[4, 4, 0, 0]} />
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
        x={cx - 10}
        y={cy + 18}
        textAnchor="end"
        dominantBaseline="hanging"
        fontSize={11}
        fill={FY26_SKYPORTHOME_USERS_LINE_COLOR}
        fontWeight={600}
      >
        {SKYPORTHOME_ALL_TIME_POINT_LABEL}
      </text>
    </g>
  )
}

/** Right All-Time: all three series on one left Y scale (counts). */
function ThermostatRightAllTimeQuarterlyChart() {
  return (
    <LineChart
      data={ALL_TIME_RIGHT_QUARTERLY_SPAN}
      margin={{ top: 22, right: 20, left: 10, bottom: 4 }}
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
        width={52}
        tick={FY26_RECHARTS_QUARTERLY_AXIS_TICK}
        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
        label={({ viewBox }) => {
          if (!viewBox || viewBox.height == null) return null
          const { x = 0, y = 0, width = 0, height = 0 } = viewBox
          const cx = x + width / 2
          const cy = y + height / 2
          return (
            <g transform={`translate(${cx - 8}, ${cy}) rotate(-90)`}>
              <text x={0} y={0} textAnchor="middle" fontSize={12} fill="#6b7280" fontWeight={500}>
                <tspan x={0} dy={-14}>
                  All series
                </tspan>
                <tspan x={0} dy={14}>
                  (same scale)
                </tspan>
              </text>
            </g>
          )
        }}
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
              Total sold
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
  const [thermostatChartTabId, setThermostatChartTabId] = useState('FY25')
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
  if (!isValid) return <Navigate to={`${FY26_BASE}/res-solutions`} replace />

  const isDigitalPlatform = sectionId === 'digital-platform'

  const allTimeFunnel = getAllTimeFunnelSnapshot()

  useLayoutEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!FY26_INPAGE_HASH_IDS.includes(id)) return
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [location.hash])

  return (
    <article className={`fy26-page${isDigitalPlatform ? '' : ' fy26-page--simple'}`}>
      <header className="ds-header fy26-header">
        <div className="fy26-header-title-row">
          <div className="fy26-header-title-cluster">
            <Fy26PlaybookTitleDropdown sectionId={sectionId} />
            <nav className="fy26-inpage-nav" aria-label="Page sections">
              <a href="#fy25-review">FY25 Review</a>
              <a href="#fy26-plan">FY26 Plan</a>
              <a href="#fusion30-summary">Fusion30 Summary</a>
            </nav>
          </div>
        </div>
      </header>
      <div key={sectionId} className="fy26-page-transition-surface">
        <div className="ds-layout fy26-layout">
        <div className="ds-sections">
          <section className="ds-section ds-section-single">
            <div className="ds-section-header" id="fy25-review">
              <span className="ds-section-badge">1</span>
              <h2 className="ds-section-title ds-section-title-single">
                {sectionId === 'digital-platform' ? 'FY25 Review — Execution Reality' : 'FY25 Review'}
              </h2>
            </div>
            {sectionId === 'digital-platform' ? (
            <div className="fy25-review-body">
              <div className="fy25-graphs-row">
                <div className="fy25-visual fy25-funnel fy25-funnel--combined">
                  <h5 className="fy25-visual-title fy25-funnel-combined-title">
                    Installed Base Activation Funnel
                  </h5>
                  <InstalledBaseFunnelTable allTimeFunnel={allTimeFunnel} />
                </div>
              </div>

              <div className="fy25-monthly-chart-wrap">
                <h5 className="fy25-visual-title fy25-chart-main-heading" id="thermostat-sales-chart-heading">
                  Thermostat sales &amp; SkyportCare adoption
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
                        All-Time
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
                <div className="fy25-takeaway fy25-takeaway--thermostat-opportunity">
                  <p className="fy25-takeaway-paragraph">
                    <strong className="fy25-takeaway-inline-label">Opportunity:</strong>{' '}
                    Closing the activation gap converts existing hardware volume into recurring digital value.
                  </p>
                </div>
              </div>

              <div className="fy25-skyport-home-wrap" id="skyport-home">
                <SkyportHomeUserFeedbackCard />
              </div>

              <div className="fy25-planned-full">
                <div className="fy25-planned-card">
                  <div className="fy25-planned-header">
                    <h4 className="fy25-planned-card-title">Planned vs Actual initiatives</h4>
                    <div className="fy25-planned-bulk-actions">
                      <button
                        type="button"
                        className="fy26-strategic-themes-bulk-btn"
                        onClick={() => setShowPlannedDetails((v) => !v)}
                        aria-expanded={showPlannedDetails}
                      >
                        {showPlannedDetails
                          ? 'Collapse initiative details'
                          : 'Expand to view initiative details'}
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
              <h2 className="ds-section-title ds-section-title-single">FY26 Plan – Operating Focus</h2>
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
                                  Establish 100% coverage of monthly engagement measurement across connected
                                  homeowners and drive consistent engagement at scale.
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
                                  Monthly active users (MAU), % of connected systems with ≥1 meaningful monthly
                                  action, insight / report interaction rate
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
                                  Increase active license penetration from ~1% today to low double‑digit levels
                                  (~10–12%) across connected systems.
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
                                  Active license penetration (% of connected systems), Net new active licenses
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
                                  Achieve ~$18M in recurring digital revenue through{' '}
                                  <strong>SkyportCare</strong> licensing in FY26.
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
                                  Digital ARR, License renewal rate, Revenue per connected system
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
                                  per‑home value.
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
                  <div className="fy26-mini-card fy26-strategic-themes-box">
                    <div className="fy26-strategic-themes-header">
                      <h4 className="fy26-mini-card-title fy26-mini-card-title--letter-badge">
                        <span className="fy26-plan-letter-badge">B</span>
                        <span>Strategic Themes</span>
                      </h4>
                    </div>
                    <ul className="fy26-strategic-themes-list">
                      <li>
                        <span className="fy26-strategic-themes-lead">Activation &amp; Onboarding:</span> Moves
                        systems from connected to activated, directly driving active license adoption and recurring
                        digital revenue.
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
                  <div className="fy26-mini-card">
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
                              Focus Timeframe
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
                      <strong>Note:</strong> Focus Timeframe indicates execution focus and sequencing within FY26.
                      &ldquo;Ongoing&rdquo; items represent operating model changes and cadence, not discrete
                      feature delivery milestones.
                    </p>
                    <p className="fy26-execution-plan-footnote">
                      Detailed{' '}
                      <Link to="/apps/skyport-home" className="fy26-execution-plan-product-link">
                        <strong>SkyportHome</strong>
                      </Link>{' '}
                      and{' '}
                      <Link to="/apps/skyport-care" className="fy26-execution-plan-product-link">
                        <strong>SkyportCare</strong>
                      </Link>{' '}
                      features and capabilities are documented on the product pages and are not repeated here.
                    </p>
                  </div>
                  <div className="fy26-mini-card">
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
          <section className="ds-section ds-section-single">
            <div className="ds-section-header" id="fusion30-summary">
              <span className="ds-section-badge">3</span>
              <h2 className="ds-section-title ds-section-title-single">Fusion30 Summary - Strategic Horizon</h2>
            </div>
            {isDigitalPlatform ? (
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
                  <li>Achieve ~70%+ sustained digital service adoption across connected systems</li>
                  <li>Build a $150M+ recurring digital revenue stream</li>
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
                    Use <strong>SkyportHome</strong> for homeowner engagement and <strong>SkyportCare</strong> for
                    dealer execution
                  </li>
                  <li>
                    Operate with product‑led ownership and outcome‑based prioritization
                  </li>
                  <li>
                    Convert connectivity into activation, engagement, and monetization across ~2M connected homes
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
        </div>
      </div>
      </div>
    </article>
  )
}
