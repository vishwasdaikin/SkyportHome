import { Link } from 'react-router-dom'
import { getFy25PlaybookPdfUrl } from '../utils/fy25PlaybookPdfUrl'
import './AppsPage.css'
import './StrategyPage.css'

const base = import.meta.env.BASE_URL || '/'

const STRATEGY_TILES = [
  {
    to: '/strategy/fy26/res-solutions',
    title: 'FY26',
    description:
      'FY26 roadmap across Res Solutions, Digital Platform, tools & services, controls, VRV/LC solutions, IAQ & Energy, and hot water.',
    image: `${base}images/fy26-strategy.png`,
    imageAlt: 'Marketing strategy — light bulb and strategic planning concept',
  },
  {
    to: '/strategy/operating/overview',
    title: 'Digital Operating Playbook',
    description:
      'Digital strategy overview, platform, homeowner & dealer experiences, lifecycle & growth, and reference material.',
    image: `${base}images/home-repository-hero.png`,
    imageAlt: 'Connected home and sustainable living',
  },
]

function Fy25StrategyCard() {
  const pdfHref = getFy25PlaybookPdfUrl()
  return (
    <li className="apps-tile-wrap">
      <div className="apps-tile apps-tile--static" aria-labelledby="strategy-fy25-title">
        <div className="apps-tile-image-wrap">
          <img
            src={`${base}images/fy25-playbook-cover.png`}
            alt="2025 Marketing Playbook — What to Build, Develop, and Invest In"
            className="apps-tile-image apps-tile-fy25-image"
            loading="lazy"
          />
        </div>
        <div className="apps-tile-body">
          <h2 id="strategy-fy25-title" className="apps-tile-title">
            FY25
          </h2>
          <p className="apps-tile-desc">
            Strategic Marketing FY25 Playbook — FY24 results, FY25 plan, hardware initiatives, and
            financial views in one document.
          </p>
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="apps-tile-cta apps-tile-cta--external"
            aria-label="Open FY25 playbook (PDF in new tab)"
          >
            Open →
          </a>
        </div>
      </div>
    </li>
  )
}

export default function StrategyPage() {
  return (
    <article className="apps-page">
      <header className="apps-page-header">
        <h1>Strategy</h1>
        <p className="apps-page-intro strategy-page-intro">
          FY25 playbook (PDF), FY26 sectioned roadmap, and the Digital Operating Playbook — pick an entry
          point below.
        </p>
      </header>

      <ul className="apps-tiles" aria-label="Strategy areas">
        <Fy25StrategyCard />
        {STRATEGY_TILES.map((item) => (
          <li key={item.to} className="apps-tile-wrap">
            <Link to={item.to} className="apps-tile">
              <div className="apps-tile-image-wrap">
                <img src={item.image} alt={item.imageAlt} className="apps-tile-image" loading="lazy" />
              </div>
              <div className="apps-tile-body">
                <h2 className="apps-tile-title">{item.title}</h2>
                <p className="apps-tile-desc">{item.description}</p>
                <span className="apps-tile-cta">Open →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
