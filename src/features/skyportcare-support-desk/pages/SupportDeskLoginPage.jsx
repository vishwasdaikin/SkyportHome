import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  buildMagicLinkToken,
  getMagicLinkSecret,
  isEmailDomainAllowed,
  isSupportDeskRelaxedAuth,
  setSupportDeskSession,
} from '../auth/supportDeskSession.js'
import '../SupportDesk.css'

const base = '/internal/support-desk'

export default function SupportDeskLoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || `${base}/tickets`

  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [err, setErr] = useState(null)
  const secret = getMagicLinkSecret()

  async function onRequestLink(e) {
    e.preventDefault()
    setErr(null)
    setLink('')
    const em = email.trim().toLowerCase()
    if (!isEmailDomainAllowed(em)) {
      setErr('That email is not on an approved internal domain. Contact the desk owner to be allowlisted.')
      return
    }
    if (!secret) {
      if (isSupportDeskRelaxedAuth()) {
        setSupportDeskSession(em)
        navigate(next.startsWith('/') ? next : `${base}/tickets`, { replace: true })
        return
      }
      setErr(
        'Set VITE_SUPPORT_DESK_MAGIC_SECRET (8+ chars) for magic links, or run `npm run dev`, or set VITE_SUPPORT_DESK_ALLOW_ANY_EMAIL=true (testing only).',
      )
      return
    }
    const token = await buildMagicLinkToken(em)
    const url = `${window.location.origin}${base}/auth/verify?email=${encodeURIComponent(em)}&t=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`
    setLink(url)
  }

  return (
    <div className="support-desk" style={{ minHeight: '70vh' }}>
      <main className="support-desk__main" style={{ maxWidth: '28rem' }}>
        <h1 className="support-desk__h1">Support desk sign-in</h1>
        <p className="support-desk__muted">
          Internal use only. Enter your work email — we’ll give you a magic link (v1 simulates the email on-screen
          until a mailer is wired to the webhook).
        </p>
        <form className="support-desk__card" onSubmit={onRequestLink}>
          {err ? <p style={{ color: '#b91c1c', marginTop: 0 }}>{err}</p> : null}
          <div className="support-desk__field">
            <label className="support-desk__label" htmlFor="sd-login-email">
              Work email
            </label>
            <input
              id="sd-login-email"
              type="email"
              autoComplete="username"
              className="support-desk__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="support-desk__btn support-desk__btn--primary">
            {secret ? 'Create magic link' : isSupportDeskRelaxedAuth() ? 'Continue (no magic link)' : 'Continue'}
          </button>
        </form>

        {link ? (
          <div className="support-desk__card" style={{ marginTop: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Simulated “email” — open this link</p>
            <p className="support-desk__muted" style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem' }}>
              In production, your server sends this URL by email. Do not forward outside the team.
            </p>
            <textarea readOnly className="support-desk__textarea" style={{ minHeight: '4.5rem' }} value={link} />
            <p style={{ margin: '0.75rem 0 0' }}>
              <a href={link} className="support-desk__btn support-desk__btn--primary" style={{ textDecoration: 'none' }}>
                Open link
              </a>
            </p>
          </div>
        ) : null}

        <p className="support-desk__muted" style={{ marginTop: '1.25rem' }}>
          <Link to="/">← Site home</Link>
        </p>
      </main>
    </div>
  )
}
