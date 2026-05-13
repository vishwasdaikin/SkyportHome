/**
 * Installed-base funnel: Active License Penetration by fiscal year (presentation).
 * Source: SkyportCare funnel table on FY26 Digital Apps — keep in sync when funnel copy changes.
 */
export const FUNNEL_ACTIVE_LICENSE_PENETRATION_FY_DISPLAY = {
  FY25: { pct: '6%', absParen: '(4,600)' },
  FY24: { pct: '6%', absParen: '(5,700)' },
  FY23: { pct: '4%', absParen: '(1,700)' },
}

function parseFunnelPctString(pctStr) {
  const n = parseFloat(String(pctStr).replace(/%/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

/** FY23 → FY25 for charts (e.g. Test page). */
export function getActiveLicensePenetrationFY23to25ChartData() {
  const order = ['FY23', 'FY24', 'FY25']
  return order.map((id) => {
    const row = FUNNEL_ACTIVE_LICENSE_PENETRATION_FY_DISPLAY[id]
    return {
      fiscalYear: id,
      pct: parseFunnelPctString(row.pct),
      labelAbove: row.pct,
    }
  })
}
