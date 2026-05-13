import { Link } from 'react-router-dom'
import { capabilityDepthSkyportHomeContent, capabilityDepthSkyportCareContent } from '../content/content'
import './DigitalStrategy.css'
import './CapabilityDepth.css'

const STRATEGY_OPERATING_BASE = '/strategy/operating'

const SECTION_HEADERS = [
  'Homeowner Visibility & Peace of Mind',
  'Comfort & Performance Insights',
  'Energy Awareness & Optimization',
  'Education & Guidance After Install',
  'Whole‑Home & Energy Expansion',
  'Install Quality & Commissioning',
  'Proactive Diagnostics & Maintenance',
  'Dealer Workflow Efficiency',
  'Homeowner Communication & Trust',
  'Lifecycle Revenue Enablement',
]

const FORMATS = [
  { match: 'Purpose:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Takeaway:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportHome', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare', fn: (s, k) => <strong key={k}>{s}</strong> },
  ...SECTION_HEADERS.map((h) => ({ match: h, fn: (s, k) => <strong key={k}>{s}</strong> })),
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

function isSectionHeader(para) {
  return SECTION_HEADERS.some((h) => para === h || para.startsWith(h))
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
        const isBullet = para.startsWith('•')
        const bulletText = isBullet ? para.replace(/^[•]\s*/, '') : para
        const isPurposeLine = para.startsWith('Purpose:')
        const isTakeaway = para.startsWith('Takeaway:')
        const isSection = isSectionHeader(para)
        const blockClass = [
          j === 0 && 'ds-content-first',
          isSection && 'ds-subheading',
          isPurposeLine && 'ds-purpose-line',
          isTakeaway && 'ds-takeaway',
          isBullet && 'ds-bullet',
        ].filter(Boolean).join(' ')
        return (
          <p key={j} className={blockClass || undefined}>
            {isPurposeLine ? (
              <>
                <strong>Purpose:</strong> {formatParagraph(para.slice(8).trim())}
              </>
            ) : isTakeaway ? (
              formatParagraph(para)
            ) : isSection ? (
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

export default function CapabilityDepth() {
  return (
    <article className="capability-depth-page">
      <nav className="capability-depth-breadcrumb" aria-label="Breadcrumb">
        <Link to={`${STRATEGY_OPERATING_BASE}/experiences`}>Experiences</Link>
        <span className="capability-depth-breadcrumb-sep">›</span>
        <span className="capability-depth-breadcrumb-current">SkyportCare</span>
        <span className="capability-depth-breadcrumb-sep">›</span>
        <span className="capability-depth-breadcrumb-current">Capability Depth</span>
      </nav>
      <hr className="capability-depth-divider" />
      <header className="capability-depth-header">
        <h1 className="capability-depth-title">Reference: App &amp; Service Capability Depth</h1>
      </header>
      <hr className="capability-depth-divider" />
      <div className="capability-depth-body">
        <div className="capability-depth-boxes">
          <section className="capability-depth-section capability-depth-box">
            <h2 className="capability-depth-section-title">SkyportHome</h2>
            <SectionContent content={capabilityDepthSkyportHomeContent} />
          </section>
          <section className="capability-depth-section capability-depth-box">
            <h2 className="capability-depth-section-title">SkyportCare</h2>
            <SectionContent content={capabilityDepthSkyportCareContent} />
          </section>
        </div>
      </div>
    </article>
  )
}
