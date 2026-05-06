import { useEffect, useState } from 'react'
import { consumeSsoHandoffFromUrl } from '../auth/ssoHandoff'

/**
 * Runs before the rest of the app so ?sso= can be consumed before RequireAuth triggers MSAL redirect.
 */
export default function SsoBootstrap({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    consumeSsoHandoffFromUrl().finally(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return (
      <div className="sso-bootstrap-gate" style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ margin: 0, color: '#444' }}>Signing you in…</p>
      </div>
    )
  }

  return children
}
