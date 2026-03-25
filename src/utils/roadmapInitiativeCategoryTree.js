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

/**
 * @param {object[]} rows
 * @returns {{ initiative: string, categories: { category: string, rows: object[] }[] }[]}
 */
export function buildInitiativeCategoryTree(rows) {
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

  return initiativeOrder.map((initiative) => {
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
