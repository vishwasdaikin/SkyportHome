import { useState, useMemo } from 'react'
import {
  skyportCareFeaturesRows,
  skyportCareFeaturesDone,
  skyportCareFeaturesPartial,
} from '../content/skyportCareFeaturesData'
import { FeaturesCategoryChart } from '../components/FeaturesCategoryChart'
import { FeaturesSortableTh } from '../components/FeaturesSortableTh'
import { useFeatureProgress } from '../hooks/useFeatureProgress'
import { createDefaultSortConfig, sortFeatureRows } from '../utils/featuresRoadmapSort'
import { formatSkyportCareFeatureCellContent } from '../utils/formatSkyportCareFeatureCellContent'
import './SkyportCare.css'
import './Features.css'
import './SkyportHome.css'

function getRowsWithGroups(rows) {
  let currentGroup = ''
  return rows.map((row) => {
    if (row.featureGroup) currentGroup = row.featureGroup
    return { ...row, displayGroup: currentGroup }
  })
}

function buildGroups(rows) {
  const byGroup = new Map()
  rows.forEach((row) => {
    const g = row.displayGroup || 'Other'
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g).push(row)
  })
  return Array.from(byGroup.entries()).map(([groupName, groupRows]) => ({
    groupName,
    rows: groupRows,
  }))
}

function filterRows(rows, query) {
  if (!query || !query.trim()) return rows
  const q = query.trim().toLowerCase()
  return rows.filter(
    (r) =>
      (r.feature && r.feature.toLowerCase().includes(q)) ||
      (r.displayGroup && r.displayGroup.toLowerCase().includes(q)) ||
      (r.endUserCategory && r.endUserCategory.toLowerCase().includes(q)) ||
      (r.initiativeType && r.initiativeType.toLowerCase().includes(q)) ||
      (r.monetizationModel && r.monetizationModel.toLowerCase().includes(q)) ||
      (r.focusTimeframe && r.focusTimeframe.toLowerCase().includes(q)) ||
      (r.development && r.development.toLowerCase().includes(q)) ||
      (r.priority != null && String(r.priority).includes(q))
  )
}

function roadmapFilterSummary(search) {
  if (!search?.trim()) return ''
  return ` (search "${search.trim()}")`
}

/** Stack bullet points vertically: newline-separated with "o " sub-bullets, or semicolon-separated */
function formatFeatureContent(featureText) {
  if (!featureText) return null
  // Newline-separated (e.g. Outdoor Equipment Data with section headers and "o " sub-bullets)
  if (featureText.includes('\n')) {
    const lines = featureText.split('\n').map((s) => s.trim()).filter(Boolean)
    return (
      <>
        {lines.map((line, i) => {
          if (line.startsWith('o ')) {
            return (
              <div key={i} className="features-cell-list-item features-cell-subbullet">
                <span className="features-cell-bullet" aria-hidden>◦ </span>
                {line.slice(2)}
              </div>
            )
          }
          return (
            <div key={i} className={`features-cell-list-item ${i > 0 ? 'features-cell-section-head' : ''}`}>
              {line}
            </div>
          )
        })}
      </>
    )
  }
  // Semicolon-separated (e.g. Equipment Data: Key summary metrics...)
  if (featureText.includes('; ')) {
    const parts = featureText.split('; ').map((s) => s.trim()).filter(Boolean)
    if (parts.length <= 1) return featureText
    return (
      <>
        {parts[0]}
        {parts.slice(1).map((p, i) => (
          <div key={i} className="features-cell-list-item">
            <span className="features-cell-bullet" aria-hidden>• </span>
            {p}
          </div>
        ))}
      </>
    )
  }
  return featureText
}

