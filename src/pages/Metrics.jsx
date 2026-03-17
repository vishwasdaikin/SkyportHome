import { useState, useEffect } from 'react'
import { metricsContent } from '../content/content'
import './DigitalStrategy.css'
import './Metrics.css'

const METRICS_SECTIONS = [
  { id: 'growth-repeatable', title: 'How Digital Makes Product Growth Repeatable and Scalable' },
]

const FORMATS = [
  { match: 'SkyportHome', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportEnergy', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E‑Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E-Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Purpose:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What Digital Ownership Enables', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Growth Levers Digital Enabled by Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What This Unlocks', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Where the Growth Shows Up', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Future:', fn: (s, k) => <strong key={k}>{s}</strong> },
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
  'What Digital Ownership Enables',
  'Growth Levers Digital Enabled by Platform',
  'What This Unlocks',
  'Where the Growth Shows Up',
  'Future:',
]

function SectionContent({ content }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const futureSubBulletIndices = new Set()
  let afterFuture = false
  paragraphs.forEach((p, j) => {
    const bt = p.startsWith('•') ? p.replace(/^[•]\s*/, '').trim() : ''
    const isFutureMarker = p.startsWith('•') && (bt === 'Future:' || bt === 'Future')
    if (isFutureMarker) {
      afterFuture = true
    } else if (p.startsWith('•') && afterFuture) {
      futureSubBulletIndices.add(j)
    } else if (!p.startsWith('•')) {
      afterFuture = false
    }
  })

  return (
    <div className="ds-content">
      {paragraphs.map((para, j) => {
        const isBoldOnly = BOLD_ONLY_PHRASES.some((p) => para === p || para.trim() === p)
        const isSubheading =
          para.startsWith('Purpose:') ||
          isBoldOnly ||
          para.startsWith('What Digital Ownership Enables') ||
          para.startsWith('Growth Levers') ||
          para.startsWith('What This Unlocks') ||
          para.startsWith('Where the Growth Shows Up') ||
          para.startsWith('Future:')
        const isBullet = para.startsWith('•')
        const bulletText = isBullet ? para.replace(/^[•]\s*/, '') : para
        const isFutureLine = isBullet && (bulletText.trim() === 'Future:' || bulletText.trim() === 'Future')
        const isFutureSubBullet = isBullet && futureSubBulletIndices.has(j)
        const isTakeaway = para.startsWith('Takeaway:')
        const isPurposeLine = para.startsWith('Purpose:')
        const isLabelLine = isBoldOnly
        const blockClass = [
          j === 0 && 'ds-content-first',
          isSubheading && !isFutureLine && 'ds-subheading',
          isPurposeLine && 'ds-purpose-line',
          isLabelLine && 'ds-label-line',
          isFutureLine && 'ds-future-line',
          isBullet && 'ds-bullet',
          isFutureSubBullet && 'ds-bullet-indent',
          isTakeaway && 'ds-takeaway',
        ].filter(Boolean).join(' ')
        return (
          <p key={j} className={blockClass || undefined}>
            {isPurposeLine ? (
              <>
                <strong>Purpose:</strong> {para.slice(8).trim()}
              </>
            ) : isFutureLine ? (
              formatParagraph(bulletText)
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

export default function Metrics() {
  const [activeSection, setActiveSection] = useState(0)

  function handleNavClick(i, e) {
    e.preventDefault()
    setActiveSection(i)
    document.getElementById(METRICS_SECTIONS[i].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = METRICS_SECTIONS.findIndex((s) => s.id === entry.target.id)
            if (index !== -1) setActiveSection(index)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    METRICS_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <article className="metrics-page">
      <header className="ds-header">
        <h1>Metrics</h1>
        <p className="ds-tagline">How digital makes product growth repeatable and scalable.</p>
      </header>
      <div className="ds-layout">
        <nav className="ds-nav" aria-label="Section navigation">
          <p className="ds-nav-title">SECTIONS</p>
          <ol className="ds-nav-list">
            {METRICS_SECTIONS.map((sec, i) => (
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
          <section id="growth-repeatable" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">1</span>
              <h2 className="ds-section-title ds-section-title-single">How Digital Makes Product Growth Repeatable and Scalable</h2>
            </div>
            <SectionContent content={metricsContent} />
          </section>
        </div>
      </div>
    </article>
  )
}
