/**
 * Parse "Locations per State" CSV and normalize messy province labels to US/CA regions.
 * Output keys US map by full state name (matches us-atlas / react-simple-maps geo.properties.name).
 */

export const US_STATE_ABB_TO_NAME = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
}

/** US territories present in us-atlas states layer (name must match geo.properties.name). */
export const US_TERRITORY_ABB_TO_NAME = {
  PR: 'Puerto Rico',
  GU: 'Guam',
  VI: 'United States Virgin Islands',
  AS: 'American Samoa',
  MP: 'Northern Mariana Islands',
}

const US_ABB = new Set(Object.keys(US_STATE_ABB_TO_NAME))
const US_TERR_ABB = new Set(Object.keys(US_TERRITORY_ABB_TO_NAME))

const CA_ABB = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])

const CA_NAME_TO_ABB = {
  alberta: 'AB',
  'british columbia': 'BC',
  manitoba: 'MB',
  'new brunswick': 'NB',
  'newfoundland and labrador': 'NL',
  newfoundland: 'NL',
  'nova scotia': 'NS',
  ontario: 'ON',
  'prince edward island': 'PE',
  quebec: 'QC',
  québec: 'QC',
  saskatchewan: 'SK',
  'northwest territories': 'NT',
  nunavut: 'NU',
  yukon: 'YT',
}

/** US / DC full names (ASCII-normalized keys) → abbreviation */
function buildUsNameToAbb() {
  const m = {}
  for (const [abb, name] of Object.entries(US_STATE_ABB_TO_NAME)) {
    m[normalizeNameKey(name)] = abb
  }
  m[normalizeNameKey('Washington, D.C.')] = 'DC'
  return m
}

const US_NAME_TO_ABB = buildUsNameToAbb()

/** Common typos / variants in SDI export (normalized keys) → US abb or CA abb with prefix */
const TYPO_TO_REGION = {
  flordia: 'US:FL',
  oregin: 'US:OR',
  orgen: 'US:OR',
  oregom: 'US:OR',
  orgun: 'US:OR',
  ioww: 'US:IA',
  ioaw: 'US:IA',
  'color ado': 'US:CO',
  kansss: null,
  'new burnswick': 'CA:NB',
  saskachewas: 'CA:SK',
  'nova scotis': 'CA:NS',
  que: 'CA:QC',
  québecc: 'CA:QC',
  mass: 'US:MA',
  ont: 'CA:ON',
  na: null,
  boring: null,
  yx: null,
  m0: null,
  '0r': null,
  i: null,
}

function normalizeNameKey(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/[.,]+$/g, '')
    .trim()
}

function cleanProvinceCell(raw) {
  let s = String(raw).trim()
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).replace(/""/g, '"')
  }
  s = s.replace(/,$/, '').trim()
  return s.replace(/\s+/g, ' ')
}

/**
 * @param {string} line
 * @returns {{ prov: string, count: number } | null}
 */
export function parseLocationsCsvLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  if (lower === '"province"' || lower.startsWith('"province"') || lower === 'province') return null

  const lastComma = trimmed.lastIndexOf(',')
  if (lastComma <= 0) return null
  const prov = cleanProvinceCell(trimmed.slice(0, lastComma))
  const count = parseInt(trimmed.slice(lastComma + 1), 10)
  if (!prov || Number.isNaN(count) || count < 0) return null
  return { prov, count }
}

/**
 * @param {string} csvText
 * @returns {{ prov: string, count: number }[]}
 */
export function parseLocationsCsv(csvText) {
  const rows = []
  for (const line of csvText.split(/\r?\n/)) {
    const row = parseLocationsCsvLine(line)
    if (row) rows.push(row)
  }
  return rows
}

/**
 * @param {string} prov
 * @returns {{ country: 'US'|'CA', abb: string } | null}
 */
