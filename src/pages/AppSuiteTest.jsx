import { useMemo } from 'react'
import SkyportHome from './SkyportHome'
import { useTestSheetData } from '../hooks/useTestSheetData'
import { featuresRows, featuresDone, featuresPartial } from '../content/featuresData'
import { normalizeRoadmapRowsFromRaw } from '../utils/roadmapExcelRows'

export default function AppSuiteTest() {
  const { getRows } = useTestSheetData({ pollMs: 4000 })
  const rawRows = getRows('SkyportHome')
  const mappedRows = useMemo(() => normalizeRoadmapRowsFromRaw(rawRows), [rawRows])
  const usingExcel = mappedRows.length > 0
  const roadmapRows = usingExcel ? mappedRows : featuresRows

  return (
    <SkyportHome
      pageTitle="SkyportHome"
      pageTagline="Always-on homeowner engagement — features and functions from connected Excel."
      roadmapRows={roadmapRows}
      progressScope="skyportHomeExcel"
      persistProgress={false}
      initialDone={Array.from(featuresDone)}
      initialPartial={Array.from(featuresPartial)}
    />
  )
}
