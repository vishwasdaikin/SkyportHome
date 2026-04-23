import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { isAzureAuthEnabled, isBackendAuthEnabled, isAuthSkipped } from '../auth/authConfig'
import { TEST_PAGE_VISIBLE, SUPPORT_NAV_VISIBLE } from '../constants/devOnlyNav'
import { DIGITAL_TOOLS_PUBLIC_SITE } from '../constants/digitalToolsPublicSite'
import AuthNav from '../auth/AuthNav'
import AuthNavBackend from '../auth/AuthNavBackend'
import './Layout.css'
import { FY26_BASE, FY26_HCM_VISIBLE, FY26_NAV_ITEMS } from '../constants/fy26Nav'
import {
  DIGITAL_TOOLS_PATH,
  DIGITAL_TOOLS_ITEMS,
  productBoardPathForDigitalTool,
} from '../content/digitalToolsNav'

const APPS_BASE = '/apps'
const SUPPORT_SKYPORTCARE_DEALER = '/support/skyportcare-dealer'
const SUPPORT_TEST_PAGE = '/support/test-page'
const PRODUCT_BOARD = '/product-board'
const STRATEGY_OPERATING_BASE = '/strategy/operating'

export default function Layout({ children }) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [strategyOpen, setStrategyOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [digitalToolsOpen, setDigitalToolsOpen] = useState(false)
  const strategyRef = useRef(null)
  const appsRef = useRef(null)
  const supportRef = useRef(null)
  const digitalToolsRef = useRef(null)
  const location = useLocation()
  const isDigitalToolsBranchActive =
    location.pathname === DIGITAL_TOOLS_PATH ||
    location.pathname === PRODUCT_BOARD
  const isOperatingPlaybook = location.pathname.startsWith(STRATEGY_OPERATING_BASE)
  const isFy26Playbook = location.pathname.startsWith(`${FY26_BASE}/`)
  const isFy26HcmPage = FY26_HCM_VISIBLE && location.pathname === `${FY26_BASE}/hcm`
  const isPlaybookSubNav = isOperatingPlaybook || (isFy26Playbook && !isFy26HcmPage)
  const isSkyportHomeApp = location.pathname === '/demos/skyport-home-concept'
  const isCareDemoPage = location.pathname.startsWith('/test-page/care-demo')
  const showFullMainNav = !DIGITAL_TOOLS_PUBLIC_SITE

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
    setSupportOpen(false)
    setDigitalToolsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    function handleClickOutside(e) {
      if (strategyRef.current && !strategyRef.current.contains(e.target)) setStrategyOpen(false)
      if (appsRef.current && !appsRef.current.contains(e.target)) setAppsOpen(false)
      if (supportRef.current && !supportRef.current.contains(e.target)) setSupportOpen(false)
      if (digitalToolsRef.current && !digitalToolsRef.current.contains(e.target)) setDigitalToolsOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className={`app-layout ${isPlaybookSubNav ? 'app-layout--playbook' : ''} ${isSkyportHomeApp || isCareDemoPage ? 'app-layout--skyport-home-app' : ''}`}
    >
      {!isSkyportHomeApp && !isCareDemoPage && !isFy26HcmPage && (
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
          <div className="app-nav-scroll">
          <NavLink to="/" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>

          {showFullMainNav && TEST_PAGE_VISIBLE ? (
            <NavLink
              to="/test-page"
              className={({ isActive }) =>
                `app-nav-link ${isActive || location.pathname.startsWith('/test-page/') ? 'active' : ''}`
              }
            >
              Test page
            </NavLink>
          ) : null}

          <div className="app-nav-dropdown" ref={digitalToolsRef}>
            <button
              type="button"
              className={`app-nav-link app-nav-dropdown-trigger ${isDigitalToolsBranchActive ? 'active' : ''}`}
              onClick={() => setDigitalToolsOpen((o) => !o)}
              aria-expanded={digitalToolsOpen}
              aria-haspopup="true"
              aria-label="Digital Tools menu"
            >
              Digital Tools ▾
            </button>
            {digitalToolsOpen && (
              <div className="app-nav-dropdown-menu">
                <NavLink
                  to={DIGITAL_TOOLS_PATH}
                  end
                  className="app-nav-dropdown-item"
                  onClick={() => setDigitalToolsOpen(false)}
                >
                  Overview
                </NavLink>
                {DIGITAL_TOOLS_ITEMS.map((item) => (
                  <NavLink
                    key={item.productId}
                    to={productBoardPathForDigitalTool(item.productId)}
                    className="app-nav-dropdown-item"
                    onClick={() => setDigitalToolsOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {showFullMainNav ? (
            <>
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

              {SUPPORT_NAV_VISIBLE ? (
                <div className="app-nav-dropdown" ref={supportRef}>
                  <button
                    type="button"
                    className={`app-nav-link app-nav-dropdown-trigger ${location.pathname.startsWith('/support') ? 'active' : ''}`}
                    onClick={() => setSupportOpen((o) => !o)}
                    aria-expanded={supportOpen}
                    aria-haspopup="true"
                  >
                    Support ▾
                  </button>
                  {supportOpen && (
                    <div className="app-nav-dropdown-menu">
                      <NavLink
                        to={SUPPORT_SKYPORTCARE_DEALER}
                        className="app-nav-dropdown-item"
                        onClick={() => setSupportOpen(false)}
                      >
                        SkyportCare dealer help
                      </NavLink>
                      <NavLink
                        to={SUPPORT_TEST_PAGE}
                        className="app-nav-dropdown-item"
                        onClick={() => setSupportOpen(false)}
                      >
                        Test page · timeline
                      </NavLink>
                    </div>
                  )}
                </div>
              ) : null}

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
                    {FY26_NAV_ITEMS.map(({ sectionId, label }) => (
                      <NavLink
                        key={sectionId}
                        to={`${FY26_BASE}/${sectionId}`}
                        className="app-nav-dropdown-item"
                        onClick={() => setStrategyOpen(false)}
                      >
                        FY26 · {label}
                      </NavLink>
                    ))}
                    <NavLink
                      to={`${STRATEGY_OPERATING_BASE}/overview`}
                      className="app-nav-dropdown-item"
                      onClick={() => setStrategyOpen(false)}
                    >
                      Digital Strategy Principles
                    </NavLink>
                  </div>
                )}
              </div>
            </>
          ) : null}

          </div>
        </nav>
        {!isAuthSkipped() && (
          <div className="app-header-auth">
            {isBackendAuthEnabled() && <AuthNavBackend />}
            {!isBackendAuthEnabled() && isAzureAuthEnabled && <AuthNav />}
          </div>
        )}
      </header>
      )}
      {isOperatingPlaybook && (
        <nav className="app-playbook-nav" aria-label="Digital Strategy Principles">
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
      {isFy26Playbook && !isFy26HcmPage && (
        <nav className="app-playbook-nav" aria-label="FY26 playbook">
          {FY26_NAV_ITEMS.map(({ sectionId, label }) => (
            <NavLink
              key={sectionId}
              to={`${FY26_BASE}/${sectionId}`}
              end
              className={({ isActive }) => `app-playbook-nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
      <main
        className={`app-main ${
          isSkyportHomeApp
            ? 'app-main--skyport-home-app'
            : isCareDemoPage
              ? 'app-main--care-demo'
              : isFy26HcmPage
                ? 'app-main--fy26-hcm'
                : location.pathname === '/demos' || location.pathname === '/demos/care'
                  ? 'app-main--full-bleed'
                  : ''
        }`}
      >
        {children}
      </main>
      {showBackToTop && !isSkyportHomeApp && !isCareDemoPage && !isFy26HcmPage && (
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
