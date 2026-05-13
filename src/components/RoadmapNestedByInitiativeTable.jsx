import { useCallback, useId, useMemo, useState } from 'react'
import { FeaturesSortableTh } from './FeaturesSortableTh'
import {
  applyWithinCategorySort,
  buildInitiativeCategoryTree,
  featuresCountSuffix,
  initiativeTotalRows,
  ROADMAP_NESTED_SORT_KEYS_FULL,
  ROADMAP_NESTED_SORT_KEYS_PANEL,
} from '../utils/roadmapInitiativeCategoryTree'

/** Stable delimiter for `${initiative}${SEP}${category}` expansion keys (unlikely in display names). */
const TIER_CATEGORY_KEY_SEP = '\u001f'

export function roadmapCategoryExpansionKey(initiative, category) {
  return `${initiative}${TIER_CATEGORY_KEY_SEP}${category}`
}

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

export function RoadmapNestedByInitiativeTbody({
  tree,
  formatFeature,
  variant,
  getTrClassName,
  tierAccordion = false,
  expandedInitiatives = new Set(),
  expandedCategories = new Set(),
  onToggleInitiative = () => {},
  onToggleCategory = () => {},
  idPrefix = '',
}) {
  const panel = variant === 'groupedPanel'
  const colSpan = panel ? 5 : 6

  return (
    <tbody>
      {tree.flatMap((block, bi) => {
        const initiativeCount = initiativeTotalRows(block)
        const initiativeOpen = !tierAccordion || expandedInitiatives.has(block.initiative)

        const tier1Row = (
          <tr key={`i-${bi}`} className="fy26-roadmap-embed-tier1">
            <td colSpan={colSpan}>
              {tierAccordion ? (
                <button
                  type="button"
                  className="fy26-roadmap-embed-tier-toggle"
                  onClick={() => onToggleInitiative(block.initiative)}
                  aria-expanded={initiativeOpen}
                  id={`${idPrefix}init-${bi}`}
                >
                  <span className="fy26-roadmap-embed-tier-chevron" aria-hidden>
                    {initiativeOpen ? '▾' : '▸'}
                  </span>
                  <span>
                    <span className="fy26-roadmap-embed-tier-label">Initiative Type</span>
                    {': '}
                    {block.initiative}
                    {featuresCountSuffix(initiativeCount)}
                  </span>
                </button>
              ) : (
                <>
                  <span className="fy26-roadmap-embed-tier-label">Initiative Type</span>
                  {': '}
                  {block.initiative}
                  {featuresCountSuffix(initiativeCount)}
                </>
              )}
            </td>
          </tr>
        )

        if (!tierAccordion) {
          return [
            tier1Row,
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
        }

        if (!initiativeOpen) return [tier1Row]

        return [
          tier1Row,
          ...block.categories.flatMap((cat, ci) => {
            const categoryCount = cat.rows.length
            const catKey = roadmapCategoryExpansionKey(block.initiative, cat.category)
            const categoryOpen = expandedCategories.has(catKey)

            return [
              <tr key={`c-${bi}-${ci}`} className="fy26-roadmap-embed-tier2">
                <td colSpan={colSpan}>
                  <button
                    type="button"
                    className="fy26-roadmap-embed-tier-toggle"
                    onClick={() => onToggleCategory(catKey)}
                    aria-expanded={categoryOpen}
                    aria-controls={`${idPrefix}cat-${bi}-${ci}`}
                    id={`${idPrefix}cat-h-${bi}-${ci}`}
                  >
                    <span className="fy26-roadmap-embed-tier-chevron" aria-hidden>
                      {categoryOpen ? '▾' : '▸'}
                    </span>
                    <span>
                      <span className="fy26-roadmap-embed-tier-label">End User Category</span>
                      {': '}
                      {cat.category}
                      {featuresCountSuffix(categoryCount)}
                    </span>
                  </button>
                </td>
              </tr>,
              ...(categoryOpen
                ? cat.rows.map((row, ri) => (
                    <tr
                      key={`r-${bi}-${ci}-${ri}`}
                      id={ri === 0 ? `${idPrefix}cat-${bi}-${ci}` : undefined}
                      className={getTrClassName ? getTrClassName(row) : undefined}
                    >
                      {!panel && <td className="features-cell-group">{row.displayGroup}</td>}
                      <td className="features-cell-feature">{formatFeature(row.feature)}</td>
                      <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                      <td className="features-cell-development">{row.development || '—'}</td>
                      <td className="features-cell-priority">{row.priority ?? '—'}</td>
                      <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
                    </tr>
                  ))
                : []),
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
  /** When true (default): only blue initiative rows show until expanded; yellow categories collapsed until expanded. */
  tierAccordion = true,
  /** Preserves same initiative header order as static FY26 data when rows come from Excel (different sheet order). */
  initiativeStableOrder = null,
}) {
  const allowedKeys = variant === 'groupedPanel' ? ROADMAP_NESTED_SORT_KEYS_PANEL : ROADMAP_NESTED_SORT_KEYS_FULL
  const sortKey = allowedKeys.includes(sortConfig.key) ? sortConfig.key : null
  const tree = useMemo(() => {
    const built = buildInitiativeCategoryTree(rows, initiativeStableOrder)
    return applyWithinCategorySort(built, sortKey, sortConfig.dir)
  }, [rows, sortKey, sortConfig.dir, initiativeStableOrder])

  const [expandedInitiatives, setExpandedInitiatives] = useState(() => new Set())
  const [expandedCategories, setExpandedCategories] = useState(() => new Set())

  const onToggleInitiative = useCallback((initiative) => {
    setExpandedInitiatives((prev) => {
      const next = new Set(prev)
      const wasOpen = next.has(initiative)
      if (wasOpen) {
        next.delete(initiative)
        const prefix = `${initiative}${TIER_CATEGORY_KEY_SEP}`
        setExpandedCategories((cPrev) => {
          const cNext = new Set(cPrev)
          for (const k of cPrev) {
            if (k.startsWith(prefix)) cNext.delete(k)
          }
          return cNext
        })
      } else {
        next.add(initiative)
      }
      return next
    })
  }, [])

  const onToggleCategory = useCallback((catKey) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catKey)) next.delete(catKey)
      else next.add(catKey)
      return next
    })
  }, [])

  const tableUid = useId().replace(/:/g, '')

  return (
    <table className={className}>
      <RoadmapNestedByInitiativeThead variant={variant} sortConfig={sortConfig} onSort={onSort} />
      <RoadmapNestedByInitiativeTbody
        tree={tree}
        formatFeature={formatFeature}
        variant={variant}
        getTrClassName={getTrClassName}
        tierAccordion={tierAccordion}
        expandedInitiatives={expandedInitiatives}
        expandedCategories={expandedCategories}
        onToggleInitiative={onToggleInitiative}
        onToggleCategory={onToggleCategory}
        idPrefix={`fy26-rm-${tableUid}-`}
      />
    </table>
  )
}

export { NESTED_TABLE_CLASS }
