import { useMemo } from 'react'
import { useDigitalPlatformsBusinessModelData } from '../hooks/useDigitalPlatformsBusinessModelData'
import {
  parseBusinessModelGrid,
  BUSINESS_MODEL_DEFAULT_SHEET,
} from '../utils/digitalPlatformsBusinessModelGrid'
import {
  BmSectionHeadRow,
  BmSubHeadRow,
  BmDataRow,
  cell,
  DigitalPlatformsBusinessModelTable,
} from './DigitalPlatformsBusinessModelTable'

/**
 * Renders the Digital Platforms business model from `Digital_Platforms_Business_Model.xlsx`
 * (sheet {@link BUSINESS_MODEL_DEFAULT_SHEET} by default). Falls back to the static table if
 * the workbook is missing or cannot be parsed.
 */
export function DigitalPlatformsBusinessModelTableFromExcel({
  sheetName = BUSINESS_MODEL_DEFAULT_SHEET,
  grids: gridsProp,
  workbook: workbookProp,
  loading: loadingProp,
  error: errorProp,
} = {}) {
  const useExternal = gridsProp !== undefined
  const internal = useDigitalPlatformsBusinessModelData({ pollMs: 4000, enabled: !useExternal })
  const grids = useExternal ? gridsProp : internal.grids
  const workbook = workbookProp ?? internal.workbook
  const loading = loadingProp ?? internal.loading
  const error = errorProp !== undefined ? errorProp : internal.error

  const parsed = useMemo(() => {
    const grid = grids[sheetName] ?? grids[BUSINESS_MODEL_DEFAULT_SHEET]
    if (!grid) return null
    return parseBusinessModelGrid(grid, sheetName)
  }, [grids, sheetName])

  if (loading && !parsed) {
    return (
      <div className="fy26-business-model-scroll" tabIndex={0}>
        <p className="ds-subheading">Loading business model from Excel…</p>
      </div>
    )
  }

  if (error || !parsed) {
    return (
      <>
        {error ? (
          <p className="ds-subheading" role="status">
            Business model Excel unavailable ({error.message}). Showing bundled snapshot.
          </p>
        ) : null}
        <DigitalPlatformsBusinessModelTable />
      </>
    )
  }

  const { columnKeys, segments } = parsed
  const colSpan = columnKeys.length + 1

  return (
    <div className="fy26-business-model-scroll" tabIndex={0}>
      <table className="fy26-business-model-table">
        <caption className="fy26-bm-caption">
          User &amp; subscription growth and revenue projection — live from{' '}
          <strong>{workbook || 'Digital_Platforms_Business_Model.xlsx'}</strong>
          {sheetName ? (
            <>
              {' '}
              (sheet: <strong>{sheetName}</strong>)
            </>
          ) : null}
          .
        </caption>
        <thead>
          <tr>
            <th scope="col" className="fy26-bm-corner">
              Row labels
            </th>
            {columnKeys.map((c, i) => (
              <th key={`h-${i}`} scope="col" className="fy26-bm-col-head">
                {c || '—'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, idx) => {
            if (seg.type === 'section') {
              return <BmSectionHeadRow key={`s-${idx}`} title={seg.title} colSpan={colSpan} />
            }
            if (seg.type === 'subhead') {
              return (
                <BmSubHeadRow
                  key={`sh-${idx}`}
                  title={seg.title}
                  pillar={seg.pillar}
                  colSpan={colSpan}
                />
              )
            }
            if (seg.type === 'totalRevenue') {
              const vals = [...seg.values]
              while (vals.length < columnKeys.length) vals.push('')
              return (
                <tr key={`tr-${idx}`} className="fy26-bm-total-row">
                  <th scope="row">{seg.label}</th>
                  {columnKeys.map((_, i) => (
                    <td key={`trc-${i}`} className="fy26-bm-num">
                      {cell(vals[i])}
                    </td>
                  ))}
                </tr>
              )
            }
            const vals = [...seg.values]
            while (vals.length < columnKeys.length) vals.push('')
            return (
              <BmDataRow
                key={`d-${idx}`}
                label={seg.label}
                values={vals}
                labelClass={seg.labelClass}
                getCellClassName={seg.getCellClassName}
                columnKeys={columnKeys}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
