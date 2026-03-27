/**
 * Digital Platforms business model — FY26–FY30 funnel columns + yearly forecast chart (FY26–FY30).
 * SkyportHome total users and SkyportCare bundled / 1‑year / lifetime EOY counts match the business model sheet;
 * bundled counts are stored explicitly so totals align with penetration display. Inception‑to‑FY25 uses historical snapshots.
 */

export const DP_BUSINESS_MODEL_COLUMN_LABELS = [
  'Inception to FY25',
  'FY26',
  'FY27',
  'FY28',
  'FY29',
  'FY30',
]

function parsePctLabelToDecimal(label) {
  const n = parseFloat(String(label).replace(/%/g, ''), 10)
  return Number.isFinite(n) ? n / 100 : 0
}

/**
 * FY26–FY30 forecast inputs (EOY). SkyportHome total users + SkyportCare license EOYs match the Digital Platforms
 * business model sheet. Bundled active licenses use explicit counts where listed; otherwise round(users × penetration).
 */
const DP_FUNNEL_FORECAST_INPUTS_FY26_FY30 = [
  {
    id: 'FY26',
    label: 'FY26',
    fyThermostatsSold: 240_000,
    fyConnectedNew: 144_000,
    totalUsers: 467_335,
    activeLicensePenetrationLabel: '6%',
    bundledActiveLicensesEoy: 28_040,
    oneYearActiveLicensesEoy: 2_804,
    lifetimeActiveLicensesEoy: 6_543,
    paidAnnualPenetrationLabel: '0.6%',
    paidLifetimePenetrationLabel: '1.4%',
  },
  {
    id: 'FY27',
    label: 'FY27',
    fyThermostatsSold: 350_000,
    fyConnectedNew: 227_500,
    totalUsers: 719_310,
    activeLicensePenetrationLabel: '8%',
    bundledActiveLicensesEoy: 57_544,
    oneYearActiveLicensesEoy: 10_790,
    lifetimeActiveLicensesEoy: 17_983,
    paidAnnualPenetrationLabel: '1.5%',
    paidLifetimePenetrationLabel: '2.5%',
  },
  {
    id: 'FY28',
    label: 'FY28',
    fyThermostatsSold: 500_000,
    fyConnectedNew: 350_000,
    totalUsers: 1_147_110,
    activeLicensePenetrationLabel: '11%',
    bundledActiveLicensesEoy: 126_182,
    oneYearActiveLicensesEoy: 28_678,
    lifetimeActiveLicensesEoy: 40_149,
    paidAnnualPenetrationLabel: '2.5%',
    paidLifetimePenetrationLabel: '3.5%',
  },
  {
    id: 'FY29',
    label: 'FY29',
    fyThermostatsSold: 600_000,
    fyConnectedNew: 450_000,
    totalUsers: 1_781_610,
    activeLicensePenetrationLabel: '14%',
    bundledActiveLicensesEoy: 249_426,
    oneYearActiveLicensesEoy: 62_356,
    lifetimeActiveLicensesEoy: 80_172,
    paidAnnualPenetrationLabel: '3.5%',
    paidLifetimePenetrationLabel: '4.5%',
  },
  {
    id: 'FY30',
    label: 'FY30',
    fyThermostatsSold: 700_000,
    fyConnectedNew: 560_000,
    totalUsers: 2_612_410,
    activeLicensePenetrationLabel: '18%',
    bundledActiveLicensesEoy: 470_233,
    oneYearActiveLicensesEoy: 130_621,
    lifetimeActiveLicensesEoy: 182_869,
    paidAnnualPenetrationLabel: '5.0%',
    paidLifetimePenetrationLabel: '7.0%',
  },
]

/** FY26–FY30: bundled EOY from inputs (sheet-aligned); falls back to round(users × penetration) if omitted. */
export const DP_FUNNEL_FORECAST_COLUMNS = DP_FUNNEL_FORECAST_INPUTS_FY26_FY30.map((row) => {
  const { totalUsers, bundledActiveLicensesEoy: bundledIn, ...rest } = row
  const bundledActiveLicensesEoy =
    bundledIn ??
    Math.round(totalUsers * parsePctLabelToDecimal(row.activeLicensePenetrationLabel))
  return { ...rest, bundledActiveLicensesEoy, totalUsers }
})