export function normalizeProvince(prov) {
  let s = cleanProvinceCell(prov)
  if (!s) return null

  // Typo: Al → AL
  if (s === 'Al') return { country: 'US', abb: 'AL', territory: false }

  // Strip trailing period on 2–4 letter abbrevs (Pa., La., IL., Fl., Wa.)
  const abbrevCandidate = s.replace(/\.$/, '').trim()
  if (abbrevCandidate.length === 2) {
    const u = abbrevCandidate.toUpperCase()
    if (US_ABB.has(u)) return { country: 'US', abb: u, territory: false }
    if (US_TERR_ABB.has(u)) return { country: 'US', abb: u, territory: true }
    if (CA_ABB.has(u)) return { country: 'CA', abb: u }
    return null
  }

  const nk = normalizeNameKey(s)
  if (TYPO_TO_REGION[nk] !== undefined) {
    const t = TYPO_TO_REGION[nk]
    if (t == null) return null
    const [c, abb] = t.split(':')
    return { country: c, abb, territory: c === 'US' && US_TERR_ABB.has(abb) }
  }

  const usAbb = US_NAME_TO_ABB[nk]
  if (usAbb) return { country: 'US', abb: usAbb, territory: false }

  const caAbb = CA_NAME_TO_ABB[nk]
  if (caAbb) return { country: 'CA', abb: caAbb }

  // b.c., british columbia variants
  if (nk === 'b.c' || nk === 'b.c.' || nk.startsWith('british columbia')) {
    return { country: 'CA', abb: 'BC' }
  }

  return null
}

/**
 * @param {string} csvText
 */
export function aggregateThermostatLocations(csvText) {
  const rows = parseLocationsCsv(csvText)
  const usCountByStateName = {}
  const caCountByAbb = {}
  let unmappedCount = 0
  let mappedUnits = 0
  const totalCsvCount = rows.reduce((s, r) => s + r.count, 0)

  for (const { prov, count } of rows) {
    const n = normalizeProvince(prov)
    if (!n) {
      unmappedCount += count
      continue
    }
    mappedUnits += count
    if (n.country === 'US') {
      let topoName
      if (n.territory === true) {
        topoName = US_TERRITORY_ABB_TO_NAME[n.abb]
      } else {
        topoName = US_STATE_ABB_TO_NAME[n.abb]
      }
      if (topoName) {
        usCountByStateName[topoName] = (usCountByStateName[topoName] || 0) + count
      } else {
        unmappedCount += count
        mappedUnits -= count
      }
    } else {
      caCountByAbb[n.abb] = (caCountByAbb[n.abb] || 0) + count
    }
  }

  const usValues = Object.values(usCountByStateName)
  const usMax = usValues.length ? Math.max(...usValues) : 0
  const usMin = usValues.length ? Math.min(...usValues) : 0

  return {
    usCountByStateName,
    caCountByAbb,
    unmappedCount,
    mappedUnits,
    rowCount: rows.length,
    totalCsvCount,
    usMin,
    usMax,
  }
}

/**
 * Map US map geography name (us-atlas geo.properties.name) → 2-letter code.
 * Covers 50 states, D.C., and territories used in the choropleth.
 */
export function geoUsNameToAbbrev(geoName) {
  if (!geoName) return null
  for (const [abb, name] of Object.entries(US_STATE_ABB_TO_NAME)) {
    if (name === geoName) return abb
  }
  for (const [abb, name] of Object.entries(US_TERRITORY_ABB_TO_NAME)) {
    if (name === geoName) return abb
  }
  const lower = geoName.toLowerCase()
  for (const [abb, name] of Object.entries(US_STATE_ABB_TO_NAME)) {
    if (name.toLowerCase() === lower) return abb
  }
  for (const [abb, name] of Object.entries(US_TERRITORY_ABB_TO_NAME)) {
    if (name.toLowerCase() === lower) return abb
  }
  return null
}

export const CA_ABB_LABELS = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
}
