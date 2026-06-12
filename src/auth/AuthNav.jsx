import { useState, useEffect } from 'react'
import { apiUrl } from '../lib/api'
import { apiFetch, AuthRedirect } from '../lib/apiClient'
import '../components/Layout.css'

/** Header user + sign-out for Skyport-Core session auth. */
export default function AuthNav() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    apiFetch('/auth/me')
      .then((r) => r.json())
      .then((d) => {
        // `role` is kept on the user for UI gating only; authorization is enforced server-side.
        if (d.authenticated && d.user) setUser(d.user)
      })
      .catch((e) => {
        // AuthRedirect: a central 401 redirect is already in progress — nothing to do.
        if (!(e instanceof AuthRedirect)) {
          /* network/parse error: just leave the nav unrendered */
        }
      })
  }, [])

  if (!user) return null

  const label = user.name || user.email || 'Signed in'

  return (
    <span className="app-auth-nav">
      <span className="app-auth-user">{label}</span>
      {/*
        Logout must be a full-page form POST: Core now returns 405 on GET /auth/logout and only
        clears the cookie on POST (303 -> /?signed_out=1). A same-origin form submit satisfies
        Core's Origin/Referer check without any extra header.
      */}
      <form method="POST" action={apiUrl('/auth/logout')} className="app-auth-logout-form">
        <button type="submit" className="app-auth-btn">
          Sign out
        </button>
      </form>
    </span>
  )
}
