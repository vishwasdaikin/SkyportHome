import { featuresRows } from '../content/featuresData'
import { formatFeatureCellContent } from '../utils/formatFeatureCellContent'
import './Features.css'

function getRowsWithGroups(rows) {
  let currentGroup = ''
  return rows.map((row) => {
    if (row.featureGroup) currentGroup = row.featureGroup
    return { ...row, displayGroup: currentGroup }
  })
}

export default function Features() {
  const rows = getRowsWithGroups(featuresRows)

  return (
    <article className="features-page">
      <header className="features-header">
        <h1>Roadmap</h1>
        <p className="features-tagline">
          Feature / Function groups, initiative types, end user categories, monetization, priority, and development scope.
        </p>
      </header>
      <div className="features-table-wrap">
        <table className="features-table">
          <thead>
            <tr>
              <th>Feature / Function Group</th>
              <th>Feature / Function</th>
              <th>Initiative Type</th>
              <th>End User Category</th>
              <th>Monetization Model</th>
              <th className="features-cell-priority">Priority</th>
              <th>Development</th>
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
