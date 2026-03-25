/**
 * Map GeoJSON feature names (codeforamerica canada.geojson) → province/territory codes
 * used in aggregate.caCountByAbb.
 */
const CANADA_GEO_NAME_TO_ABB = {
  Alberta: 'AB',
  'British Columbia': 'BC',
  Manitoba: 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Northwest Territories': 'NT',
  'Nova Scotia': 'NS',
  Nunavut: 'NU',
  Ontario: 'ON',
  'Prince Edward Island': 'PE',
  Quebec: 'QC',
  Saskatchewan: 'SK',
  'Yukon Territory': 'YT',
  Yukon: 'YT',
}

/**
 * @param {string} geoName from geo.properties.name
 * @param {Record<string, number>} caCountByAbb
 */
export function getCanadaProvinceCount(geoName, caCountByAbb) {
  if (!geoName || !caCountByAbb) return 0
  const abb = CANADA_GEO_NAME_TO_ABB[geoName] ?? canadaGeoNameToAbbrev(geoName)
  if (!abb) return 0
  return caCountByAbb[abb] ?? 0
}

/** 2-letter code for map labels (matches keys in aggregate.caCountByAbb). */
export function canadaGeoNameToAbbrev(geoName) {
  if (!geoName) return null
  const direct = CANADA_GEO_NAME_TO_ABB[geoName]
  if (direct) return direct
  const lower = geoName.toLowerCase()
  for (const [name, abb] of Object.entries(CANADA_GEO_NAME_TO_ABB)) {
    if (name.toLowerCase() === lower) return abb
  }
  return null
}
