/**
 * Product Board products → Excel sheet names in `Digital_Framework.xlsx`.
 * Each product includes a short profile shown above the roadmap table.
 */

/**
 * Optional `lastUpdated`: ISO `YYYY-MM-DD`. Optional `whatChanged`: short changelog text.
 *
 * @typedef {{
 *   productName: string
 *   mission: string
 *   pmOwner: string
 *   lastUpdated?: string
 *   whatChanged?: string
 * }} ProductBoardProfile
 */

/**
 * `sheetAliases`: optional alternate tab names (e.g. `MatchXpress` vs `MatchupXpress`).
 *
 * @typedef {{
 *   id: string
 *   label: string
 *   sheetName: string
 *   sheetAliases?: string[]
 *   profile: ProductBoardProfile
 * }} ProductBoardProduct
 */

/** @type {ProductBoardProduct[]} */
export const PRODUCT_BOARD_PRODUCTS = [
  {
    id: 'techhub',
    label: 'TechHub',
    sheetName: 'TechHub',
    profile: {
      productName: 'TechHub',
      mission:
        'Give dealers and field teams one place for technical content, tools, and answers so service and installs stay consistent, efficient, and aligned with product guidance.',
      pmOwner: 'Pratima Godse',
      lastUpdated: '',
      whatChanged: '',
    },
  },
  {
    id: 'hvac-learning-campus',
    label: 'HVAC Learning Campus',
    sheetName: 'HVAC Learning Campus',
    sheetAliases: ['HVAC learning campus', 'HVAC Learning campus'],
    profile: {
      productName: 'HVAC Learning Campus',
      mission:
        "Empower HVAC professionals to build capability, confidence, and readiness through intuitive, accessible, and role-relevant training—delivered in one place and aligned to Daikin's products, technologies, and business needs.",
      pmOwner: 'Bryan Marquart',
      lastUpdated: '',
      whatChanged: '',
    },
  },
  {
    id: 'daikin-city',
    label: 'Daikin City',
    sheetName: 'Daikin City',
    sheetAliases: ['Daikin city'],
    profile: {
      productName: 'Daikin City',
      mission:
        "Empower HVAC professionals to learn, grow, and perform at their best through a centralized, intuitive learning ecosystem—aligned with Daikin's products, technologies, and long-term business needs.",
      pmOwner: 'Bryan Marquart',
      lastUpdated: '',
      whatChanged: '',
    },
  },
]

/** Normalize for tab matching: Unicode NFKC, collapse whitespace, lower case. */
export function normalizeWorkbookSheetKey(s) {
  return String(s ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
}

/**
 * @param {string[]} sheetNames
 * @param {string} targetSheet
 * @returns {string | null} actual workbook sheet name (preserves casing from file), or null if missing
 */
export function findWorkbookSheetName(sheetNames, targetSheet) {
  if (!targetSheet || !Array.isArray(sheetNames) || sheetNames.length === 0) return null
  const want = normalizeWorkbookSheetKey(targetSheet)
  if (!want) return null
  for (const name of sheetNames) {
    if (normalizeWorkbookSheetKey(name) === want) return name
  }
  return null
}

/**
 * Resolves the workbook tab for a product: `sheetName`, then each `sheetAlias` (e.g. `MatchXpress` vs `MatchupXpress`).
 * Ignores unrelated tabs such as `Template`.
 *
 * @param {string[]} sheetNames
 * @param {{ sheetName: string, sheetAliases?: string[] }} product
 * @returns {string | null}
 */
export function findWorkbookSheetForProduct(sheetNames, product) {
  const candidates = [
    product.sheetName,
    ...(Array.isArray(product.sheetAliases) ? product.sheetAliases : []),
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    const resolved = findWorkbookSheetName(sheetNames, candidate)
    if (resolved) return resolved
  }
  return null
}
