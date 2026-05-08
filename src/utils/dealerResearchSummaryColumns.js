/**
 * Dealer Summary table: column order and header labels (Excel keys stay unchanged for row lookup).
 */

/** Identity columns first */
const LEAD_KEYS = ['Dealer Name', 'City', 'State']

/**
 * Program participation — shown before capability / technology columns (stakeholder order).
 */
const PROGRAM_KEYS_ORDER = [
  'Amana Advantage',
  'Daikin Comfort Pro',
  'APlus',
  'Private Label Plus',
  'Daikin Ductless Design Pro',
  'Daikin VRV Design Pro',
]

/** HVAC, electrification, adjacent tech — after programs */
const TECH_KEYS_ORDER = [
  'HVAC (Includes Heat Pumps)',
  'Hot Water (Includes HPWH)',
  'Electrical (Panel / Service)',
  'EV Charging',
  'Solar',
  'Battery',
  'Electrification Ready (Derived)',
]

/** Service / membership offers — after tech */
const SERVICE_KEYS_ORDER = ['Maintenance Plan Offered', 'Service Agreement / ESA', 'Membership Offered']

const TRAILING_KEYS_ORDER = ['Billing Cadence']

/**
 * @param {Set<string>|string[]} keySet
 * @returns {string[]}
 */
export function orderDealerSummaryColumnKeys(keySet) {
  const keys = Array.isArray(keySet) ? [...new Set(keySet)] : [...keySet]
  const has = (k) => keys.includes(k)

  const lead = LEAD_KEYS.filter(has)
  const programs = PROGRAM_KEYS_ORDER.filter(has)
  const tech = TECH_KEYS_ORDER.filter(has)
  const service = SERVICE_KEYS_ORDER.filter(has)
  const trailing = TRAILING_KEYS_ORDER.filter(has)

  const ordered = new Set([...lead, ...programs, ...tech, ...service, ...trailing])
  const rest = keys.filter((k) => !ordered.has(k)).sort((a, b) => a.localeCompare(b))

  return [...lead, ...programs, ...tech, ...service, ...trailing, ...rest]
}

/**
 * Friendly header text (cells still use raw Excel property keys).
 * @param {string} rawKey
 */
export function dealerSummaryColumnHeaderLabel(rawKey) {
  const explicit = {
    'HVAC (Includes Heat Pumps)': 'HVAC',
    'Hot Water (Includes HPWH)': 'Hot Water',
    'Electrical (Panel / Service)': 'Electrical Panel',
    'Electrification Ready (Derived)': 'Electrification Ready',
    'Maintenance Plan Offered': 'Maintenance Plan',
    'Membership Offered': 'Membership',
  }
  if (explicit[rawKey]) return explicit[rawKey]

  if (typeof rawKey === 'string' && rawKey.endsWith(' Offered')) {
    return rawKey.slice(0, -' Offered'.length)
  }

  return rawKey
}

/**
 * Collect unique keys from summary rows (excluding Excel empty columns).
 * @param {Record<string, unknown>[]} rows
 */
export function dealerSummaryKeysFromRows(rows) {
  const keys = new Set()
  if (!rows?.length) return []
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (!k.startsWith('__EMPTY')) keys.add(k)
    })
  })
  return orderDealerSummaryColumnKeys(keys)
}
