import { withYearEndSnapshotActiveLicenses } from './digitalPlatformsForecastFunnel'

const PERIOD_KEYS = ['FY25', 'FY26', 'FY27', 'FY28', 'FY29', 'FY30']

/** @param {string | null | undefined} s */
function normalizeLabel(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\u2011/g, '-')
    .replace(/\s+/g, ' ')
}

/** @param {string | number | null | undefined} raw */
export function parseBusinessModelNumericCell(raw) {
  if (raw == null) return NaN
  const t = String(raw).trim()
  if (!t || t === '—' || t === '-') return NaN
  const cleaned = t.replace(/[$,]/g, '').replace(/\s/g, '')
  if (!cleaned) return NaN
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : NaN
}

function cellAt(row, colIdx) {
  if (!row || colIdx < 0 || colIdx >= row.length) return ''
  const v = row[colIdx]
  return v == null ? '' : String(v).trim()
}

function rowLooksLikeDataRow(values) {
  return values.some((v) => {
    const n = parseBusinessModelNumericCell(v)
    if (Number.isFinite(n)) return true
    const t = String(v ?? '').trim()
    return t.length > 0 && /%/.test(t)
  })
}

/**
 * @param {string[][] | null | undefined} grid
 * @returns {Map<string, string[]>}
 */
function buildRowMap(grid) {
  const map = new Map()
  if (!Array.isArray(grid) || grid.length < 2) return map
  const header = grid[0]
  const numCols = Math.min(6, Math.max(0, header.length - 1))
  for (let ri = 1; ri < grid.length; ri++) {
    const row = grid[ri].map((c) => (c == null ? '' : String(c).trim()))
    if (row.every((c) => c === '')) continue
    const label = row[0] || ''
    const values = []
    for (let i = 0; i < numCols; i++) {
      values.push(row[i + 1] ?? '')
    }
    if (!rowLooksLikeDataRow(values)) continue
    const key = normalizeLabel(label)
    if (!key) continue
    if (!map.has(key)) map.set(key, values)
  }
  return map
}

/** @param {Map<string, string[]>} map @param {string[]} aliases */
function pickRow(map, aliases) {
  for (const a of aliases) {
    const hit = map.get(normalizeLabel(a))
    if (hit) return hit
  }
  return null
}

function requireFiniteNum(row, colIdx) {
  const n = parseBusinessModelNumericCell(cellAt(row, colIdx))
  return Number.isFinite(n) ? n : null
}

function pctDisplay(row, colIdx) {
  const t = cellAt(row, colIdx)
  return t || '—'
}

/**
 * Maps the “Current Model Growth” sheet layout to forecast snapshots + FY26–FY30 funnel inputs.
 * @param {string[][] | null | undefined} grid
 * @returns {{ yearEndSnapshots: object[], funnelForecastColumns: object[] } | null}
 */
