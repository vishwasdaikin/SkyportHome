import { useMemo } from 'react'
import { FeaturesSortableTh } from './FeaturesSortableTh'
import {
  applyWithinCategorySort,
  buildInitiativeCategoryTree,
  featuresCountSuffix,
  initiativeTotalRows,
  ROADMAP_NESTED_SORT_KEYS_FULL,
  ROADMAP_NESTED_SORT_KEYS_PANEL,
} from '../utils/roadmapInitiativeCategoryTree'

/**
 * @param {'full' | 'groupedPanel'} variant
 *   full — six columns including Attribute (for full-table view).
 *   groupedPanel — five columns; Attribute omitted (accordion is already scoped to one attribute).
 */
export function RoadmapNestedByInitiativeThead({ sortConfig, onSort, variant }) {
  const panel = variant === 'groupedPanel'
  return (
    <thead>
      <tr>
        {!panel && (
          <FeaturesSortableTh sortKey="displayGroup" sortConfig={sortConfig} onSort={onSort}>
            Attribute
          </FeaturesSortableTh>
        )}
        <FeaturesSortableTh sortKey="feature" sortConfig={sortConfig} onSort={onSort}>
          Feature / Function
        </FeaturesSortableTh>
        <FeaturesSortableTh sortKey="monetizationModel" sortConfig={sortConfig} onSort={onSort}>
          {panel ? 'Monetization' : 'Monetization Model'}
        </FeaturesSortableTh>
        <FeaturesSortableTh
          sortKey="development"
          sortConfig={sortConfig}
          onSort={onSort}
          className="features-cell-development"
        >
          Development
        </FeaturesSortableTh>
        <FeaturesSortableTh
          sortKey="priority"
          sortConfig={sortConfig}
          onSort={onSort}
          className="features-cell-priority"
        >
          Priority
        </FeaturesSortableTh>
        <FeaturesSortableTh
          sortKey="focusTimeframe"
          sortConfig={sortConfig}
          onSort={onSort}
          className="features-cell-timeframe"
        >
          Target
        </FeaturesSortableTh>
      </tr>
    </thead>
  )
}

export function RoadmapNestedByInitiativeTbody({ tree, formatFeature, variant, getTrClassName }) {
  const panel = variant === 'groupedPanel'
  const colSpan = panel ? 5 : 6

  return (
    <tbody>
      {tree.flatMap((block, bi) => {
        const initiativeCount = initiativeTotalRows(block)
        return [
          <tr key={`i-${bi}`} className="fy26-roadmap-embed-tier1">
            <td colSpan={colSpan}>
              <span className="fy26-roadmap-embed-tier-label">Initiative Type</span>
              {': '}
              {block.initiative}
              {featuresCountSuffix(initiativeCount)}
            </td>
          </tr>,
          ...block.categories.flatMap((cat, ci) => {
            const categoryCount = cat.rows.length
            return [
              <tr key={`c-${bi}-${ci}`} className="fy26-roadmap-embed-tier2">
                <td colSpan={colSpan}>
                  <span className="fy26-roadmap-embed-tier-label">End User Category</span>
                  {': '}
                  {cat.category}
                  {featuresCountSuffix(categoryCount)}
                </td>
              </tr>,
              ...cat.rows.map((row, ri) => (
                <tr
                  key={`r-${bi}-${ci}-${ri}`}
                  className={getTrClassName ? getTrClassName(row) : undefined}
                >
                  {!panel && <td className="features-cell-group">{row.displayGroup}</td>}
                  <td className="features-cell-feature">{formatFeature(row.feature)}</td>
                  <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                  <td className="features-cell-development">{row.development || '—'}</td>
                  <td className="features-cell-priority">{row.priority ?? '—'}</td>
                  <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
                </tr>
              )),
            ]
          }),
        ]
      })}
    </tbody>
  )
}

const NESTED_TABLE_CLASS =
  'features-table fy26-roadmap-embed-table--grouped fy26-roadmap-embed-table--nested'

/**
 * Builds initiative → category → rows tree, applies within-bucket sort, renders thead + tbody.
 */
export function RoadmapNestedByInitiativeTable({
  rows,
  sortConfig,
  onSort,
  variant,
  formatFeature,
  getTrClassName,
  className = NESTED_TABLE_CLASS,
}) {
  const allowedKeys = variant === 'groupedPanel' ? ROADMAP_NESTED_SORT_KEYS_PANEL : ROADMAP_NESTED_SORT_KEYS_FULL
  const sortKey = allowedKeys.includes(sortConfig.key) ? sortConfig.key : null
  const tree = useMemo(() => {
    const built = buildInitiativeCategoryTree(rows)
    return applyWithinCategorySort(built, sortKey, sortConfig.dir)
  }, [rows, sortKey, sortConfig.dir])

  return (
    <table className={className}>
      <RoadmapNestedByInitiativeThead variant={variant} sortConfig={sortConfig} onSort={onSort} />
      <RoadmapNestedByInitiativeTbody
        tree={tree}
        formatFeature={formatFeature}
        variant={variant}
        getTrClassName={getTrClassName}
      />
    </table>
  )
}

export { NESTED_TABLE_CLASS }