export default function SkyportCare() {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState(createDefaultSortConfig)
  const [viewMode, setViewMode] = useState('grouped')
  const [openGroups, setOpenGroups] = useState(new Set())
  const [showCategoryChart, setShowCategoryChart] = useState(false)
  const { getStatus } = useFeatureProgress('skyportCare', {
    initialDone: Array.from(skyportCareFeaturesDone),
    initialPartial: Array.from(skyportCareFeaturesPartial),
  })

  const rowsWithGroups = useMemo(() => getRowsWithGroups(skyportCareFeaturesRows), [])
  const filteredRows = useMemo(() => filterRows(rowsWithGroups, search), [rowsWithGroups, search])
  const sortedRows = useMemo(
    () => sortFeatureRows(filteredRows, sortConfig.key, sortConfig.dir),
    [filteredRows, sortConfig.key, sortConfig.dir],
  )
  const groups = useMemo(() => buildGroups(sortedRows), [sortedRows])
  const filterSummary = roadmapFilterSummary(search)

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  const expandAll = () => setOpenGroups(new Set(groups.map((g) => g.groupName)))
  const collapseAll = () => setOpenGroups(new Set())

  return (
    <article className="skyport-care-page">
      <header className="skyport-care-header">
        <h1>SkyportCare</h1>
        <p className="skyport-care-tagline">
          Dealer execution at scale — the dealer operating layer across the full lifecycle.
        </p>
        <figure className="skyport-care-hero">
          <img
            src={`${import.meta.env.BASE_URL}images/skyport-care-hero.png`}
            alt="Daikin service technician with Daikin service van"
            width={1024}
            height={532}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <nav className="skyport-home-nav" aria-label="Page sections">
          <a href="#roadmap">Roadmap</a>
          <a href="#demo">Concept Demo</a>
        </nav>
      </header>

      <section id="roadmap" className="skyport-care-section skyport-care-section-features">
        <h2 className="skyport-care-section-title">Roadmap</h2>
        <p className="skyport-care-section-desc">
          Feature / Function groups, initiative types, end user categories, monetization, focus timeframe, priority, and
          development scope.
        </p>

        {!showCategoryChart ? (
          <p className="features-chart-toggle-wrap">
            <button
              type="button"
              className="features-chart-toggle-btn"
              onClick={() => setShowCategoryChart(true)}
              aria-expanded={false}
            >
              Graphical view: Feature/Function by End User Category
            </button>
          </p>
        ) : (
          <div className="features-chart-visible">
            <p className="features-chart-toggle-wrap features-chart-toggle-wrap--top">
              <button
                type="button"
                className="features-chart-toggle-btn features-chart-toggle-btn--hide"
                onClick={() => setShowCategoryChart(false)}
                aria-expanded={true}
              >
                Hide
              </button>
            </p>
            <FeaturesCategoryChart rows={filteredRows} />
          </div>
        )}

        <div className="features-toolbar">
          <div className="features-search-wrap">
            <label htmlFor="skyport-care-features-search" className="features-search-label">
              Search
            </label>
            <input
              id="skyport-care-features-search"
              type="search"
              placeholder="Search by feature, group, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="features-search-input"
              aria-label="Search roadmap"
            />
          </div>
          <div className="features-view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`features-view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
            >
              By group
            </button>
            <button
              type="button"
              className={`features-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Full table
            </button>
          </div>
          {viewMode === 'grouped' && (
            <div className="features-accordion-actions">
              <button type="button" className="features-expand-btn" onClick={expandAll}>
                Expand all
              </button>
              <button type="button" className="features-expand-btn" onClick={collapseAll}>
                Collapse all
              </button>
            </div>
          )}
        </div>

        <div className="features-legend" aria-label="Row status legend">
          <span className="features-legend-item">
            <span className="features-legend-swatch features-legend-swatch--done" aria-hidden />
            <span>Done</span>
          </span>
          <span className="features-legend-item">
            <span className="features-legend-swatch features-legend-swatch--partial" aria-hidden />
            <span>Partially done</span>
          </span>
        </div>

        {viewMode === 'grouped' ? (
          <div className="features-grouped">
            <p className="features-result-count">
              {sortedRows.length} feature{sortedRows.length !== 1 ? 's' : ''}
              {filterSummary} in {groups.length} group{groups.length !== 1 ? 's' : ''}
            </p>
            <div className="features-accordion">
              {groups.map(({ groupName, rows: groupRows }) => (
                <div key={groupName} className="features-accordion-item">
                  <button
                    type="button"
                    className="features-accordion-trigger"
                    onClick={() => toggleGroup(groupName)}
                    aria-expanded={openGroups.has(groupName)}
                    aria-controls={`care-features-panel-${groupName.replace(/\s+/g, '-')}`}
                    id={`care-features-trigger-${groupName.replace(/\s+/g, '-')}`}
                  >
                    <span className="features-accordion-title">{groupName}</span>
                    <span className="features-accordion-count">{groupRows.length}</span>
                    <span className="features-accordion-icon" aria-hidden>
                      {openGroups.has(groupName) ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    id={`care-features-panel-${groupName.replace(/\s+/g, '-')}`}
                    className="features-accordion-panel"
                    role="region"
                    aria-labelledby={`care-features-trigger-${groupName.replace(/\s+/g, '-')}`}
                    hidden={!openGroups.has(groupName)}
                  >
                    <div className="features-panel-table-wrap">
                      <table className="features-table features-panel-table features-panel-table--cols-7">
                        <thead>
                          <tr>
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
                              Monetization
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
                          {groupRows.map((row, i) => {
                            const status = getStatus(row.feature)
                            return (
                              <tr key={i} className={status ? `features-row--${status}` : undefined}>
                                <td className="features-cell-feature">{formatSkyportCareFeatureCellContent(row.feature)}</td>
                                <td className="features-cell-type">{row.initiativeType}</td>
                                <td className="features-cell-category">{row.endUserCategory}</td>
                                <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                                <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
                                <td className="features-cell-priority">{row.priority ?? '—'}</td>
                                <td className="features-cell-development">{row.development || '—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="features-table-wrap">
            <p className="features-result-count">
              {sortedRows.length} feature{sortedRows.length !== 1 ? 's' : ''}
              {filterSummary}
            </p>
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
                {sortedRows.map((row, i) => {
                  const status = getStatus(row.feature)
                  return (
                    <tr key={i} className={status ? `features-row--${status}` : undefined}>
                      <td className="features-cell-group">{row.displayGroup}</td>
                      <td className="features-cell-feature">{formatSkyportCareFeatureCellContent(row.feature)}</td>
                      <td className="features-cell-type">{row.initiativeType}</td>
                      <td className="features-cell-category">{row.endUserCategory}</td>
                      <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                      <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
                      <td className="features-cell-priority">{row.priority ?? '—'}</td>
                      <td className="features-cell-development">{row.development || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="demo" className="skyport-care-section skyport-care-section-demo" aria-labelledby="skyport-care-demo-title">
        <h2 id="skyport-care-demo-title" className="skyport-care-section-title">
          SkyportCare – Concept Demo
        </h2>
        <p className="skyport-care-section-desc">
          Interactive prototype illustrating the intended dealer experience and care operating model.
        </p>
        <p className="skyport-care-demo-cta-wrap">
          <a
            href={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/demos/care`}
            target="_blank"
            rel="noopener noreferrer"
            className="skyport-care-demo-cta"
          >
            Open interactive demo ↗
          </a>
        </p>
      </section>
    </article>
  )
}
