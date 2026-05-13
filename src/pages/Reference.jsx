import { Link } from 'react-router-dom'
import { platformContent4 } from '../content/content'
import './DigitalStrategy.css'
import './Reference.css'

const STRATEGY_OPERATING_BASE = '/strategy/operating'

const FORMATS = [
  { match: 'Purpose:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What We See Today:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Matchup Xpress', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'TechHub', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'DaikinCity', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What the Platform Enables', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'The Opportunity', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Identify candidates to:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Takeaway:', fn: (s, k) => <strong key={k}>{s}</strong> },
]

const BOLD_ONLY_PHRASES = [
  'What the Platform Enables',
  'The Opportunity',
  'Identify candidates to:',
]

function formatParagraph(para) {
  const parts = []
  let rest = para
  let key = 0
  while (rest.length > 0) {
    let best = { index: -1, match: '', fn: null }
    for (const { match, fn } of FORMATS) {
      const i = rest.indexOf(match)
      if (i !== -1 && (best.index === -1 || i < best.index)) {
        best = { index: i, match, fn }
      }
    }
    if (best.index === -1) {
      parts.push(rest)
      break
    }
    if (best.index > 0) parts.push(rest.slice(0, best.index))
    parts.push(best.fn(best.match, `f-${key++}`))
    rest = rest.slice(best.index + best.match.length)
  }
  return parts.length > 1 ? parts : para
}

function isSubheading(para) {
  return (
    para.startsWith('Purpose:') ||
    BOLD_ONLY_PHRASES.some((p) => para === p || para.trim() === p) ||
    para.startsWith('What the Platform Enables') ||
    para.startsWith('The Opportunity') ||
    para.startsWith('Identify candidates to:')
  )
}

function SectionContent({ content }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="ds-content">
      {paragraphs.map((para, j) => {
        const isBoldOnly = BOLD_ONLY_PHRASES.some((p) => para === p || para.trim() === p)
        const isSub = isSubheading(para)
        const isBullet = para.startsWith('•')
        const bulletText = isBullet ? para.replace(/^[•]\s*/, '') : para
        const isTakeaway = para.startsWith('Takeaway:')
        const isPurposeLine = para.startsWith('Purpose:')
        const isWhatWeSeeTodayLine = para.startsWith('What We See Today:')
        const isLabelLine = isBoldOnly
        const blockClass = [
          j === 0 && 'ds-content-first',
          isSub && 'ds-subheading',
          isPurposeLine && 'ds-purpose-line',
          isWhatWeSeeTodayLine && 'reference-what-we-see-today-line',
          isLabelLine && 'ds-label-line',
          isBullet && 'ds-bullet',
          isTakeaway && 'ds-takeaway',
        ].filter(Boolean).join(' ')
        return (
          <p key={j} className={blockClass || undefined}>
            {isPurposeLine ? (
              <>
                <strong>Purpose:</strong> {para.slice(8).trim()}
              </>
            ) : isBoldOnly ? (
              <strong>{para}</strong>
            ) : isBullet ? (
              formatParagraph(bulletText)
            ) : (
              formatParagraph(para)
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function Reference() {
  return (
    <article className="reference-page">
      <nav className="reference-breadcrumb" aria-label="Breadcrumb">
        <Link to={`${STRATEGY_OPERATING_BASE}/platform`}>Platform</Link>
        <span className="reference-breadcrumb-sep">›</span>
        <Link to={`${STRATEGY_OPERATING_BASE}/reference`}>Reference</Link>
        <span className="reference-breadcrumb-sep">›</span>
        <span className="reference-breadcrumb-current">Tool Landscape</span>
      </nav>
      <hr className="reference-divider" />
      <header className="reference-header">
        <h1 className="reference-title">Reference: Digital Tool Landscape</h1>
      </header>
      <hr className="reference-divider" />
      <div className="reference-body reference-box">
        <SectionContent content={platformContent4} />
      </div>
    </article>
  )
}
