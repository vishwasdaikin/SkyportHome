import { useMemo, useState } from 'react'
import { featuresRows } from '../content/featuresData'
import { FeaturesSortableTh } from '../components/FeaturesSortableTh'
import { formatFeatureCellContent } from '../utils/formatFeatureCellContent'
import { createDefaultSortConfig, sortFeatureRows } from '../utils/featuresRoadmapSort'
import './Features.css'

function getRowsWithGroups(rows) {
  let currentGroup = ''
  return rows.map((row) => {
    if (row.featureGroup) currentGroup = row.featureGroup
    return { ...row, displayGroup: currentGroup }
  })
}

export default function Features() {
  const [sortConfig, setSortConfig] = useState(createDefaultSortConfig)
  const rowsWithGroups = useMemo(() => getRowsWithGroups(featuresRows), [])
  const rows = useMemo(
    () => sortFeatureRows(rowsWithGroups, sortConfig.key, sortConfig.dir),
    [rowsWithGroups, sortConfig.key, sortConfig.dir],
  )

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <article className="features-page">
      <header className="features-header">
        <h1>Roadmap</h1>
        <p className="features-tagline">
          Feature / Function groups, initiative types, end user categories, monetization, focus timeframe, priority, and
          development scope.
        </p>
      </header>

      <div className="features-table-wrap">
        <table className="features-table">
          <thead>
            <tr>
              <FeaturesSortableTh sortKey="displayGroup" sortConfig={sortConfig} onSort={toggleSort}>
                Feature / Function Group
              </FeaturesSortableTh>
              <FeaturesSortableTh sortKey="feature" sortConfig={sortConfig} onSort={toggleSort}>
                Feature / Function
              </FeaturesSortableTh>
              <FeaturesSortableTh sortKey="initiativeType" sortConfig={sortConfig} onSort={toggleSort}>
                Initiative Type
              </FeaturesSortableTh>
              <FeaturesSortableTh sortKey="endUserCategory" sortConfig={sortConfig} onSort={toggleSort}>
                End User Category
              </FeaturesSortableTh>
              <FeaturesSortableTh sortKey="monetizationModel" sortConfig={sortConfig} onSort={toggleSort}>
                Monetization Model
              </FeaturesSortableTh>
              <FeaturesSortableTh
                sortKey="focusTimeframe"
                sortConfig={sortConfig}
                onSort={toggleSort}
                className="features-cell-timeframe"
              >
                Focus Timeframe
              </FeaturesSortableTh>
              <FeaturesSortableTh
                sortKey="priority"
                sortConfig={sortConfig}
                onSort={toggleSort}
                className="features-cell-priority"
              >
                Priority
              </FeaturesSortableTh>
              <FeaturesSortableTh
                sortKey="development"
                sortConfig={sortConfig}
                onSort={toggleSort}
                className="features-cell-development"
              >
                Development
              </FeaturesSortableTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="features-cell-group">{row.displayGroup}</td>
                <td className="features-cell-feature">{formatFeatureCellContent(row.feature)}</td>
                <td className="features-cell-type">{row.initiativeType}</td>
                <td className="features-cell-category">{row.endUserCategory}</td>
                <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
                <td className="features-cell-priority">{row.priority ?? '—'}</td>
                <td className="features-cell-development">{row.development || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