export const DP_FUNNEL_FORECAST_BY_ID = Object.fromEntries(
  DP_FUNNEL_FORECAST_COLUMNS.map((c) => [c.id, c]),
)

/** End-of-year cumulative snapshots (business model “Total …” rows + SkyportCare license components). */
const YEAR_END_SNAPSHOTS = [
  {
    key: 'FY25',
    totalThermostatsSold: 610_064,
    totalConnected: 341_000,
    totalUsers: 317_130,
    bundledActiveLicenses: 9_545,
    oneYearActiveLicenses: 318,
    lifetimeActiveLicenses: 3_320,
  },
  {
    key: 'FY26',
    totalThermostatsSold: 850_064,
    totalConnected: 485_000,
    totalUsers: DP_FUNNEL_FORECAST_COLUMNS[0].totalUsers,
    bundledActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[0].bundledActiveLicensesEoy,
    oneYearActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[0].oneYearActiveLicensesEoy,
    lifetimeActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[0].lifetimeActiveLicensesEoy,
  },
  {
    key: 'FY27',
    totalThermostatsSold: 1_200_064,
    totalConnected: 712_500,
    totalUsers: DP_FUNNEL_FORECAST_COLUMNS[1].totalUsers,
    bundledActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[1].bundledActiveLicensesEoy,
    oneYearActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[1].oneYearActiveLicensesEoy,
    lifetimeActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[1].lifetimeActiveLicensesEoy,
  },
  {
    key: 'FY28',
    totalThermostatsSold: 1_700_064,
    totalConnected: 1_062_500,
    totalUsers: DP_FUNNEL_FORECAST_COLUMNS[2].totalUsers,
    bundledActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[2].bundledActiveLicensesEoy,
    oneYearActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[2].oneYearActiveLicensesEoy,
    lifetimeActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[2].lifetimeActiveLicensesEoy,
  },
  {
    key: 'FY29',
    totalThermostatsSold: 2_300_064,
    totalConnected: 1_512_500,
    totalUsers: DP_FUNNEL_FORECAST_COLUMNS[3].totalUsers,
    bundledActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[3].bundledActiveLicensesEoy,
    oneYearActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[3].oneYearActiveLicensesEoy,
    lifetimeActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[3].lifetimeActiveLicensesEoy,
  },
  {
    key: 'FY30',
    totalThermostatsSold: 3_000_064,
    totalConnected: 2_072_500,
    totalUsers: DP_FUNNEL_FORECAST_COLUMNS[4].totalUsers,
    bundledActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[4].bundledActiveLicensesEoy,
    oneYearActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[4].oneYearActiveLicensesEoy,
    lifetimeActiveLicenses: DP_FUNNEL_FORECAST_COLUMNS[4].lifetimeActiveLicensesEoy,
  },
].map((s) => ({
  ...s,
  activeLicenses: s.bundledActiveLicenses + s.oneYearActiveLicenses + s.lifetimeActiveLicenses,
}))

/**
 * FY26–FY30 columns for the installed-base forecast funnel table.
 * Active license rows (total + bundled / 1‑year / lifetime) use fiscal year‑end model counts — same basis as SkyportCare in the business model.
 */
