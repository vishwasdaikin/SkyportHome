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

  if (!user) return null

  const label = user.name || user.email || 'Signed in'
  const logoutAction = apiUrl('/auth/logout')

  return (
    <span className="app-auth-nav">
      <span className="app-auth-user">{label}</span>
      <form method="POST" action={logoutAction} style={{ display: 'inline' }}>
        <button type="submit" className="app-auth-btn">
          Sign out
        </button>
      </form>
    </span>
  )
}
