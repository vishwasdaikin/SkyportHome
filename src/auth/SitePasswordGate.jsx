import { useState, useEffect } from 'react'
import './RequireAuth.css'

const STORAGE_KEY = 'skyport_site_unlocked'

export default function SitePasswordGate({ children }) {
  const configuredPassword =
    (import.meta.env.VITE_SITE_PASSWORD && String(import.meta.env.VITE_SITE_PASSWORD).trim()) || ''
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!configuredPassword) {
      setUnlocked(true)
      return
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        setUnlocked(true)
      }
    } catch {
      setUnlocked(true)
    }
  }, [configuredPassword])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password === configuredPassword) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {}
      setUnlocked(true)
    } else {
      setError('Incorrect password. Try again.')
    }
  }

  if (!configuredPassword || unlocked) {
    return children
  }

  return (
    <div className="require-auth-gate">
      <div className="require-auth-card">
        <p className="require-auth-title">Enter site password</p>
        <p className="require-auth-sub" style={{ marginBottom: '1rem' }}>
          This site is protected. Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            className="site-password-input"
            aria-label="Site password"
          />
          {error && (
            <p className="require-auth-sub" style={{ color: '#b91c1c', marginTop: '0.5rem' }} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="require-auth-retry" style={{ marginTop: '1rem', width: '100%' }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
