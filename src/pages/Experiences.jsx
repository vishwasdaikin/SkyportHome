import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { experiencesContent, skyportCareContent, ePlatformContent, skyportEnergyContent } from '../content/content'
import './DigitalStrategy.css'
import './Experiences.css'

const EXPERIENCE_SECTIONS = [
  { id: 'skyport-home', title: 'SkyportHome: Always‑On Homeowner Engagement' },
  { id: 'skyport-care', title: 'SkyportCare: Dealer Execution at Scale' },
  { id: 'e-platform', title: 'The E‑Platform Role: Demand Capture and End-to-End Orchestration' },
  { id: 'skyport-energy', title: 'SkyportEnergy: Home Energy Management and Grid Participation' },
]

const FORMATS = [
  { match: 'SkyportHome', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportCare', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'SkyportEnergy', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E‑Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'E-Platform', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Purpose:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What it is NOT:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'From As‑Is to To‑Be', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'As‑Is', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'To‑Be', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What SkyportHome enables', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What SkyportCare enables', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What the E‑Platform enables:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Education:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Inspiration:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Trust building', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Operating principle:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What SkyportEnergy is', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'What SkyportEnergy is NOT:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Enables:', fn: (s, k) => <strong key={k}>{s}</strong> },
  { match: 'Why it matters', fn: (s, k) => <strong key={k}>{s}</strong> },
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
  'What it is NOT:',
  'From As‑Is to To‑Be',
  'As‑Is',
  'To‑Be',
  'What SkyportHome enables',
  'What SkyportCare enables',
  'Education:',
  'Inspiration:',
  'Trust building',
  'Operating principle:',
  'What SkyportEnergy is',
  'What SkyportEnergy is NOT:',
  'Why it matters',
]

function isSubheading(para) {
  return (
    para.startsWith('Purpose:') ||
    BOLD_ONLY_PHRASES.some((p) => para === p || para.trim() === p) ||
    para.startsWith('What it is NOT:') ||
    para.startsWith('From As‑Is') ||
    para === 'As‑Is' ||
    para === 'To‑Be' ||
    para === '• As‑Is' ||
    para === '• To‑Be' ||
    para.startsWith('What SkyportHome enables') ||
    para.startsWith('What SkyportCare enables') ||
    para.startsWith('Across the full lifecycle:') ||
    para.startsWith('What the E‑Platform enables:') ||
    para.startsWith('Education:') ||
    para.startsWith('Inspiration:') ||
    para.startsWith('Trust building') ||
    para.startsWith('Operating principle:') ||
    para.startsWith('What SkyportEnergy is') ||
    para.startsWith('Why it matters')
  )
}

function SectionContent({ content }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const asIsToBeBulletIndices = new Set()
  let afterAsIsOrToBe = false
  const eduInspTrustBulletIndices = new Set()
  let afterEduInspTrust = false
  paragraphs.forEach((p, j) => {
    const bulletText = p.startsWith('•') ? p.replace(/^[•]\s*/, '').trim() : ''
    const isAsIsToBeMarker = p === 'As‑Is' || p === 'To‑Be' || p === '• As‑Is' || p === '• To‑Be' || p.trim() === 'As‑Is' || p.trim() === 'To‑Be' || p.trim() === '• As‑Is' || p.trim() === '• To‑Be'
    const isEduInspTrustMarker = p.startsWith('•') && (bulletText.startsWith('Education:') || bulletText.startsWith('Inspiration:') || bulletText === 'Trust building')
    if (isAsIsToBeMarker) {
      afterAsIsOrToBe = true
    } else if (p.startsWith('•') && afterAsIsOrToBe) {
      asIsToBeBulletIndices.add(j)
    } else if (!p.startsWith('•')) {
      afterAsIsOrToBe = false
    }
    if (isEduInspTrustMarker) {
      afterEduInspTrust = true
    } else if (p.startsWith('•') && afterEduInspTrust) {
      eduInspTrustBulletIndices.add(j)
    } else if (!p.startsWith('•')) {
      afterEduInspTrust = false
    }
  })

  return (
    <div className="ds-content">
      {paragraphs.map((para, j) => {
        const isBoldOnly = BOLD_ONLY_PHRASES.some((p) => para === p || para.trim() === p)
        const isSub = isSubheading(para)
        const isBullet = para.startsWith('•')
        const bulletText = isBullet ? para.replace(/^[•]\s*/, '') : para
        const isTakeaway = para.startsWith('Takeaway:')
        const isPurposeLine = para.startsWith('Purpose:')
        const isLabelLine = isBoldOnly
        const isFromAsIsToBe = para === 'From As‑Is to To‑Be' || para.trim() === 'From As‑Is to To‑Be'
        const isAsIsOrToBe = para === 'As‑Is' || para === 'To‑Be' || para === '• As‑Is' || para === '• To‑Be' || para.trim() === 'As‑Is' || para.trim() === 'To‑Be' || para.trim() === '• As‑Is' || para.trim() === '• To‑Be'
        const isAsIsToBeBullet = isBullet && asIsToBeBulletIndices.has(j)
        const isEduInspTrustBullet = isBullet && eduInspTrustBulletIndices.has(j)
        const isIndentBullet = isAsIsToBeBullet || isEduInspTrustBullet
        const isEduInspTrustHeader = isBullet && (bulletText.startsWith('Education:') || bulletText.startsWith('Inspiration:') || bulletText === 'Trust building')
        const hasColon = para.includes(':')
        const labelAndRest = hasColon ? (() => {
          const idx = para.indexOf(':')
          return { label: para.slice(0, idx + 1), rest: para.slice(idx + 1).trim() }
        })() : null
        const isLabelRestLine = !!labelAndRest && labelAndRest.rest && !isPurposeLine
        const blockClass = [
          j === 0 && 'ds-content-first',
          isSub && 'ds-subheading',
          isPurposeLine && 'ds-purpose-line',
          isLabelRestLine && 'ds-label-rest-line',
          isLabelLine && 'ds-label-line',
          isFromAsIsToBe && 'ds-from-as-is-to-be',
          isAsIsOrToBe && 'ds-as-is-to-be-item',
          isEduInspTrustHeader && 'ds-edu-insp-trust-item',
          isBullet && 'ds-bullet',
          isIndentBullet && 'ds-bullet-indent',
          isTakeaway && 'ds-takeaway',
        ].filter(Boolean).join(' ')

        let content
        if (isPurposeLine) {
          content = (
            <>
              <strong>Purpose:</strong> {para.slice(8).trim()}
            </>
          )
        } else if (isBullet) {
          content = formatParagraph(bulletText)
        } else if (labelAndRest && labelAndRest.rest) {
          content = (
            <>
              <strong>{labelAndRest.label}</strong>
              {<> {formatParagraph(labelAndRest.rest)}</>}
            </>
          )
        } else if (isBoldOnly) {
          content = <strong>{para}</strong>
        } else {
          content = formatParagraph(para)
        }

        return (
          <p key={j} className={blockClass || undefined}>
            {content}
          </p>
        )
      })}
    </div>
  )
}

export default function Experiences() {
  const [activeSection, setActiveSection] = useState(0)

  function handleNavClick(i, e) {
    e.preventDefault()
    setActiveSection(i)
    document.getElementById(EXPERIENCE_SECTIONS[i].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = EXPERIENCE_SECTIONS.findIndex((s) => s.id === entry.target.id)
            if (index !== -1) setActiveSection(index)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    EXPERIENCE_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <article className="experiences-page">
      <header className="ds-header">
        <h1>Experiences</h1>
        <p className="ds-tagline">Homeowner and dealer experiences: SkyportHome, SkyportCare, E‑Platform, and SkyportEnergy.</p>
      </header>
      <div className="ds-layout">
        <nav className="ds-nav" aria-label="Section navigation">
          <p className="ds-nav-title">SECTIONS</p>
          <ol className="ds-nav-list">
            {EXPERIENCE_SECTIONS.map((sec, i) => (
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
          <section id="skyport-home" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">1</span>
              <h2 className="ds-section-title ds-section-title-single">{EXPERIENCE_SECTIONS[0].title}</h2>
            </div>
            <SectionContent content={experiencesContent} />
          </section>
          <section id="skyport-care" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">2</span>
              <h2 className="ds-section-title ds-section-title-single">{EXPERIENCE_SECTIONS[1].title}</h2>
            </div>
            <SectionContent content={skyportCareContent} />
          </section>
          <section id="e-platform" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">3</span>
              <h2 className="ds-section-title ds-section-title-single">{EXPERIENCE_SECTIONS[2].title}</h2>
            </div>
            <SectionContent content={ePlatformContent} />
          </section>
          <section id="skyport-energy" className="ds-section ds-section-single">
            <div className="ds-section-header">
              <span className="ds-section-badge">4</span>
              <h2 className="ds-section-title ds-section-title-single">{EXPERIENCE_SECTIONS[3].title}</h2>
            </div>
            <SectionContent content={skyportEnergyContent} />
          </section>
          <p className="experiences-appendix-line">
            <Link to="/strategy/operating/experiences/capability-depth" className="experiences-appendix-inline">Reference – App &amp; Service Capability Depth</Link>
          </p>
        </div>
      </div>
    </article>
  )
}
