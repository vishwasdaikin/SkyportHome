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
    <div className="site-password-gate">
      <div className="site-password-card">
        <h1 className="site-password-title">Daikin Digital World</h1>
        <p className="site-password-sub">Enter your password to continue.</p>
        <form onSubmit={handleSubmit} className="site-password-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            className="site-password-input"
            aria-label="Password"
          />
          {error && (
            <p className="site-password-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="site-password-btn">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
