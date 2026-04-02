import { sortFeatureRows } from './featuresRoadmapSort'

/** Initiative → end-user category that should list first under that initiative (nested roadmap tables). */
const CATEGORY_FIRST_BY_INITIATIVE = {
  'New Technical Integration': 'Ease of Use & Accessibility',
}

/** Initiative → end-user category that should list last under that initiative. */
const CATEGORY_LAST_BY_INITIATIVE = {
  'New Feature Introduction': 'Engagement & Personalization',
  'New Function Introduction': 'Intelligence & Automation',
}

function moveCategoryToTop(categories, initiative) {
  const target = CATEGORY_FIRST_BY_INITIATIVE[initiative]
  if (!target) return categories
  const idx = categories.findIndex((c) => c.category === target)
  if (idx <= 0) return categories
  const next = [...categories]
  const [block] = next.splice(idx, 1)
  return [block, ...next]
}

function moveCategoryToBottom(categories, initiative) {
  const target = CATEGORY_LAST_BY_INITIATIVE[initiative]
  if (!target) return categories
  const idx = categories.findIndex((c) => c.category === target)
  if (idx < 0 || idx === categories.length - 1) return categories
  const next = [...categories]
  const [block] = next.splice(idx, 1)
  return [...next, block]
}

/** Matches first-seen order in `featuresData` so FY26 tables match the static bundle. */
export const ROADMAP_INITIATIVE_ORDER_SKYPORT_HOME = [
  'New Function Introduction',
  'New Feature Introduction',
  'New Technical Integration',
  'Sustaining',
  'New Product Integration',
  'New Interoperability Capability',
]

/** Matches first-seen order in `skyportCareFeaturesData`. */
export const ROADMAP_INITIATIVE_ORDER_SKYPORT_CARE = [
  'New Feature Introduction',
  'Sustaining',
  'New Product Integration',
  'New Function Introduction',
  'New Technical Integration',
]

function sortInitiativeKeys(order, stableList) {
  if (!stableList?.length) return order
  const weight = new Map(stableList.map((name, i) => [name, i]))
  const tail = stableList.length + 1
  return [...order].sort((a, b) => {
    const wa = weight.has(a) ? weight.get(a) : tail
    const wb = weight.has(b) ? weight.get(b) : tail
    if (wa !== wb) return wa - wb
    return String(a).localeCompare(String(b))
  })
}

/**
 * @param {object[]} rows
 * @param {string[] | null} [stableInitiativeOrder] When set (e.g. SkyportHome vs SkyportCare presets), initiative
 *   sections sort in this order so Excel row order does not reshuffle blue headers vs the static FY26 embeds.
 * @returns {{ initiative: string, categories: { category: string, rows: object[] }[] }[]}
 */
export function buildInitiativeCategoryTree(rows, stableInitiativeOrder = null) {
  const initiativeOrder = []
  const byInitiative = new Map()

  for (const row of rows) {
    const initiative = row.initiativeType?.trim() || '—'
    const category = row.endUserCategory?.trim() || '—'

    if (!byInitiative.has(initiative)) {
      byInitiative.set(initiative, { categoryOrder: [], byCategory: new Map() })
      initiativeOrder.push(initiative)
    }
    const node = byInitiative.get(initiative)
    if (!node.byCategory.has(category)) {
      node.categoryOrder.push(category)
      node.byCategory.set(category, [])
    }
    node.byCategory.get(category).push(row)
  }

  const orderedInitiatives = sortInitiativeKeys(initiativeOrder, stableInitiativeOrder)

  return orderedInitiatives.map((initiative) => {
    const { categoryOrder, byCategory } = byInitiative.get(initiative)
    const categories = categoryOrder.map((category) => ({
      category,
      rows: byCategory.get(category),
    }))
    return {
      initiative,
      categories: moveCategoryToBottom(moveCategoryToTop(categories, initiative), initiative),
    }
  })
}

export function applyWithinCategorySort(tree, sortKey, sortDir) {
  if (sortKey == null || sortKey === '') return tree
  return tree.map((block) => ({
    ...block,
    categories: block.categories.map((cat) => ({
      ...cat,
      rows: sortFeatureRows(cat.rows, sortKey, sortDir),
    })),
  }))
}

export function featuresCountSuffix(count) {
  return ` (${count} feature${count === 1 ? '' : 's'})`
}

export function initiativeTotalRows(block) {
  return block.categories.reduce((sum, cat) => sum + cat.rows.length, 0)
}

/** Full roadmap table: sortable data columns including Attribute. */
export const ROADMAP_NESTED_SORT_KEYS_FULL = [
  'displayGroup',
  'feature',
  'monetizationModel',
  'development',
  'priority',
  'focusTimeframe',
]

/** Accordion panel: Attribute is implicit — same columns minus displayGroup. */
export const ROADMAP_NESTED_SORT_KEYS_PANEL = [
  'feature',
  'monetizationModel',
  'development',
  'priority',
  'focusTimeframe',
]
