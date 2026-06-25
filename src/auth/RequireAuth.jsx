import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'
import { apiFetch, AuthRedirect, redirectToLogin } from '../lib/apiClient'
import { messageForAuthError } from './authErrors'
import { isAuthSkipped } from './authConfig'
import './RequireAuth.css'

/**
 * Survives React StrictMode's double-effect and same-tab reloads so the user is not
 * silently bounced through `/auth/login` right after signing out.
 * Cleared when /auth/me returns authenticated:true or when the user clicks a sign-in button.
 */
const SIGNED_OUT_FLAG = 'skyport_just_signed_out'

function readSignedOutFlag() {
  try {
    return sessionStorage.getItem(SIGNED_OUT_FLAG) === '1'
  } catch {
    return false
  }
}

function setSignedOutFlag(on) {
  try {
    if (on) sessionStorage.setItem(SIGNED_OUT_FLAG, '1')
    else sessionStorage.removeItem(SIGNED_OUT_FLAG)
  } catch {
    /* private mode or storage disabled */
  }
}

function readUrlError() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('skyport_core_setup') === '1') {
    const msg = params.get('msg') || 'Configure Skyport-Core (see message from server).'
    return { type: 'setup', message: decodeURIComponent(msg.replace(/\+/g, ' ')) }
  }
  const authErr = params.get('auth_error')
  if (authErr) {
    const detail = params.get('detail') ? decodeURIComponent(params.get('detail')) : ''
    return { type: 'oauth', message: messageForAuthError(authErr, detail) }
  }
  return null
}

/**
 * Auth gate via Skyport-Core: passwordless magic-link sign-in + httpOnly session cookie on the
 * same origin as the app (Vite dev proxies `/api` → Core). An unauthenticated /auth/me sends the
 * browser to `/api/auth/login`, which Core 302s to the SPA `/login` page. Set VITE_SKIP_AUTH=1
 * only for local demos.
 */
export default function RequireAuth({ children }) {
  if (isAuthSkipped()) {
    return children
  }

  const [status, setStatus] = useState('checking')
  const [urlError, setUrlError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('signed_out') === '1') {
      setSignedOutFlag(true)
      window.history.replaceState({}, '', window.location.pathname)
    }

    /**
     * StrictMode runs this effect twice in dev — without the persisted flag the second pass
     * would not see `signed_out=1` (we just stripped it), fall into the unauthenticated branch,
     * and redirect to `/api/auth/login`, sending the just-signed-out user back into sign-in.
     */
    if (readSignedOutFlag()) {
      setStatus('checking_signed_out')
      fetch(apiUrl('/auth/me'), { credentials: 'include' })
        .then(async (r) => {
          const d = await r.json().catch(() => ({}))
          if (d.authenticated) {
            setSignedOutFlag(false)
            setStatus('ok')
            return
          }
          setStatus('signed_out')
        })
        .catch(() => setStatus('signed_out'))
      return
    }

    const fromUrl = readUrlError()
    if (fromUrl) {
      setUrlError(fromUrl)
      setStatus('error')
      const path = window.location.pathname
      window.history.replaceState({}, '', path)
      return
    }

    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 12000)

    // `apiFetch` redirects to `/auth/login` and throws `AuthRedirect` on 401 (handled in .catch).
    apiFetch('/auth/me', { signal: ctrl.signal })
      .then(async (r) => {
        clearTimeout(t)
        const text = await r.text()
        let data = {}
        try {
          data = text ? JSON.parse(text) : {}
        } catch {
          throw new Error(
            r.status >= 500 || r.status === 502
              ? 'Skyport-Core returned an invalid response. Is it running on port 3001?'
              : 'Unexpected response from auth/me.',
          )
        }
        if (data.authenticated) {
          setStatus('ok')
          return
        }
        if (data.authenticated === false) {
          // 200 with no active session — 401 is already redirected centrally by apiFetch.
          redirectToLogin()
          return
        }
        throw new Error(`Auth check failed (${r.status}).`)
      })
      .catch((e) => {
        clearTimeout(t)
        if (e instanceof AuthRedirect) {
          // Central 401 redirect is in progress; keep showing the "Signing in…" spinner.
          return
        }
        if (e.name === 'AbortError') {
          setLoadError(
            import.meta.env.VITE_API_BASE_URL
              ? 'No response from Skyport-Core (timeout). Check that the API is deployed and VITE_API_BASE_URL is correct.'
              : 'No response from Skyport-Core (timeout). Run Core on port 3001 (SKYPORT_CORE_URL in .env.local).',
          )
        } else {
          setLoadError(e.message || 'Cannot reach Skyport-Core. Start the API on port 3001.')
        }
        setStatus('error')
      })
  }, [])

  if (status === 'ok') return children

  if (status === 'checking_signed_out') {
    return (
      <div className="require-auth-gate">
        <div className="require-auth-card">
          <p className="require-auth-title">Signing out…</p>
          <p className="require-auth-sub">Clearing your session.</p>
        </div>
      </div>
    )
  }

  if (status === 'signed_out') {
    return (
      <div className="require-auth-gate">
        <div className="require-auth-card require-auth-card-wide">
          <p className="require-auth-title">You’re signed out</p>
          <p className="require-auth-sub">
            Your Skyport session was cleared. Sign in again when you’re ready.
          </p>
          <button
            type="button"
            className="require-auth-retry"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSignedOutFlag(false)
              window.location.href = `${apiUrl('/auth/login')}?returnTo=${encodeURIComponent('/')}`
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  if (status === 'error' && (urlError || loadError)) {
    const message = urlError?.message || loadError
    const isSetup = urlError?.type === 'setup'
    return (
      <div className="require-auth-gate">
        <div className="require-auth-card require-auth-card-wide">
          <p className="require-auth-title">
            {isSetup ? 'Backend auth needs setup' : 'Can’t sign in right now'}
          </p>
          <p className="require-auth-sub">
            {isSetup
              ? 'Fix Skyport-Core configuration, then try again.'
              : 'The dev server proxies /api to Skyport-Core. Without Core, the app cannot load.'}
          </p>
          <pre className="require-auth-error" role="alert">
            {message}
          </pre>
          <p className="require-auth-sub" style={{ marginTop: '1rem' }}>
            {import.meta.env.VITE_API_BASE_URL ? (
              <>
                <strong>Production:</strong> Core at{' '}
                <code style={{ fontSize: '0.8rem' }}>{import.meta.env.VITE_API_BASE_URL}</code> — check
                Vercel env (CORS + secrets). See <code>docs/VERCEL_DEPLOY.md</code>.
              </>
            ) : (
              <>
                <strong>Local:</strong> Terminal 1 —{' '}
                <code style={{ fontSize: '0.8rem' }}>cd Skyport-Core && npm run dev</code>
                <br />
                Terminal 2 — <code style={{ fontSize: '0.8rem' }}>npm run dev</code> in Skyport-Web
                <br />
                Open <strong>http://localhost:5173</strong>
              </>
            )}
          </p>
          <button
            type="button"
            className="require-auth-retry"
            style={{ marginTop: '1rem' }}
            onClick={() => window.location.reload()}
          >
            Reload after fixing
          </button>
          {!isSetup && (
            <button
              type="button"
              className="require-auth-retry"
              style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}
              onClick={() => {
                window.location.href = `${apiUrl('/auth/login')}?returnTo=${encodeURIComponent('/')}`
              }}
            >
              Try signing in
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="require-auth-gate">
      <div className="require-auth-card">
        <p className="require-auth-title">Signing in…</p>
        <p className="require-auth-sub">Checking session (Skyport-Core)…</p>
      </div>
    </div>
  )
}
