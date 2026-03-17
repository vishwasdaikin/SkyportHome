import { useState, useEffect } from 'react'
import { apiUrl } from '../lib/api'
import '../components/Layout.css'

export default function AuthNavBackend() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(apiUrl('/auth/me'), { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) setUser(d.user)
      })
      .catch(() => {})
  }, [])

  /**
   * Must be top-level navigation to Core — Chrome often ignores Set-Cookie clearing
   * on cross-origin fetch(), so POST logout left the session cookie; /auth/me still OK → "stuck signed in".
   */
  const logout = () => {
    window.location.href = apiUrl('/auth/logout')
  }

  if (!user) return null

  const label = user.name || user.email || 'Signed in'

  return (
    <span className="app-auth-nav">
      <span className="app-auth-user">{label}</span>
      <button type="button" className="app-auth-btn" onClick={logout}>
        Sign out
      </button>
    </span>
  )
}
