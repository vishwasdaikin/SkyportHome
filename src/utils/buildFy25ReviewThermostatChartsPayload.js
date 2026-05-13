/**
 * Build FY25 Review thermostat chart payloads from `Test.xlsx` FY23 / FY24 / FY25 sheet grids
 * (`header: 1`, string cells). Used by export script + Vite dev middleware.
 */

/** FY fiscal quarter-end month indices (0 = April … 11 = March): Q1 Jun, Q2 Sep, Q3 Dec, Q4 Mar. */
export const FY_FISCAL_QUARTER_END_MONTH_INDEX = [2, 5, 8, 11]

function parseCellNumber(v) {
  if (v == null || v === '') return null
  const s = String(v).trim().replace(/[$,\s%]/g, '')
  if (s === '' || s === '-' || /^nan$/i.test(s)) return null
  const n = Number(s.replace(/[()]/g, ''))
  return Number.isFinite(n) ? n : null
}

/** Apr…Mar labels: FY23 → Apr'23 … Mar'24. */
export function fiscalMonthLabelsForFy(fyTwoDigit) {
  const startYear = 2000 + fyTwoDigit
  const parts = [
    ['Apr', startYear],
    ['May', startYear],
    ['Jun', startYear],
    ['Jul', startYear],
    ['Aug', startYear],
    ['Sep', startYear],
    ['Oct', startYear],
    ['Nov', startYear],
    ['Dec', startYear],
    ['Jan', startYear + 1],
    ['Feb', startYear + 1],
    ['Mar', startYear + 1],
  ]
  return parts.map(([m, y]) => `${m}'${String(y).slice(-2)}`)
}

function findMonthHeaderRowIndex(grid) {
  if (!Array.isArray(grid)) return -1
  for (let ri = 0; ri < grid.length; ri++) {
    const row = grid[ri]
    if (!Array.isArray(row)) continue
    for (let c = 1; c < Math.min(row.length, 16); c++) {
      if (String(row[c] ?? '').trim() === 'April') return ri
    }
  }
  return -1
}

function rowIndexByLabel(grid, re) {
  if (!Array.isArray(grid)) return -1
  for (let ri = 0; ri < grid.length; ri++) {
    const label = String(grid[ri]?.[0] ?? '').trim()
    if (re.test(label)) return ri
  }
  return -1
}

function monthValuesFromRow(grid, rowIdx, count = 12) {
  const row = grid[rowIdx]
  if (!Array.isArray(row)) return []
  const out = []
  for (let i = 0; i < count; i++) {
    const v = parseCellNumber(row[i + 1])
    out.push(v)
  }
  return out
}

/**
 * @param {string[][]} grid
 * @param {number} fyTwoDigit e.g. 23 for FY23
 */
export function extractOneFySheet(grid, fyTwoDigit) {
  const hdrIdx = findMonthHeaderRowIndex(grid)
  if (hdrIdx < 0) return null

  const monthlySoldRi = rowIndexByLabel(grid, /Monthly.*Thermostat/i)
  const totalRi = rowIndexByLabel(grid, /Total Daikin One Sales \(All-time\)/i)
  const connRi = rowIndexByLabel(grid, /Total D\/A\/G Thermostats Connected/i)
  const activeRi = rowIndexByLabel(grid, /Active Cloud Services Plans \(EOM\)/i)

  if (monthlySoldRi < 0 || totalRi < 0 || connRi < 0 || activeRi < 0) return null

  const labels = fiscalMonthLabelsForFy(fyTwoDigit)
  const soldVals = monthValuesFromRow(grid, monthlySoldRi)
  const activeVals = monthValuesFromRow(grid, activeRi)
  const totalCum = monthValuesFromRow(grid, totalRi).map((n) => (n == null ? null : n))
  const connCum = monthValuesFromRow(grid, connRi).map((n) => (n == null ? null : n))
  const actCum = monthValuesFromRow(grid, activeRi).map((n) => (n == null ? null : n))

  const n = Math.min(
    labels.length,
    soldVals.length,
    activeVals.length,
    totalCum.length,
    connCum.length,
    actCum.length,
  )

  const monthlyRows = []
  for (let i = 0; i < n; i++) {
    const sold = soldVals[i] ?? 0
    const activeLicenses = activeVals[i] ?? 0
    monthlyRows.push({ month: labels[i], sold, activeLicenses })
  }

  const trimTrailingEmpty = (arr) => {
    let len = arr.length
    while (len > 0 && arr[len - 1] == null) len--
    return arr.slice(0, len)
  }

  return {
    monthlyRows,
    totalThermostatsCumulativeMonthly: trimTrailingEmpty(totalCum),
    connectedThermostatsCumulativeMonthly: trimTrailingEmpty(connCum),
    activeLicensesCumulativeMonthly: trimTrailingEmpty(actCum),
  }
}

