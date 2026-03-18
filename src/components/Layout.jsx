import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { isAzureAuthEnabled, isBackendAuthEnabled } from '../auth/authConfig'
import AuthNav from '../auth/AuthNav'
import AuthNavBackend from '../auth/AuthNavBackend'
import './Layout.css'

const APPS_BASE = '/apps'
const STRATEGY_OPERATING_BASE = '/strategy/operating'
const STRATEGY_FY26_BASE = '/strategy/fy26'

const FY26_NAV_ITEMS = [
  { path: 'res-solutions', label: 'Res Solutions' },
  { path: 'digital-platform', label: 'Digital Platform' },
  { path: 'digital-tools-services', label: 'Digital Tools & Services' },
  { path: 'res-controls-thermostats', label: 'Res Controls & Thermostats' },
  { path: 'vrv-controls-solutions', label: 'VRV Controls & Solutions' },
  { path: 'lc-controls-solutions', label: 'LC Controls & Solutions' },
  { path: 'iaq-energy', label: 'IAQ & Energy' },
  { path: 'hot-water-solutions', label: 'Hot Water Solutions' },
]

export default function Layout({ children }) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [strategyOpen, setStrategyOpen] = useState(false)
  const strategyRef = useRef(null)
  const location = useLocation()
  const isOperatingPlaybook = location.pathname.startsWith(STRATEGY_OPERATING_BASE)
  const isFY26 = location.pathname.startsWith(STRATEGY_FY26_BASE)

  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setStrategyOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e) {
      if (strategyRef.current && !strategyRef.current.contains(e.target)) setStrategyOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`app-layout ${isOperatingPlaybook ? 'app-layout--playbook' : ''} ${isFY26 ? 'app-layout--fy26' : ''}`}>
      <header className="app-header">
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>

          <NavLink to={`${APPS_BASE}/skyport-home`} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            SkyportHome
          </NavLink>
          <NavLink to={`${APPS_BASE}/skyport-care`} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            SkyportCare
          </NavLink>
          <NavLink to={`${APPS_BASE}/skyport-energy`} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            SkyportEnergy
          </NavLink>

          <div className="app-nav-dropdown" ref={strategyRef}>
            <button
              type="button"
              className={`app-nav-link app-nav-dropdown-trigger ${location.pathname.startsWith('/strategy') ? 'active' : ''}`}
              onClick={() => setStrategyOpen((o) => !o)}
              aria-expanded={strategyOpen}
              aria-haspopup="true"
            >
              Strategy ▾
            </button>
            {strategyOpen && (
              <div className="app-nav-dropdown-menu">
                <NavLink to="/strategy/fy25" className="app-nav-dropdown-item">FY25</NavLink>
                <NavLink to="/strategy/fy26" className="app-nav-dropdown-item">FY26</NavLink>
                <NavLink to={`${STRATEGY_OPERATING_BASE}/overview`} className="app-nav-dropdown-item">Operating Playbook</NavLink>
              </div>
            )}
          </div>

          <NavLink to="/demos" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            Demos
          </NavLink>
          <NavLink to="/test" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            Test
          </NavLink>

          <NavLink to="/image" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            Image
          </NavLink>
          {isBackendAuthEnabled() && <AuthNavBackend />}
          {!isBackendAuthEnabled() && isAzureAuthEnabled && <AuthNav />}
        </nav>
      </header>
      {isOperatingPlaybook && (
        <nav className="app-playbook-nav" aria-label="Operating Playbook">
          <NavLink to={`${STRATEGY_OPERATING_BASE}/overview`} className={({ isActive }) => `app-playbook-nav-link ${isActive ? 'active' : ''}`} end>
            Overview
          </NavLink>
          <NavLink to={`${STRATEGY_OPERATING_BASE}/platform`} className={({ isActive }) => `app-playbook-nav-link ${isActive ? 'active' : ''}`}>
            Platform
          </NavLink>
          <NavLink to={`${STRATEGY_OPERATING_BASE}/experiences`} className={({ isActive }) => `app-playbook-nav-link ${isActive ? 'active' : ''}`}>
            Experiences
          </NavLink>
          <NavLink to={`${STRATEGY_OPERATING_BASE}/lifecycle-growth`} className={({ isActive }) => `app-playbook-nav-link ${isActive ? 'active' : ''}`}>
            Lifecycle & Growth
          </NavLink>
        </nav>
      )}
      {isFY26 && (
        <nav className="app-fy26-nav" aria-label="FY26 sections">
          {FY26_NAV_ITEMS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={`${STRATEGY_FY26_BASE}/${path}`}
              className={({ isActive }) => `app-fy26-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
      <main className={`app-main ${location.pathname === '/demos' ? 'app-main--full-bleed' : ''}`}>
        {children}
      </main>
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  )
}
