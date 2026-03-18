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
  const [appsOpen, setAppsOpen] = useState(false)
  const strategyRef = useRef(null)
  const appsRef = useRef(null)
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
    setAppsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e) {
      if (strategyRef.current && !strategyRef.current.contains(e.target)) setStrategyOpen(false)
      if (appsRef.current && !appsRef.current.contains(e.target)) setAppsOpen(false)
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
        <NavLink
          to="/"
          end
          className={({ isActive }) => `app-nav-logo ${isActive ? 'active' : ''}`}
          aria-label="Skyport home"
        >
          <span className="app-nav-logo-inner" aria-hidden>
            <svg
              className="app-nav-logo-svg"
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="appNavBrandOrb" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00b4ff" />
                  <stop offset="1" stopColor="#0097e0" />
                </linearGradient>
                <linearGradient id="appNavBrandGlow" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0097e0" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#0077b6" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="url(#appNavBrandGlow)" />
              <ellipse
                cx="16"
                cy="16"
                rx="12"
                ry="5"
                stroke="url(#appNavBrandOrb)"
                strokeWidth="1.2"
                strokeOpacity="0.45"
                transform="rotate(-28 16 16)"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="12"
                ry="5"
                stroke="url(#appNavBrandOrb)"
                strokeWidth="1.2"
                strokeOpacity="0.35"
                transform="rotate(32 16 16)"
              />
              <circle cx="16" cy="16" r="6.5" fill="url(#appNavBrandOrb)" />
              <circle cx="16" cy="16" r="3" fill="#fff" fillOpacity="0.35" />
              <circle cx="23.5" cy="9" r="2.75" fill="url(#appNavBrandOrb)" stroke="#fff" strokeWidth="0.75" strokeOpacity="0.5" />
            </svg>
          </span>
        </NavLink>
        <nav className="app-nav app-nav--centered" aria-label="Main">
          <NavLink to="/" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>

          <div className="app-nav-dropdown" ref={appsRef}>
            <button
              type="button"
              className={`app-nav-link app-nav-dropdown-trigger ${location.pathname.startsWith(APPS_BASE) ? 'active' : ''}`}
              onClick={() => setAppsOpen((o) => !o)}
              aria-expanded={appsOpen}
              aria-haspopup="true"
            >
              App Suite ▾
            </button>
            {appsOpen && (
              <div className="app-nav-dropdown-menu">
                <NavLink to={APPS_BASE} end className="app-nav-dropdown-item" onClick={() => setAppsOpen(false)}>
                  Apps Overview
                </NavLink>
                <NavLink
                  to={`${APPS_BASE}/skyport-home`}
                  className="app-nav-dropdown-item"
                  onClick={() => setAppsOpen(false)}
                >
                  SkyportHome
                </NavLink>
                <NavLink
                  to={`${APPS_BASE}/skyport-care`}
                  className="app-nav-dropdown-item"
                  onClick={() => setAppsOpen(false)}
                >
                  SkyportCare
                </NavLink>
                <NavLink
                  to={`${APPS_BASE}/skyport-energy`}
                  className="app-nav-dropdown-item"
                  onClick={() => setAppsOpen(false)}
                >
                  SkyportEnergy
                </NavLink>
              </div>
            )}
          </div>

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
                <NavLink
                  to="/strategy"
                  end
                  className="app-nav-dropdown-item"
                  onClick={() => setStrategyOpen(false)}
                >
                  All strategy
                </NavLink>
                <NavLink
                  to="/strategy/fy26"
                  className="app-nav-dropdown-item"
                  onClick={() => setStrategyOpen(false)}
                >
                  FY26
                </NavLink>
                <NavLink
                  to={`${STRATEGY_OPERATING_BASE}/overview`}
                  className="app-nav-dropdown-item"
                  onClick={() => setStrategyOpen(false)}
                >
                  Digital Operating Playbook
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/demos" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            Demos
          </NavLink>

          <NavLink to="/image" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
            Image
          </NavLink>
        </nav>
        <div className="app-header-auth">
          {isBackendAuthEnabled() && <AuthNavBackend />}
          {!isBackendAuthEnabled() && isAzureAuthEnabled && <AuthNav />}
        </div>
      </header>
      {isOperatingPlaybook && (
        <nav className="app-playbook-nav" aria-label="Digital Operating Playbook">
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
