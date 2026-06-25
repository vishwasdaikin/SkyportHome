import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiUrl } from '../lib/api'
import { messageForAuthError } from './authErrors'
import './RequireAuth.css'

/**
 * Passwordless magic-link sign-in (Skyport-Core `AUTH_MODE=magic`). Must be mounted OUTSIDE
 * `RequireAuth` (it is a public route): Core 302s an unauthenticated `/api/auth/login` here, and
 * gating it would loop. The emailed link hits `/api/auth/verify` (Core sets the cookie and 303s
 * back to `returnTo`), so this page never sees the verify step.
 */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function messageForLoginError(httpStatus, code) {
  if (code === 'domain_not_allowed' || httpStatus === 403) return messageForAuthError('domain_not_allowed')
  if (code === 'invalid_email' || httpStatus === 400) return 'Enter a valid email address.'
  if (code === 'send_failed' || httpStatus === 502) return 'We couldn’t send the email right now. Please try again.'
  return 'Sign-in failed. Please try again.'
}

export default function LoginPage() {
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent
  // Surface any auth_error Core appended on redirect (e.g. invalid_or_expired_link).
  const [error, setError] = useState(() =>
    messageForAuthError(params.get('auth_error') || '', params.get('detail') || ''),
  )

  async function onSubmit(e) {
    e.preventDefault()
    const value = email.trim()
    if (!isValidEmail(value)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setStatus('sending')
    try {
      // Plain fetch (not apiFetch): this is the unauthenticated entry; the endpoint never returns
      // 401, so we must not trigger the central login redirect.
      const res = await fetch(apiUrl('/auth/login/email'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, returnTo }),
      })
      if (res.ok) {
        setStatus('sent')
        return
      }
      const body = await res.json().catch(() => ({}))
      setStatus('idle')
      setError(messageForLoginError(res.status, body.error))
    } catch {
      setStatus('idle')
      setError('Could not reach the sign-in service. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="site-password-gate">
        <div className="site-password-card">
          <h1 className="site-password-title">Check your email</h1>
          <p className="site-password-sub">
            We sent a sign-in link to <strong>{email.trim()}</strong>. Open it on this device to finish
            signing in. The link expires in about 10 minutes.
          </p>
          <button
            type="button"
            className="site-password-btn"
            onClick={() => {
              setStatus('idle')
              setError('')
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="site-password-gate">
      <div className="site-password-card">
        <h1 className="site-password-title">Sign in to Skyport</h1>
        <p className="site-password-sub">
          Enter your work email and we’ll send you a one-time sign-in link.
        </p>
        <form className="site-password-form" onSubmit={onSubmit}>
          <input
            type="email"
            className="site-password-input"
            placeholder="you@daikincomfort.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            autoComplete="email"
            disabled={status === 'sending'}
            aria-label="Work email"
          />
          {error ? (
            <p className="site-password-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="site-password-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
      </div>
    </div>
  )
}
