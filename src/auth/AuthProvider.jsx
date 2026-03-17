import { useState, useEffect } from 'react'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, isAzureAuthEnabled, getEntraConfigurationError } from './authConfig'
import './AuthProvider.css'

const entraConfigError = isAzureAuthEnabled ? getEntraConfigurationError() : null

let msalInstance = null
if (isAzureAuthEnabled && !entraConfigError) {
  msalInstance = new PublicClientApplication(msalConfig)
}

function formatInitError(e) {
  if (!e) return 'Unknown error'
  return e.errorMessage || e.message || String(e)
}

/**
 * MSAL must finish initialize() before handleRedirectPromise / loginRedirect.
 */
export default function AuthProvider({ children }) {
  const [msalReady, setMsalReady] = useState(
    !isAzureAuthEnabled || !msalInstance || Boolean(entraConfigError)
  )
  const [initError, setInitError] = useState(null)
  const [initAttempt, setInitAttempt] = useState(0)

  useEffect(() => {
    if (!isAzureAuthEnabled || !msalInstance || entraConfigError) {
      setMsalReady(true)
      return
    }
    setInitError(null)
    let cancelled = false
    msalInstance
      .initialize()
      .then(() => {
        if (!cancelled) setMsalReady(true)
      })
      .catch((e) => {
        if (!cancelled) {
          setInitError(formatInitError(e))
          setMsalReady(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [isAzureAuthEnabled, initAttempt])

  if (!isAzureAuthEnabled) {
    return children
  }

  if (entraConfigError) {
    return (
      <div className="auth-provider-boot auth-provider-boot-error">
        <p className="auth-provider-boot-title">Fix Microsoft sign-in settings (.env.local)</p>
        <p className="auth-provider-boot-lead">
          This misconfiguration often causes <strong>AADSTS90013</strong> (invalid request) at Microsoft.
        </p>
        <pre className="auth-provider-boot-detail">{entraConfigError}</pre>
        <p className="auth-provider-boot-hint">
          <strong>Important:</strong> Vite reads <code>.env.local</code> only when the dev server starts. After you
          change values, stop the terminal (Ctrl+C), run <code>npm run dev</code> again, then reload this page.
        </p>
        <button
          type="button"
          className="auth-provider-boot-retry"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    )
  }

  if (!msalInstance) {
    return children
  }

  if (initError) {
    return (
      <div className="auth-provider-boot auth-provider-boot-error">
        <p className="auth-provider-boot-title">Microsoft sign-in could not start</p>
        <pre className="auth-provider-boot-detail">{initError}</pre>
        <p className="auth-provider-boot-hint">
          Check <code>.env.local</code> (client ID, issuer), network, and Azure app registration.
        </p>
        <button
          type="button"
          className="auth-provider-boot-retry"
          onClick={() => setInitAttempt((n) => n + 1)}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!msalReady) {
    return (
      <div className="auth-provider-boot">
        <p className="auth-provider-boot-text">Starting sign-in…</p>
      </div>
    )
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
}