export function getDigitalPlatformsForecastFunnelColumnsForTable() {
  return DP_FUNNEL_FORECAST_COLUMNS.map((c) => {
    const currSnap = YEAR_END_SNAPSHOTS.find((s) => s.key === c.id)
    const connectedPct =
      c.fyThermostatsSold > 0 ? (c.fyConnectedNew / c.fyThermostatsSold) * 100 : 0
    return {
      id: c.id,
      label: c.label,
      fyThermostatsSold: c.fyThermostatsSold,
      fyConnectedNew: c.fyConnectedNew,
      connectedPct,
      activeLicensePenetrationLabel: c.activeLicensePenetrationLabel,
      activeLicensesEoy: currSnap.activeLicenses,
      bundledActiveLicensesEoy: c.bundledActiveLicensesEoy,
      oneYearActiveLicensesEoy: c.oneYearActiveLicensesEoy,
      lifetimeActiveLicensesEoy: c.lifetimeActiveLicensesEoy,
      paidAnnualPenetrationLabel: c.paidAnnualPenetrationLabel,
      paidLifetimePenetrationLabel: c.paidLifetimePenetrationLabel,
    }
  })
}

/**
 * FY26–FY30 only: one point per fiscal year. FY activity: sold, connected, net‑new users, net‑new active licenses
 * (users & licenses vs prior FY EOY); right chart carries EOY cumulative totals.
 * @returns {{ period: string, fyThermostatsAllBrands: number, fyConnectedThermostats: number, fySkyportHomeUsers: number, fyActiveLicensesNetNew: number, fyBundledActiveLicensesNetNew: number, fyOneYearActiveLicensesNetNew: number, fyLifetimeActiveLicensesNetNew: number }[]}
 */
export function getDigitalPlatformsForecastYearlyChartData() {
  const fyByKey = Object.fromEntries(DP_FUNNEL_FORECAST_COLUMNS.map((c) => [c.id, c]))
  return YEAR_END_SNAPSHOTS.filter((s) => s.key !== 'FY25').map((s) => {
    const fy = fyByKey[s.key]
    const snapIdx = YEAR_END_SNAPSHOTS.findIndex((x) => x.key === s.key)
    const prevSnap = snapIdx > 0 ? YEAR_END_SNAPSHOTS[snapIdx - 1] : null
    const fySkyportHomeUsers = prevSnap ? Math.max(0, s.totalUsers - prevSnap.totalUsers) : 0
    const fyBundledActiveLicensesNetNew = prevSnap
      ? Math.max(0, s.bundledActiveLicenses - prevSnap.bundledActiveLicenses)
      : 0
    const fyOneYearActiveLicensesNetNew = prevSnap
      ? Math.max(0, s.oneYearActiveLicenses - prevSnap.oneYearActiveLicenses)
      : 0
    const fyLifetimeActiveLicensesNetNew = prevSnap
      ? Math.max(0, s.lifetimeActiveLicenses - prevSnap.lifetimeActiveLicenses)
      : 0
    const fyActiveLicensesNetNew = prevSnap ? Math.max(0, s.activeLicenses - prevSnap.activeLicenses) : 0
    return {
      period: s.key,
      fyThermostatsAllBrands: fy?.fyThermostatsSold ?? 0,
      fyConnectedThermostats: fy?.fyConnectedNew ?? 0,
      fySkyportHomeUsers,
      fyActiveLicensesNetNew,
      fyBundledActiveLicensesNetNew,
      fyOneYearActiveLicensesNetNew,
      fyLifetimeActiveLicensesNetNew,
    }
  })
}

/**
 * FY25–FY30 fiscal year‑end cumulative snapshots (model + historical FY25). Right “All‑Time” outlook chart.
 * @returns {{ period: string, cumulative: number, connectedCumulative: number, usersCumulative: number, activeLicensesCumulative: number, bundledActiveLicensesCumulative: number, oneYearActiveLicensesCumulative: number, lifetimeActiveLicensesCumulative: number }[]}
 */
export function getDigitalPlatformsForecastCumulativeChartData() {
  return YEAR_END_SNAPSHOTS.map((s) => ({
    period: s.key,
    cumulative: s.totalThermostatsSold,
    connectedCumulative: s.totalConnected,
    usersCumulative: s.totalUsers,
    activeLicensesCumulative: s.activeLicenses,
    bundledActiveLicensesCumulative: s.bundledActiveLicenses,
    oneYearActiveLicensesCumulative: s.oneYearActiveLicenses,
    lifetimeActiveLicensesCumulative: s.lifetimeActiveLicenses,
  }))
}
