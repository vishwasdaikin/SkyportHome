import { useMemo } from 'react'
import SkyportCare from './SkyportCare'
import { useSkyportCareRoadmapData } from '../hooks/useSkyportCareRoadmapData'
import {
  skyportCareFeaturesRows,
  skyportCareFeaturesDone,
  skyportCareFeaturesPartial,
} from '../content/skyportCareFeaturesData'
import { normalizeRoadmapRowsFromRaw } from '../utils/roadmapExcelRows'

export default function AppSuiteTest2() {
  const { sheetNames, getRows } = useSkyportCareRoadmapData({
    pollMs: 4000,
  })

  const sheetName = useMemo(() => {
    if (sheetNames.includes('SkyportCare')) return 'SkyportCare'
    return sheetNames[0] ?? 'SkyportCare'
  }, [sheetNames])

  const rawRows = getRows(sheetName)
  const mappedRows = useMemo(() => normalizeRoadmapRowsFromRaw(rawRows), [rawRows])
  const usingExcel = mappedRows.length > 0
  const roadmapRows = usingExcel ? mappedRows : skyportCareFeaturesRows

  return (
    <SkyportCare
      pageTitle="SkyportCare"
      pageTagline="Dealer roadmap — features and functions from connected Excel (SkyportCare_Roadmap.xlsx)."
      roadmapRows={roadmapRows}
      progressScope="skyportCareExcel"
      persistProgress={false}
      initialDone={Array.from(skyportCareFeaturesDone)}
      initialPartial={Array.from(skyportCareFeaturesPartial)}
    />
  )
}
