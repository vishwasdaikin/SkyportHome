import { useLayoutEffect, useMemo, useState } from 'react'
import { featuresRows } from '../content/featuresData'
import { skyportCareFeaturesRows } from '../content/skyportCareFeaturesData'
import { FeaturesSortableTh } from './FeaturesSortableTh'
import { formatFeatureCellContent } from '../utils/formatFeatureCellContent'
import { formatSkyportCareFeatureCellContent } from '../utils/formatSkyportCareFeatureCellContent'
import { createDefaultSortConfig, sortFeatureRows } from '../utils/featuresRoadmapSort'
import '../pages/Features.css'

function getRowsWithGroups(rows) {
  let currentGroup = ''
  return rows.map((row) => {
    if (row.featureGroup) currentGroup = row.featureGroup
    return { ...row, displayGroup: currentGroup }
  })
}

function Fy26RoadmapEmbedThead({ sortConfig, onSort }) {
  return (
    <thead>
      <tr>
        <FeaturesSortableTh sortKey="displayGroup" sortConfig={sortConfig} onSort={onSort}>
          Feature / Function Group
        </FeaturesSortableTh>
        <FeaturesSortableTh sortKey="feature" sortConfig={sortConfig} onSort={onSort}>
          Feature / Function
        </FeaturesSortableTh>
        <FeaturesSortableTh sortKey="initiativeType" sortConfig={sortConfig} onSort={onSort}>
          Initiative Type
        </FeaturesSortableTh>
        <FeaturesSortableTh sortKey="endUserCategory" sortConfig={sortConfig} onSort={onSort}>
          End User Category
        </FeaturesSortableTh>
        <FeaturesSortableTh sortKey="monetizationModel" sortConfig={sortConfig} onSort={onSort}>
          Monetization Model
        </FeaturesSortableTh>
        <FeaturesSortableTh
          sortKey="focusTimeframe"
          sortConfig={sortConfig}
          onSort={onSort}
          className="features-cell-timeframe"
        >
          Focus Timeframe
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
          sortKey="development"
          sortConfig={sortConfig}
          onSort={onSort}
          className="features-cell-development"
        >
          Development
        </FeaturesSortableTh>
      </tr>
    </thead>
  )
}

function Fy26RoadmapEmbedTbody({ rows, formatFeature }) {
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          <td className="features-cell-group">{row.displayGroup}</td>
          <td className="features-cell-feature">{formatFeature(row.feature)}</td>
          <td className="features-cell-type">{row.initiativeType ?? '—'}</td>
          <td className="features-cell-category">{row.endUserCategory ?? '—'}</td>
          <td className="features-cell-monetization">{row.monetizationModel || '—'}</td>
          <td className="features-cell-timeframe">{row.focusTimeframe ?? '—'}</td>
          <td className="features-cell-priority">{row.priority ?? '—'}</td>
          <td className="features-cell-development">{row.development || '—'}</td>
        </tr>
      ))}
    </tbody>
  )
}

/**
 * Expandable full roadmap tables for FY26 Digital Apps & Services playbook (inline; no navigation).
 */
export function Fy26DigitalAppsRoadmapEmbeds({ forceExpandRoadmaps }) {
  const [homeOpen, setHomeOpen] = useState(false)
  const [careOpen, setCareOpen] = useState(false)

  useLayoutEffect(() => {
    if (forceExpandRoadmaps) {
      setHomeOpen(true)
      setCareOpen(true)
    }
  }, [forceExpandRoadmaps])
  const [sortHome, setSortHome] = useState(createDefaultSortConfig)
  const [sortCare, setSortCare] = useState(createDefaultSortConfig)

  const homeRows = useMemo(() => getRowsWithGroups(featuresRows), [])
  const careRows = useMemo(() => getRowsWithGroups(skyportCareFeaturesRows), [])

  const homeSorted = useMemo(
    () => sortFeatureRows(homeRows, sortHome.key, sortHome.dir),
    [homeRows, sortHome.key, sortHome.dir],
  )
  const careSorted = useMemo(
    () => sortFeatureRows(careRows, sortCare.key, sortCare.dir),
    [careRows, sortCare.key, sortCare.dir],
  )

  const toggleSortHome = (key) => {
    setSortHome((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }
  const toggleSortCare = (key) => {
    setSortCare((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className="fy26-digital-apps-roadmap-embeds">
      <div className="fy26-digital-apps-roadmap-embed">
        <button
          type="button"
          className="fy26-digital-apps-roadmap-toggle"
          onClick={() => setHomeOpen((o) => !o)}
          aria-expanded={homeOpen}
          id="fy26-roadmap-skyport-home-toggle"
        >
          <span className="fy26-digital-apps-roadmap-toggle-icon" aria-hidden>
            {homeOpen ? '▾' : '+'}
          </span>
          <span className="fy26-digital-apps-roadmap-toggle-label">
            See detailed SkyportHome features and capabilities
          </span>
        </button>
        {homeOpen && (
          <div
            className="fy26-digital-apps-roadmap-panel"
            role="region"
            aria-labelledby="fy26-roadmap-skyport-home-toggle"
          >
            <div className="features-table-wrap fy26-digital-apps-roadmap-table-wrap">
              <table className="features-table fy26-roadmap-embed-table--grouped">
                <Fy26RoadmapEmbedThead sortConfig={sortHome} onSort={toggleSortHome} />
                <Fy26RoadmapEmbedTbody rows={homeSorted} formatFeature={formatFeatureCellContent} />
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="fy26-digital-apps-roadmap-embed">
        <button
          type="button"
          className="fy26-digital-apps-roadmap-toggle"
          onClick={() => setCareOpen((o) => !o)}
          aria-expanded={careOpen}
          id="fy26-roadmap-skyport-care-toggle"
        >
          <span className="fy26-digital-apps-roadmap-toggle-icon" aria-hidden>
            {careOpen ? '▾' : '+'}
          </span>
          <span className="fy26-digital-apps-roadmap-toggle-label">
            See detailed SkyportCare features and capabilities
          </span>
        </button>
        {careOpen && (
          <div
            className="fy26-digital-apps-roadmap-panel"
            role="region"
            aria-labelledby="fy26-roadmap-skyport-care-toggle"
          >
            <div className="features-table-wrap fy26-digital-apps-roadmap-table-wrap">
              <table className="features-table fy26-roadmap-embed-table--grouped">
                <Fy26RoadmapEmbedThead sortConfig={sortCare} onSort={toggleSortCare} />
                <Fy26RoadmapEmbedTbody rows={careSorted} formatFeature={formatSkyportCareFeatureCellContent} />
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
