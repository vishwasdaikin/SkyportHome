import { useState } from 'react'
import { sections } from '../content/content'
import './DigitalStrategy.css'

const NAV_GROUPS = [
  { label: 'FOUNDATION', indices: [0, 1] },
  { label: 'OWNERSHIP & REALITY', indices: [2, 3, 4] },
  { label: 'THE SHIFT', indices: [5, 6, 7] },
]

const NAV_LABELS = {
  6: "Platform‑Led Operating Model",
  7: "Digital DNA (Whole‑Home, Always‑On, LTV)",
}

const FORMATS = [
  { match: 'Digital Strategy & Digital Operating Playbook', fn: (s, k) => <strong key={k}><u>{s}</u></strong> },
  { match: 'SkyportHome', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportEnergy', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E‑Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E-Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Purpose:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What this playbook enables:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: "What's broken today:", fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What Digital owns:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What Digital does NOT own:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What we own:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What we do NOT own:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What the data shows:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What this means:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What We Do Well:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: "What We Don't Do Well:", fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: "What's missing today:", fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What changes with this playbook:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'How we will operate going forward:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What this operating model enables', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Digital DNA in practice:', fn: (s, k) => <strong key={k}>{s}</strong> },
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

function SectionContent({ section }) {
  const paragraphs = section.content
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
  return (
    <div className="ds-content">
      {paragraphs.map((para, j) => {
        const isBoldOnly = para === 'What this playbook enables:' || para.trim() === 'What this playbook enables:' || para === "What's broken today:" || para.trim() === "What's broken today:" || para === 'What Digital owns:' || para.trim() === 'What Digital owns:' || para === 'What Digital does NOT own:' || para.trim() === 'What Digital does NOT own:' || para === 'What we own:' || para.trim() === 'What we own:' || para === 'What we do NOT own:' || para.trim() === 'What we do NOT own:' || para === 'What the data shows:' || para.trim() === 'What the data shows:' || para === 'What this means:' || para.trim() === 'What this means:' || para === 'What We Do Well:' || para.trim() === 'What We Do Well:' || para === "What We Don't Do Well:" || para.trim() === "What We Don't Do Well:" || para === "What's missing today:" || para.trim() === "What's missing today:" || para === 'What changes with this playbook:' || para.trim() === 'What changes with this playbook:' || para === 'How we will operate going forward:' || para.trim() === 'How we will operate going forward:' || para === 'What this operating model enables' || para.trim() === 'What this operating model enables' || para === 'Digital DNA in practice:' || para.trim() === 'Digital DNA in practice:'
        const isSubheading = para.startsWith('Purpose:') || para.startsWith("What's broken today:") || para.startsWith('What Digital owns:') || para.startsWith('What Digital does NOT own:') || para.startsWith('What we own:') || para.startsWith('What we do NOT own:') || para.startsWith('What the data shows:') || para.startsWith('What this means:') || para.startsWith('What We Do Well:') || para.startsWith("What We Don't Do Well:") || para.startsWith("What's missing today:") || para.startsWith('What changes with this playbook:') || para.startsWith('How we will operate going forward:') || para.startsWith('What this operating model enables') || para.startsWith('Digital DNA in practice:') || isBoldOnly
        const isBullet = para.startsWith('•')
        const bulletText = isBullet ? para.replace(/^[•]\s*/, '') : para
        const isTakeaway = para.startsWith('Takeaway:')
        const isPurposeLine = para.startsWith('Purpose:')
        const isLabelLine = isBoldOnly
        const blockClass = [
          j === 0 && 'ds-content-first',
          isSubheading && 'ds-subheading',
          isPurposeLine && 'ds-purpose-line',
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

export default function DigitalStrategy() {
  const [activeSection, setActiveSection] = useState(0)

  function handleNavClick(i, e) {
    e.preventDefault()
    setActiveSection(i)
    document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <article className="digital-strategy-page">
      <header className="ds-header">
        <h1>Digital Strategy & Digital Operating Playbook</h1>
        <p className="ds-tagline">A leadership view of the digital operating model and what it enables.</p>
      </header>
      <div className="ds-layout">
        <nav className="ds-nav" aria-label="Section navigation">
          <p className="ds-nav-title">SECTIONS</p>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="ds-nav-group">
              <p className="ds-nav-group-title">{group.label}</p>
              <ol className="ds-nav-list">
                {group.indices.map((i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className={`ds-nav-link ${activeSection === i ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(i, e)}
                    >
                      <span className="ds-nav-num">{String(i + 1).padStart(2, '0')}</span>
                      {NAV_LABELS[i] ?? sections[i].title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>
        <div className="ds-sections">
          {sections.map((section, i) => (
            <section
              key={i}
              id={`section-${i}`}
              className="ds-section"
            >
              <div className="ds-section-header">
                <span className="ds-section-badge">{i + 1}</span>
                <h2 className="ds-section-title">{section.title}</h2>
              </div>
              {section.image && (
                <figure className="ds-section-image">
                  <img src={section.image.startsWith('/') ? section.image : `/${section.image}`} alt={section.imageAlt || section.title} />
                </figure>
              )}
              <SectionContent section={section} />
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
