/**
 * Rich formatting for SkyportCare roadmap "Feature / Function" cells
 * (newline bullets, semicolon lists). Shared by SkyportCare page and FY26 embed.
 */
export function formatSkyportCareFeatureCellContent(featureText) {
  if (!featureText) return null
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
