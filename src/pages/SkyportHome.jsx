import { useState, useMemo, useLayoutEffect, Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import { featuresRows, featuresDone, featuresPartial } from '../content/featuresData'
import { FeaturesCategoryChart } from '../components/FeaturesCategoryChart'
import { FeaturesSortableTh } from '../components/FeaturesSortableTh'
import { useFeatureProgress } from '../hooks/useFeatureProgress'
import { formatFeatureCellContent } from '../utils/formatFeatureCellContent'
import { sortFeatureRows } from '../utils/featuresRoadmapSort'
import { SKYPORT_HOME_NEST_ECOBEE_COMPARISON } from '../content/skyportHomeCompetitorComparison'
import { CompetitorComparisonCell } from '../components/CompetitorComparisonCell'
import './SkyportHome.css'
import './Features.css'

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

export default function SkyportHome({
  pageTitle = 'SkyportHome',
  pageTagline = 'Always-on homeowner engagement — features and product capabilities.',
  roadmapRows = featuresRows,
  progressScope = 'skyportHome',
  persistProgress = true,
  initialDone = Array.from(featuresDone),
  initialPartial = Array.from(featuresPartial),
}) {
  const location = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.key])

  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'priority', dir: 'asc' })
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' | 'table'
  const [openGroups, setOpenGroups] = useState(new Set())
  const [showCategoryChart, setShowCategoryChart] = useState(false)
  const { getStatus } = useFeatureProgress(progressScope, {
    persist: persistProgress,
    initialDone,
    initialPartial,
  })

  const rowsWithGroups = useMemo(() => getRowsWithGroups(roadmapRows), [roadmapRows])
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
    <article className="skyport-home-page">
      <header className="skyport-home-header">
        <h1>{pageTitle}</h1>
        <p className="skyport-home-tagline">
          {pageTagline}
        </p>
        <figure className="skyport-home-hero">
          <img
            src={`${import.meta.env.BASE_URL}images/skyport-home-hero.png`}
            alt="Homeowner using the Daikin thermostat app on a phone"
            width={1024}
            height={682}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <nav className="skyport-home-nav" aria-label="Page sections">
          <a href="#roadmap">Roadmap</a>
          <a href="#demo">Concept Demo</a>
          <a href="#competitor-comparison">Competitive Analysis</a>
        </nav>
      </header>

      <section id="roadmap" className="skyport-home-section skyport-home-section-features">
        <h2 className="skyport-home-section-title">Roadmap</h2>
        <p className="skyport-home-section-desc">
          Attributes, initiative types, end user categories, monetization, development, priority, and target.
        </p>

        {!showCategoryChart ? (
          <p className="features-chart-toggle-wrap">
            <button
              type="button"
              className="features-chart-toggle-btn"
              onClick={() => setShowCategoryChart(true)}
              aria-expanded={false}
            >
              Graphical view: Attribute by End User Category
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
            <label htmlFor="features-search" className="features-search-label">
              Search
            </label>
            <input
              id="features-search"
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
                    aria-controls={`features-panel-${groupName.replace(/\s+/g, '-')}`}
                    id={`features-trigger-${groupName.replace(/\s+/g, '-')}`}
                  >
                    <span className="features-accordion-title">{groupName}</span>
                    <span className="features-accordion-count">{groupRows.length}</span>
                    <span className="features-accordion-icon" aria-hidden>
                      {openGroups.has(groupName) ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    id={`features-panel-${groupName.replace(/\s+/g, '-')}`}
                    className="features-accordion-panel"
                    role="region"
                    aria-labelledby={`features-trigger-${groupName.replace(/\s+/g, '-')}`}
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
                              sortKey="development"
                              sortConfig={sortConfig}
                              onSort={toggleSort}
                              className="features-cell-development"
                            >
                              Development
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
                              sortKey="focusTimeframe"
                              sortConfig={sortConfig}
                              onSort={toggleSort}
                              className="features-cell-timeframe"
                            >
                              Target
                            </FeaturesSortableTh>
                          </tr>
                        </thead>
                        <tbody>
                          {groupRows.map((row, i) => {
                            const status = getStatus(row.feature)
                            return (
                              <tr key={i} className={status ? `features-row--${status}` : undefined}>
                                <td className="features-cell-feature">{formatFeatureCellContent(row.feature)}</td>
                                <td className="features-cell-type">{row.initiativeType}</td>
                                <td className="features-cell-category">{row.endUserCategory}</td>
                                <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                                <td className="features-cell-development">{row.development || '—'}</td>
                                <td className="features-cell-priority">{row.priority ?? '—'}</td>
                                <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
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
                    Attribute
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
                    sortKey="development"
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                    className="features-cell-development"
                  >
                    Development
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
                    sortKey="focusTimeframe"
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                    className="features-cell-timeframe"
                  >
                    Target
                  </FeaturesSortableTh>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => {
                  const status = getStatus(row.feature)
                  return (
                    <tr key={i} className={status ? `features-row--${status}` : undefined}>
                      <td className="features-cell-group">{row.displayGroup}</td>
                      <td className="features-cell-feature">{formatFeatureCellContent(row.feature)}</td>
                      <td className="features-cell-type">{row.initiativeType}</td>
                      <td className="features-cell-category">{row.endUserCategory}</td>
                      <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
                      <td className="features-cell-development">{row.development || '—'}</td>
                      <td className="features-cell-priority">{row.priority ?? '—'}</td>
                      <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="demo" className="skyport-home-section skyport-home-section-demo" aria-labelledby="skyport-home-demo-title">
        <h2 id="skyport-home-demo-title" className="skyport-home-section-title">
          SkyportHome – Concept Demo
        </h2>
        <p className="skyport-home-section-desc">
          Interactive prototype illustrating the intended homeowner experience and engagement model.
        </p>
        <p className="skyport-home-demo-cta-wrap">
          <a
            href={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/demos/skyport-home-concept`}
            target="_blank"
            rel="noopener noreferrer"
            className="skyport-home-demo-cta"
          >
            Open interactive demo ↗
          </a>
        </p>
        <p className="skyport-home-demo-secondary-link">
          <a
            href={`${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/demos`}
            target="_blank"
            rel="noopener noreferrer"
            className="skyport-home-demo-secondary"
          >
            Earlier Magic Patterns prototype (original embed)
          </a>
        </p>
      </section>

      <section
        id="competitor-comparison"
        className="skyport-home-section skyport-home-section-competitor"
        aria-labelledby="skyport-home-competitor-title"
      >
        <h2 id="skyport-home-competitor-title" className="skyport-home-section-title">
          Competitive Analysis — Nest, Ecobee &amp; Trane
        </h2>
        <div className="skyport-home-competitor-wrap">
          <table className="skyport-home-competitor-table">
            <thead>
              <tr>
                <th scope="col" className="skyport-home-competitor-th-feature">
                  Companies
                </th>
                <th scope="col">Nest</th>
                <th scope="col">Ecobee</th>
                <th scope="col">Trane</th>
              </tr>
            </thead>
            <tbody>
              {SKYPORT_HOME_NEST_ECOBEE_COMPARISON.map((block) => (
                <Fragment key={block.title}>
                  <tr className="skyport-home-competitor-section-row">
                    <th scope="colgroup" colSpan={4} className="skyport-home-competitor-section-th">
                      {block.title}
                    </th>
                  </tr>
                  {block.rows.map((row) => (
                    <tr key={`${block.title}-${row.feature}`}>
                      <th scope="row" className="skyport-home-competitor-th-feature">
                        {row.feature}
                      </th>
                      <td>
                        <CompetitorComparisonCell>{row.nest}</CompetitorComparisonCell>
                      </td>
                      <td>
                        <CompetitorComparisonCell>{row.ecobee}</CompetitorComparisonCell>
                      </td>
                      <td>
                        <CompetitorComparisonCell>{row.trane}</CompetitorComparisonCell>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  )
}
