import { Link } from 'react-router-dom'
import './MainPage.css'

export default function MainPage() {
  return (
    <article className="main-page">
      <div className="main-hero">
        <h1 className="main-title">Skyport</h1>
        <p className="main-subtitle">Digital Strategy & Key Updates</p>
        <div className="main-playbook-cta">
          <p className="main-playbook-label">Go to playbook</p>
          <div className="main-playbook-links">
            <Link to="/strategy/fy26" className="main-playbook-link">FY26</Link>
            <Link to="/playbook/operating/overview" className="main-playbook-link main-playbook-link-primary">Digital Operating Playbook</Link>
          </div>
        </div>
      </div>
    </article>
  )
}
