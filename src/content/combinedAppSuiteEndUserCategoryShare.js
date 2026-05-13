/**
 * End-user category mix across SkyportHome + SkyportCare roadmaps (App Suite).
 * Same row sources as `SkyportHome.jsx` / `SkyportCare.jsx` feature tables.
 * Only rows whose `endUserCategory` is one of the five pillars below are counted;
 * percentages are shares of that combined in-scope pool (bars sum to 100%).
 */
import { featuresRows } from './featuresData.js'
import { skyportCareFeaturesRows } from './skyportCareFeaturesData.js'

export const END_USER_CATEGORY_AXIS_ORDER = [
  'Trust, Security & Reliability',
  'Ease of Use & Accessibility',
  'Engagement & Personalization',
  'Intelligence & Automation',
  'Energy & Sustainability',
]

export const END_USER_CATEGORY_SHORT_LABEL = {
  'Trust, Security & Reliability': 'Trust & Security',
  'Ease of Use & Accessibility': 'Ease of Use',
  'Engagement & Personalization': 'Engagement',
  'Intelligence & Automation': 'Intelligence',
  'Energy & Sustainability': 'Energy',
}

function isInScopeCategory(row) {
  return END_USER_CATEGORY_AXIS_ORDER.includes(row.endUserCategory)
}

/**
 * @returns {Array<{ category: string, categoryShort: string, homeCount: number, careCount: number, homePct: number, carePct: number, combinedPct: number }>}
 */
export function getCombinedEndUserCategoryEffortChartData() {
  const homeRows = featuresRows.filter(isInScopeCategory)
  const careRows = skyportCareFeaturesRows.filter(isInScopeCategory)
  const total = homeRows.length + careRows.length

  const homeByCat = new Map(END_USER_CATEGORY_AXIS_ORDER.map((c) => [c, 0]))
  const careByCat = new Map(END_USER_CATEGORY_AXIS_ORDER.map((c) => [c, 0]))
  homeRows.forEach((r) => homeByCat.set(r.endUserCategory, (homeByCat.get(r.endUserCategory) ?? 0) + 1))
  careRows.forEach((r) => careByCat.set(r.endUserCategory, (careByCat.get(r.endUserCategory) ?? 0) + 1))

  return END_USER_CATEGORY_AXIS_ORDER.map((category) => {
    const h = homeByCat.get(category) ?? 0
    const c = careByCat.get(category) ?? 0
    const homePct = total > 0 ? (h / total) * 100 : 0
    const carePct = total > 0 ? (c / total) * 100 : 0
    const combinedPct = homePct + carePct
    return {
      category,
      categoryShort: END_USER_CATEGORY_SHORT_LABEL[category] ?? category,
      homeCount: h,
      careCount: c,
      homePct,
      carePct,
      combinedPct,
    }
  })
}

/**
 * Same rows as {@link getCombinedEndUserCategoryEffortChartData}, plus per-product shares:
 * `homeOnlyPct` = share of that product’s in-scope features in each pillar (sums to 100% across five bars);
 * `careOnlyPct` = same for SkyportCare.
 *
 * @returns {Array<{ category: string, categoryShort: string, homeCount: number, careCount: number, homePct: number, carePct: number, combinedPct: number, homeOnlyPct: number, careOnlyPct: number }>}
 */
export function getEndUserCategoryProductSplitData() {
  const rows = getCombinedEndUserCategoryEffortChartData()
  const homeTot = rows.reduce((s, r) => s + r.homeCount, 0)
  const careTot = rows.reduce((s, r) => s + r.careCount, 0)
  return rows.map((r) => ({
    ...r,
    homeOnlyPct: homeTot > 0 ? (r.homeCount / homeTot) * 100 : 0,
    careOnlyPct: careTot > 0 ? (r.careCount / careTot) * 100 : 0,
  }))
}