/** Same marker as FY26.jsx — purple SkyportHome dot on Q4 FY25. */
export const SKYPORTHOME_ALL_TIME_VALUE_FOR_Q4_FY25 = 317_130

/**
 * @param {Array<{ suffix: string, months: (number|null)[], connectedMonths: (number|null)[], activeLicensesMonths: (number|null)[] }>} segments
 */
export function buildAllTimeRightQuarterlySpan(segments, skyportHomeValue = SKYPORTHOME_ALL_TIME_VALUE_FOR_Q4_FY25) {
  const rows = []
  const q4MonthIdx = FY_FISCAL_QUARTER_END_MONTH_INDEX[3]
  const q3MonthIdx = FY_FISCAL_QUARTER_END_MONTH_INDEX[2]

  for (const { suffix, months, connectedMonths, activeLicensesMonths } of segments) {
    if (!Array.isArray(months) || months.length === 0) continue
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
            rows.push({
              period: `Q4 ${suffix}`,
              cumulative: months[mi],
              connectedCumulative: conn,
              activeLicensesCumulative: act,
              q4PartialNote: 'Partial Q4 (Mar quarter-end pending)',
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
    q4Fy25.skyportHomeUsers = skyportHomeValue
  }
  return rows
}

/**
 * @param {Record<string, string[][]>} grids sheet name → grid (header row 1 style)
 * @returns {object | null}
 */
export function buildFy25ReviewThermostatChartsPayload(grids) {
  const fy23 = extractOneFySheet(grids.FY23, 23)
  const fy24 = extractOneFySheet(grids.FY24, 24)
  const fy25 = extractOneFySheet(grids.FY25, 25)
  if (!fy23 || !fy24 || !fy25) return null

  const segments = [
    {
      suffix: "'23",
      months: fy23.totalThermostatsCumulativeMonthly,
      connectedMonths: fy23.connectedThermostatsCumulativeMonthly,
      activeLicensesMonths: fy23.activeLicensesCumulativeMonthly,
    },
    {
      suffix: "'24",
      months: fy24.totalThermostatsCumulativeMonthly,
      connectedMonths: fy24.connectedThermostatsCumulativeMonthly,
      activeLicensesMonths: fy24.activeLicensesCumulativeMonthly,
    },
    {
      suffix: "'25",
      months: fy25.totalThermostatsCumulativeMonthly,
      connectedMonths: fy25.connectedThermostatsCumulativeMonthly,
      activeLicensesMonths: fy25.activeLicensesCumulativeMonthly,
    },
  ]

  const allTimeRightQuarterlySpan = buildAllTimeRightQuarterlySpan(segments)

  return {
    version: 1,
    thermostatSalesChartData: {
      FY23: fy23.monthlyRows,
      FY24: fy24.monthlyRows,
      FY25: fy25.monthlyRows,
    },
    fy23TotalThermostatsCumulativeMonthly: fy23.totalThermostatsCumulativeMonthly,
    fy24TotalThermostatsCumulativeMonthly: fy24.totalThermostatsCumulativeMonthly,
    fy25TotalThermostatsCumulativeMonthly: fy25.totalThermostatsCumulativeMonthly,
    fy23ConnectedThermostatsCumulativeMonthly: fy23.connectedThermostatsCumulativeMonthly,
    fy24ConnectedThermostatsCumulativeMonthly: fy24.connectedThermostatsCumulativeMonthly,
    fy25ConnectedThermostatsCumulativeMonthly: fy25.connectedThermostatsCumulativeMonthly,
    fy23ActiveLicensesCumulativeMonthly: fy23.activeLicensesCumulativeMonthly,
    fy24ActiveLicensesCumulativeMonthly: fy24.activeLicensesCumulativeMonthly,
    fy25ActiveLicensesCumulativeMonthly: fy25.activeLicensesCumulativeMonthly,
    allTimeRightQuarterlySpan,
  }
}
