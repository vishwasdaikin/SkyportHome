import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'
import { isAzureAuthEnabled } from './authConfig'
import { loginRequest } from './authConfig'
import { parseOAuthErrorFromUrl, stripOAuthErrorFromBrowserUrl } from './oauthErrorUtils'
import './RequireAuth.css'

const RETURN_KEY = 'skyport_auth_return_path'
const REDIRECT_LOCK = 'skyport_msal_login_redirect'

/**
 * When Entra ID is configured, blocks the app until the user signs in with Microsoft.
 * Preserves the URL they tried to open and sends them back after login.
 */
export default function RequireAuth({ children }) {
  if (!isAzureAuthEnabled) {
    return children
  }
  return <RequireAuthMsal>{children}</RequireAuthMsal>
}

function RequireAuthMsal({ children }) {
  const { instance, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const location = useLocation()
  const navigate = useNavigate()
  const [redirectReady, setRedirectReady] = useState(false)
  const [signInError, setSignInError] = useState(null)

  // OAuth errors from Entra are often returned on redirect_uri (hash/query); MSAL may not surface AADSTS text.
  useEffect(() => {
    const fromUrl = parseOAuthErrorFromUrl()
    if (fromUrl) {
      setSignInError(fromUrl)
      stripOAuthErrorFromBrowserUrl()
      setRedirectReady(true)
      sessionStorage.removeItem(REDIRECT_LOCK)
      return
    }
    instance
      .handleRedirectPromise()
      .catch((e) => {
        const msg = e?.errorMessage || e?.message || (e?.errorCode && `${e.errorCode}: ${e.errorMessage}`)
        if (msg) setSignInError(String(msg))
      })
      .finally(() => {
        setRedirectReady(true)
        sessionStorage.removeItem(REDIRECT_LOCK)
      })
  }, [instance])

  // After login, restore deep link
  useEffect(() => {
    if (!isAuthenticated || !redirectReady) return
    const saved = sessionStorage.getItem(RETURN_KEY)
    if (saved && saved !== location.pathname + location.search) {
      sessionStorage.removeItem(RETURN_KEY)
      navigate(saved, { replace: true })
    } else if (saved) {
      sessionStorage.removeItem(RETURN_KEY)
    }
  }, [isAuthenticated, redirectReady, location.pathname, location.search, navigate])

  // Send unauthenticated users to Microsoft login (not while showing a callback error)
  useEffect(() => {
    if (!redirectReady) return
    if (signInError) return
    if (inProgress !== InteractionStatus.None) return
    if (isAuthenticated) return
    if (sessionStorage.getItem(REDIRECT_LOCK) === '1') return
    const path = location.pathname + location.search
    if (path && path !== '/') {
      sessionStorage.setItem(RETURN_KEY, path)
    }
    sessionStorage.setItem(REDIRECT_LOCK, '1')
    instance.loginRedirect(loginRequest).catch(() => {
      sessionStorage.removeItem(REDIRECT_LOCK)
    })
  }, [redirectReady, signInError, inProgress, isAuthenticated, instance, location.pathname, location.search])

  const handleRetrySignIn = () => {
    setSignInError(null)
    sessionStorage.removeItem(REDIRECT_LOCK)
    instance.loginRedirect(loginRequest).catch(() => {
      sessionStorage.removeItem(REDIRECT_LOCK)
    })
  }

  const handlePopupSignIn = () => {
    setSignInError(null)
    sessionStorage.removeItem(REDIRECT_LOCK)
    instance
      .loginPopup(loginRequest)
      .then(() => {
        window.location.reload()
      })
      .catch((e) => {
        const msg =
          e?.errorMessage ||
          e?.message ||
          (e?.errorCode && `${e.errorCode}: ${e.errorMessage}`) ||
          String(e)
        setSignInError(msg)
      })
  }

  if (signInError) {
    return (
      <div className="require-auth-gate">
        <div className="require-auth-card require-auth-card-wide">
          <p className="require-auth-title">Sign-in didn’t complete</p>
          <p className="require-auth-sub">
            Microsoft returned an error (see below). Fix app registration / redirect URI / permissions, then try again.
          </p>
          <p className="require-auth-origin">
            <strong>SPA redirect URI must match this origin exactly</strong> (Azure → App registration → Authentication →
            Single-page application):
            <br />
            <code className="require-auth-origin-code">{typeof window !== 'undefined' ? window.location.origin : ''}</code>
            <br />
            <span className="require-auth-origin-note">
              If you use <code>127.0.0.1</code> in the browser, register that URI too—not only <code>localhost</code>.
            </span>
          </p>
          <pre className="require-auth-error" role="alert">
            {signInError}
          </pre>
          <button type="button" className="require-auth-retry" onClick={handleRetrySignIn}>
            Try signing in again (redirect)
          </button>
          <button type="button" className="require-auth-retry require-auth-retry-secondary" onClick={handlePopupSignIn}>
            Try sign-in in a popup
          </button>
        </div>
      </div>
    )
  }

  if (!redirectReady || inProgress !== InteractionStatus.None) {
    return (
      <div className="require-auth-gate">
        <div className="require-auth-card">
          <p className="require-auth-title">Signing in…</p>
          <p className="require-auth-sub">Redirecting to Microsoft if needed.</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="require-auth-gate">
        <div className="require-auth-card">
          <p className="require-auth-title">Redirecting to sign in…</p>
        </div>
      </div>
    )
  }

  return children
}
