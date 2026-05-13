import { useLayoutEffect, useMemo, useState } from 'react'
import { featuresRows } from '../content/featuresData'
import { skyportCareFeaturesRows } from '../content/skyportCareFeaturesData'
import { useTestSheetData } from '../hooks/useTestSheetData'
import { useSkyportCareRoadmapData } from '../hooks/useSkyportCareRoadmapData'
import { normalizeRoadmapRowsFromRaw } from '../utils/roadmapExcelRows'
import { formatFeatureCellContent } from '../utils/formatFeatureCellContent'
import { formatSkyportCareFeatureCellContent } from '../utils/formatSkyportCareFeatureCellContent'
import {
  ROADMAP_INITIATIVE_ORDER_SKYPORT_CARE,
  ROADMAP_INITIATIVE_ORDER_SKYPORT_HOME,
  ROADMAP_NESTED_SORT_KEYS_FULL,
} from '../utils/roadmapInitiativeCategoryTree'
import { RoadmapNestedByInitiativeTable } from './RoadmapNestedByInitiativeTable'
import '../pages/Features.css'

function getRowsWithGroups(rows) {
  let currentGroup = ''
  return rows.map((row) => {
    if (row.featureGroup) currentGroup = row.featureGroup
    return { ...row, displayGroup: currentGroup }
  })
}

/**
 * Expandable full roadmap tables for FY26 Digital Apps & Services.
 * Rows load from SkyportHome_Roadmap.xlsx and SkyportCare_Roadmap.xlsx (dev plugin / prod JSON),
 * with fallback to bundled static data if nothing normalizes.
 */
export function Fy26DigitalAppsRoadmapEmbeds({ forceExpandRoadmaps }) {
  const { getRows: getHomeRows } = useTestSheetData({ pollMs: 4000 })
  const { sheetNames, getRows: getCareRows } = useSkyportCareRoadmapData({ pollMs: 4000 })

  const careSheetName = useMemo(() => {
    if (sheetNames.includes('SkyportCare')) return 'SkyportCare'
    return sheetNames[0] ?? 'SkyportCare'
  }, [sheetNames])

  const homeRoadmapRows = useMemo(() => {
    const raw = getHomeRows('SkyportHome')
    const mapped = normalizeRoadmapRowsFromRaw(raw)
    return mapped.length > 0 ? mapped : featuresRows
  }, [getHomeRows])

  const careRoadmapRows = useMemo(() => {
    const raw = getCareRows(careSheetName)
    const mapped = normalizeRoadmapRowsFromRaw(raw)
    return mapped.length > 0 ? mapped : skyportCareFeaturesRows
  }, [getCareRows, careSheetName])

  const homeRows = useMemo(() => getRowsWithGroups(homeRoadmapRows), [homeRoadmapRows])
  const careRows = useMemo(() => getRowsWithGroups(careRoadmapRows), [careRoadmapRows])

  const [homeOpen, setHomeOpen] = useState(false)
  const [careOpen, setCareOpen] = useState(false)

  useLayoutEffect(() => {
    if (forceExpandRoadmaps) {
      setHomeOpen(true)
      setCareOpen(true)
    }
  }, [forceExpandRoadmaps])

  const [sortHome, setSortHome] = useState({ key: 'priority', dir: 'asc' })
  const [sortCare, setSortCare] = useState({ key: 'priority', dir: 'asc' })

  const toggleSortHome = (key) => {
    if (!ROADMAP_NESTED_SORT_KEYS_FULL.includes(key)) return
    setSortHome((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }
  const toggleSortCare = (key) => {
    if (!ROADMAP_NESTED_SORT_KEYS_FULL.includes(key)) return
    setSortCare((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className="fy26-digital-apps-roadmap-embeds">
      <div className="fy26-digital-apps-roadmap-embed fy26-digital-apps-roadmap-embed--skyport-home">
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
            Detailed SkyportHome Roadmap
          </span>
        </button>
        {homeOpen && (
          <div
            className="fy26-digital-apps-roadmap-panel"
            role="region"
            aria-labelledby="fy26-roadmap-skyport-home-toggle"
          >
            <div className="features-table-wrap fy26-digital-apps-roadmap-table-wrap">
              <RoadmapNestedByInitiativeTable
                rows={homeRows}
                sortConfig={sortHome}
                onSort={toggleSortHome}
                variant="full"
                formatFeature={formatFeatureCellContent}
                initiativeStableOrder={ROADMAP_INITIATIVE_ORDER_SKYPORT_HOME}
              />
            </div>
          </div>
        )}
      </div>

      <div className="fy26-digital-apps-roadmap-embed fy26-digital-apps-roadmap-embed--skyport-care">
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
            Detailed SkyportCare Roadmap
          </span>
        </button>
        {careOpen && (
          <div
            className="fy26-digital-apps-roadmap-panel"
            role="region"
            aria-labelledby="fy26-roadmap-skyport-care-toggle"
          >
            <div className="features-table-wrap fy26-digital-apps-roadmap-table-wrap">
              <RoadmapNestedByInitiativeTable
                rows={careRows}
                sortConfig={sortCare}
                onSort={toggleSortCare}
                variant="full"
                formatFeature={formatSkyportCareFeatureCellContent}
                initiativeStableOrder={ROADMAP_INITIATIVE_ORDER_SKYPORT_CARE}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
