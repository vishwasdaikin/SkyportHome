/**
 * Rich formatting for roadmap "Feature / Function" cells (SkyportHome, Features page).
 */
export function formatFeatureCellContent(featureText) {
  if (!featureText) return null

  if (featureText.includes('Temperature & humidity trend views') && featureText.includes('real‑time')) {
    const parts = featureText.split('real‑time')
    return (
      <>
        {parts[0]}
        <span className="features-cell-highlight-green">real‑time</span>
        {parts[1]}
      </>
    )
  }

  // Multiline + lettered sub-bullets (e.g. system mode a)–e), actionable savings a) b))
  if (featureText.includes('\n') && /(^|\n)[a-z]\)\s/.test(featureText)) {
    const lines = featureText.split('\n')
    const head = lines[0]?.trimEnd() ?? ''
    const tail = lines
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean)
    return (
      <span className="features-cell-feature-block">
        <span className="features-cell-feature-lead">{head}</span>
        {tail.map((line, i) => (
          <div key={i} className="features-cell-list-item">
            {line}
          </div>
        ))}
      </span>
    )
  }

  // Legacy single-line system mode (spaces before a), b), …)
  if (featureText.includes('System mode visibility (current & historical)') && featureText.includes(' a) ')) {
    const sep = '\u0001'
    const withSep = featureText
      .replace(' a) ', `${sep}a) `)
      .replace(' b) ', `${sep}b) `)
      .replace(' c) ', `${sep}c) `)
      .replace(' d) ', `${sep}d) `)
      .replace(' e) ', `${sep}e) `)
    const parts = withSep.split(sep)
    return (
      <span className="features-cell-feature-block">
        <span className="features-cell-feature-lead">{parts[0]}</span>
        {parts.slice(1).map((p, i) => (
          <div key={i} className="features-cell-list-item">
            {p}
          </div>
        ))}
      </span>
    )
  }

  return featureText
}
