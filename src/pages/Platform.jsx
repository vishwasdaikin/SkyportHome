import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { platformContent, platformContent2, platformContent3 } from '../content/content'
import './DigitalStrategy.css'
import './Platform.css'

const PLATFORM_SECTIONS = [
  { id: 'one-platform-lifecycle', title: 'One Platform, Two Surfaces, One Lifecycle' },
  { id: 'strategic-decision', title: 'Strategic platform decision' },
  { id: 'consistent-execution', title: 'How the Platform Delivers Consistent Execution' },
]

const FORMATS = [
  { match: 'SkyportHome', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportEnergy', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E‑Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E-Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Purpose:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'The strategic decision:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Why this matters:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What does NOT change:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Tool Orchestration Model:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Front Door', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Backend Capabilities', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Operating Principle:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Dealer Workflow: Today vs. Future', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'TODAY — Inconsistent, Installer‑Defined Workflow', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'FUTURE — Platform‑Led, Default Workflow', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E‑Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportHome (Homeowner Surface)', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare (Dealer Surface)', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportEnergy (HEMS)', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Foundational principle:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What We See Today:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What the Platform Enables', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'The Opportunity', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Identify candidates to:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Takeaway:', fn: (s, k) => <strong key={k}>{s}</strong> },
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

const BOLD_ONLY_PHRASES = [
  'The strategic decision:',
  'Why this matters:',
  'What does NOT change:',
  'Backend Capabilities',
  'Operating Principle:',
  'Dealer Workflow: Today vs. Future',
  'TODAY — Inconsistent, Installer‑Defined Workflow',
  'FUTURE — Platform‑Led, Default Workflow',
  'E‑Platform',
  'SkyportHome (Homeowner Surface)',
  'SkyportCare (Dealer Surface)',
  'SkyportEnergy (HEMS)',
  'Foundational principle:',
  'What the Platform Enables',
  'The Opportunity',
  'Identify candidates to:',
]

function isSubheading(para) {
  return (
    para.startsWith('Purpose:') ||
    BOLD_ONLY_PHRASES.some((p) => para === p || para.trim() === p) ||
    para.startsWith('Tool Orchestration Model:') ||
    para.startsWith('Backend Capabilities') ||
    para.startsWith('Operating Principle:') ||
    para.startsWith('Dealer Workflow:') ||
    para.startsWith('TODAY —') ||
    para.startsWith('FUTURE —') ||
    para.startsWith('E‑Platform') ||
    para.startsWith('SkyportHome (') ||
    para.startsWith('SkyportCare (') ||
    para.startsWith('SkyportEnergy (') ||
    para.startsWith('Foundational principle:') ||
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
        const isFoundationalPrincipleLine = para.startsWith('Foundational principle:')
        const isToolOrchestrationLine = para.startsWith('Tool Orchestration Model:')
        const isOperatingPrincipleLine = para.startsWith('Operating Principle:')
        const isLabelLine = isBoldOnly
        const blockClass = [
          j === 0 && 'ds-content-first',
          isSub && 'ds-subheading',
          isPurposeLine && 'ds-purpose-line',
          isWhatWeSeeTodayLine && 'ds-what-we-see-today-line',
          isFoundationalPrincipleLine && 'ds-foundational-principle-line',
          isToolOrchestrationLine && 'ds-tool-orchestration-line',
          isOperatingPrincipleLine && 'ds-operating-principle-line',
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
            ) : isBoldOnly ? <strong>{para}</strong> : isBullet ? formatParagraph(bulletText) : formatParagraph(para)}
          </p>
        )
      })}
    </div>
  )
}

export default function Platform() {
  const [activeSection, setActiveSection] = useState(0)

  function handleNavClick(i, e) {
    e.preventDefault()
    setActiveSection(i)
    document.getElementById(PLATFORM_SECTIONS[i].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = PLATFORM_SECTIONS.findIndex((s) => s.id === entry.target.id)
            if (index !== -1) setActiveSection(index)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    PLATFORM_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <article className="platform-page">
      <header className="ds-header">
        <h1>Dealer Platform Strategy: One Platform, One Experience</h1>
        <p className="ds-tagline">The platform decision that enables consistent execution across dealer‑executed work.</p>
      </header>
      <div className="ds-layout">
        <nav className="ds-nav" aria-label="Section navigation">
          <p className="ds-nav-title">SECTIONS</p>
          <ol className="ds-nav-list">
            {PLATFORM_SECTIONS.map((sec, i) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={`ds-nav-link ${activeSection === i ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(i, e)}
                >
                  <span className="ds-nav-num">{String(i + 1).padStart(2, '0')}</span>
                  {sec.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="ds-sections">
          <section id="one-platform-lifecycle" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">1</span>
              <h2 className="ds-section-title ds-section-title-single">One Platform, Two Surfaces, One Lifecycle</h2>
            </div>
            <SectionContent content={platformContent3} />
          </section>
          <section id="strategic-decision" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">2</span>
              <h2 className="ds-section-title ds-section-title-single">Strategic platform decision</h2>
            </div>
            <SectionContent content={platformContent} />
          </section>
          <section id="consistent-execution" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">3</span>
              <h2 className="ds-section-title ds-section-title-single">How the Platform Delivers Consistent, End‑to‑End Dealer Execution</h2>
            </div>
            {(() => {
              const takeawaySplit = 'Takeaway: One front door simplifies work while preserving existing system ownership'
              const headerLine = 'Tool Orchestration Model: Front Door vs. Backend'
              const parts = platformContent2.split(`\n\n${takeawaySplit}\n\n`)
              const topCardContent = (parts[0] ?? '') + (parts[0] ? `\n\n${takeawaySplit}` : '') || platformContent2
              const dealerWorkflowBlock = parts[1] ?? ''
              const toolOrchestrationParts = topCardContent.split(`\n\n${headerLine}\n\n`)
              const firstCardBody = toolOrchestrationParts.length > 1
                ? (toolOrchestrationParts[0] ?? '') + '\n\n' + (toolOrchestrationParts[1] ?? '')
                : topCardContent
              return (
                <div className="platform-mini-cards">
                  <div className="platform-mini-card">
                    <div className="platform-mini-card-head">
                      <span className="platform-mini-card-badge">3A</span>
                      <h3 className="platform-mini-card-title">{headerLine}</h3>
                    </div>
                    <SectionContent content={firstCardBody} />
                  </div>
                  {dealerWorkflowBlock ? (
                    <div className="platform-mini-card">
                      <div className="platform-mini-card-head">
                        <span className="platform-mini-card-badge">3B</span>
                        <h3 className="platform-mini-card-title">Dealer Workflow: Today vs. Future</h3>
                      </div>
                      <SectionContent content={dealerWorkflowBlock.replace(/^Dealer Workflow: Today vs\. Future\n\n/, '')} />
                    </div>
                  ) : null}
                </div>
              )
            })()}
          </section>
          <p className="platform-appendix-line">
            <Link to="/strategy/operating/reference" className="platform-appendix-inline">View current tool landscape &amp; consolidation context (Reference)</Link>
          </p>
        </div>
      </div>
    </article>
  )
}
