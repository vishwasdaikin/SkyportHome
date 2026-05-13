function IconYes() {
  return (
    <svg
      className="competitor-cell-svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#16a34a" />
      <path
        d="M5.5 10.2l2.8 2.7L14.5 6.8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconNo() {
  return (
    <svg
      className="competitor-cell-svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#fee2e2" />
      <path
        d="M6.5 6.5l7 7M13.5 6.5l-7 7"
        stroke="#dc2626"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const YES = '✅'
const NO = '❌'

/**
 * Renders competitor matrix cell text, swapping leading ✅/❌ for SVG icons.
 */
export function CompetitorComparisonCell({ children }) {
  const raw = children == null ? '' : String(children)
  const trimmed = raw.trim()
  let kind = null
  let rest = trimmed

  if (trimmed.startsWith(YES)) {
    kind = 'yes'
    rest = trimmed.slice(YES.length).trim()
  } else if (trimmed.startsWith(NO)) {
    kind = 'no'
    rest = trimmed.slice(NO.length).trim()
  }

  const a11yPrefix = kind === 'yes' ? 'Yes.' : kind === 'no' ? 'No.' : ''

  return (
    <span className="competitor-cell">
      {kind ? (
        <>
          <span className="competitor-cell-sr">{a11yPrefix}</span>
          <span className={`competitor-cell-icon competitor-cell-icon-${kind}`}>
            {kind === 'yes' ? <IconYes /> : <IconNo />}
          </span>
        </>
      ) : null}
      {rest ? <span className="competitor-cell-note">{rest}</span> : null}
    </span>
  )
}
