import { Link } from 'react-router-dom'
import { getFy25PlaybookPdfUrl } from '../utils/fy25PlaybookPdfUrl'
import './DigitalStrategy.css'
import './FY25.css'

export default function FY25() {
  return (
    <article className="fy25-page fy25-page-simple">
      <header className="ds-header">
        <h1>FY25 strategy</h1>
        <p className="ds-tagline">Strategic Marketing FY25 Playbook (PDF).</p>
        <p className="fy25-simple-actions">
          <a
            href={getFy25PlaybookPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="fy25-download"
          >
            Open Playbook
          </a>
        </p>
        <p className="fy25-back">
          <Link to="/strategy/operating/overview">← Digital Operating Playbook</Link>
        </p>
      </header>
    </article>
  )
}
