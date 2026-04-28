import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSupportDeskSession, getSupportDeskSession } from './auth/supportDeskSession.js'
import './SupportDesk.css'

const base = '/internal/support-desk'

export default function SupportDeskLayout() {
  const navigate = useNavigate()
  const session = getSupportDeskSession()

  function onSignOut() {
    clearSupportDeskSession()
    navigate(`${base}/login`, { replace: true })
  }

  return (
    <div className="support-desk">
      <header className="support-desk__bar">
        <div>
          <h1 className="support-desk__brand">SkyportCare · Support Desk</h1>
          <p className="support-desk__sub">Internal · AI-assisted triage (v1 prototype)</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem 1rem' }}>
          <nav className="support-desk__nav" aria-label="Support desk sections">
          <NavLink
            to={`${base}/tickets`}
            end
            className={({ isActive }) => (isActive ? 'support-desk__nav--active' : '')}
          >
            Tickets
          </NavLink>
          <NavLink
            to={`${base}/tickets/new`}
            className={({ isActive }) => (isActive ? 'support-desk__nav--active' : '')}
          >
            New ticket
          </NavLink>
          <NavLink
            to={`${base}/knowledge`}
            className={({ isActive }) => (isActive ? 'support-desk__nav--active' : '')}
          >
            Knowledge
          </NavLink>
          <NavLink
            to={`${base}/analytics`}
            className={({ isActive }) => (isActive ? 'support-desk__nav--active' : '')}
          >
            Analytics
          </NavLink>
          </nav>
          {session?.email ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <span className="support-desk__muted" title="Desk session (not SSO)">
                {session.email}
              </span>
              <button type="button" className="support-desk__btn" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="support-desk__main">
        <Outlet />
      </main>
    </div>
  )
}
