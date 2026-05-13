/**
 * Shared parsing for Skyport-style roadmap sheets (Feature Group, Feature / Function, …).
 * Filters embedded summary rows and avoids mis-parsing priorities like "1%".
 */

export function roadmapExcelAsText(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function roadmapExcelAsPriority(value) {
  const raw = String(value ?? '').trim()
  if (!raw || raw.includes('%')) return null
  const n = Number(raw.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

export function mapRawRowToRoadmapRow(rawRow) {
  return {
    featureGroup: roadmapExcelAsText(rawRow['Feature Group'] ?? rawRow.Attribute),
    feature: roadmapExcelAsText(rawRow['Feature / Function'] ?? rawRow.Feature),
    initiativeType: roadmapExcelAsText(rawRow['Initiative Type']),
    endUserCategory: roadmapExcelAsText(rawRow['End User Category']),
    monetizationModel: roadmapExcelAsText(rawRow['Monetization Model']),
    focusTimeframe: roadmapExcelAsText(rawRow['Focus Timeframe']) || '—',
    priority: roadmapExcelAsPriority(rawRow.Priority),
    development: roadmapExcelAsText(rawRow.Development),
  }
}

/** True when row looks like a real feature row (not Count / % summary blocks). */
export function isRoadmapFeatureRow(row) {
  const initiative = row.initiativeType.toLowerCase()
  const category = row.endUserCategory.toLowerCase()
  const feature = row.feature.toLowerCase()

  if (!initiative || initiative === 'count' || /^\d+$/.test(initiative)) return false
  if (!/[a-z]/.test(initiative)) return false
  if (category === 'count %' || /^\d+%$/.test(category)) return false
  if (feature === 'themes' || feature === 'monetization model') return false
  if (!row.development) return false
  if (!(typeof row.priority === 'number' && row.priority > 0)) return false

  return true
}

export function normalizeRoadmapRowsFromRaw(rawRows) {
  if (!Array.isArray(rawRows)) return []
  return rawRows
    .map(mapRawRowToRoadmapRow)
    .filter((row) => row.feature.length > 0)
    .filter(isRoadmapFeatureRow)
}

export function classifyRoadmapRawRows(rawRows) {
  if (!Array.isArray(rawRows)) return { included: [], excluded: [] }

  const included = []
  const excluded = []

  for (const rawRow of rawRows) {
    const row = mapRawRowToRoadmapRow(rawRow)

    if (!row.feature) {
      excluded.push({ feature: '', reason: 'blank feature cell' })
      continue
    }
    if (isRoadmapFeatureRow(row)) {
      included.push(row)
      continue
    }

    const initiative = row.initiativeType.toLowerCase()
    const category = row.endUserCategory.toLowerCase()
    const feature = row.feature.toLowerCase()
    let reason = 'filtered as non-feature summary row'
    if (!initiative || initiative === 'count' || /^\d+$/.test(initiative)) reason = 'summary/count initiative'
    else if (category === 'count %' || /^\d+%$/.test(category)) reason = 'summary percentage category'
    else if (!row.development) reason = 'missing development column'
    else if (!(typeof row.priority === 'number' && row.priority > 0)) reason = 'invalid priority (must be numeric > 0)'
    else if (feature === 'themes' || feature === 'monetization model') reason = 'summary section header row'
    excluded.push({ feature: row.feature, reason })
  }

  return { included, excluded }
}

export function roadmapDatasetFingerprint(rows) {
  const text = rows
    .map((r) =>
      [
        r.featureGroup,
        r.feature,
        r.initiativeType,
        r.endUserCategory,
        r.monetizationModel,
        r.focusTimeframe,
        r.priority,
        r.development,
      ].join('|'),
    )
    .join('\n')
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