export function buildDigitalPlatformsForecastFromGrid(grid) {
  const map = buildRowMap(grid)
  const totalTherm = pickRow(map, [
    'total fit thermostats (all brands)',
    'total thermostats (all brands)',
  ])
  const totalConn = pickRow(map, [
    'total fit connected thermostats',
    'total wifi connected thermostats',
    'total connected thermostats',
  ])
  const fyTherm = pickRow(map, [
    'fy fit thermostats (all brands)',
    'fy thermostats (all brands)',
    'fy thermostats',
  ])
  const fyConn = pickRow(map, [
    'fy fit connected thermostats',
    'fy wifi connected thermostats',
    'fy connected thermostats',
  ])
  const totalUsersRow = pickRow(map, ['total users'])
  const bundledRow = pickRow(map, ['bundled active licenses'])
  const oneYearRow = pickRow(map, ['1-year active licenses', 'annual active licenses'])
  const lifetimeRow = pickRow(map, ['lifetime active licenses'])
  const activeLicensesRow = pickRow(map, ['active licenses'])
  const activePenRow = pickRow(map, ['active license penetration'])
  const paidAnnualRow = pickRow(map, ['paid annual license penetration'])
  const paidLifetimeRow = pickRow(map, ['paid lifetime license penetration'])

  if (
    !totalTherm ||
    !totalConn ||
    !fyTherm ||
    !fyConn ||
    !totalUsersRow ||
    !bundledRow ||
    !oneYearRow ||
    !lifetimeRow ||
    !activePenRow ||
    !paidAnnualRow ||
    !paidLifetimeRow
  ) {
    return null
  }

  const rawSnapshots = []
  for (let ci = 0; ci < 6; ci++) {
    const totalT = requireFiniteNum(totalTherm, ci)
    const totalC = requireFiniteNum(totalConn, ci)
    const totalU = requireFiniteNum(totalUsersRow, ci)
    const b = requireFiniteNum(bundledRow, ci)
    const o = requireFiniteNum(oneYearRow, ci)
    const l = requireFiniteNum(lifetimeRow, ci)
    if (totalT == null || totalC == null || totalU == null || b == null || o == null || l == null) {
      return null
    }
    let activeOverride = null
    if (activeLicensesRow) {
      const a = parseBusinessModelNumericCell(cellAt(activeLicensesRow, ci))
      if (Number.isFinite(a)) activeOverride = a
    }
    rawSnapshots.push({
      key: PERIOD_KEYS[ci],
      totalThermostatsSold: totalT,
      totalConnected: totalC,
      totalUsers: totalU,
      bundledActiveLicenses: b,
      oneYearActiveLicenses: o,
      lifetimeActiveLicenses: l,
      activeLicenses: activeOverride != null ? activeOverride : undefined,
    })
  }

  const yearEndSnapshots = rawSnapshots.map(withYearEndSnapshotActiveLicenses)

  /** @type {object[]} */
  const funnelForecastColumns = []
  for (let ci = 1; ci <= 5; ci++) {
    const id = PERIOD_KEYS[ci]
    const fyThermostatsSold = requireFiniteNum(fyTherm, ci)
    const fyConnectedNew = requireFiniteNum(fyConn, ci)
    const totalUsers = requireFiniteNum(totalUsersRow, ci)
    const bundledNum = requireFiniteNum(bundledRow, ci)
    const oneYearEoy = requireFiniteNum(oneYearRow, ci)
    const lifetimeEoy = requireFiniteNum(lifetimeRow, ci)
    if (
      fyThermostatsSold == null ||
      fyConnectedNew == null ||
      totalUsers == null ||
      bundledNum == null ||
      oneYearEoy == null ||
      lifetimeEoy == null
    ) {
      return null
    }
    const activeLicensePenetrationLabel = pctDisplay(activePenRow, ci)
    const paidAnnualPenetrationLabel = pctDisplay(paidAnnualRow, ci)
    const paidLifetimePenetrationLabel = pctDisplay(paidLifetimeRow, ci)
    const bundledActiveLicensesEoy = bundledNum
    funnelForecastColumns.push({
      id,
      label: id,
      fyThermostatsSold,
      fyConnectedNew,
      totalUsers,
      activeLicensePenetrationLabel,
      bundledActiveLicensesEoy,
      oneYearActiveLicensesEoy: oneYearEoy,
      lifetimeActiveLicensesEoy: lifetimeEoy,
      paidAnnualPenetrationLabel,
      paidLifetimePenetrationLabel,
    })
  }

  return { yearEndSnapshots, funnelForecastColumns }
}

/**
 * FY25 installed-base snapshot (first model column) for the thermostat funnel “All‑Time” row on the Digital Apps playbook.
 * @param {string[][] | null | undefined} grid
 * @returns {object | null}
 */
export function getInstalledBaseAllTimeSnapshotFromGrid(grid) {
  const parsed = buildDigitalPlatformsForecastFromGrid(grid)
  if (!parsed) return null
  const s = parsed.yearEndSnapshots.find((x) => x.key === 'FY25')
  if (!s) return null
  const c = s.totalConnected
  const oneYear = s.oneYearActiveLicenses
  const lifetime = s.lifetimeActiveLicenses
  return {
    total: s.totalThermostatsSold,
    connected: c,
    active: s.activeLicenses,
    pctConnected: s.totalThermostatsSold > 0 ? (c / s.totalThermostatsSold) * 100 : 0,
    pctActiveOfConnected: c > 0 ? (s.activeLicenses / c) * 100 : 0,
    paidAnnualOfConnectedPct: c > 0 ? (oneYear / c) * 100 : 0,
    paidAnnualAbs: oneYear,
    paidLifetimeOfConnectedPct: c > 0 ? (lifetime / c) * 100 : 0,
    paidLifetimeAbs: lifetime,
  }
}
