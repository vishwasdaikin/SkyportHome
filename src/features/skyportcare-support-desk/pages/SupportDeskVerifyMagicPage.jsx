import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getMagicLinkSecret,
  isEmailDomainAllowed,
  isSupportDeskRelaxedAuth,
  setSupportDeskSession,
  verifyMagicLinkToken,
} from '../auth/supportDeskSession.js'
import '../SupportDesk.css'

const base = '/internal/support-desk'

export default function SupportDeskVerifyMagicPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [msg, setMsg] = useState('Verifying…')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const email = (params.get('email') || '').trim().toLowerCase()
      const next = params.get('next') || `${base}/tickets`
      const t = params.get('t') || ''
      const secret = getMagicLinkSecret()

      if (!email) {
        if (!cancelled) setMsg('Missing email.')
        return
      }
      if (!isEmailDomainAllowed(email)) {
        if (!cancelled) setMsg('Domain not allowed.')
        return
      }

      if (secret) {
        const ok = await verifyMagicLinkToken(email, t)
        if (!ok) {
          if (!cancelled) setMsg('Invalid or expired link.')
          return
        }
      } else if (!isSupportDeskRelaxedAuth()) {
        if (!cancelled) setMsg('Magic link secret is not configured.')
        return
      }

      setSupportDeskSession(email)
      if (!cancelled) navigate(next.startsWith('/') ? next : `${base}/tickets`, { replace: true })
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, params.toString()])

  return (
    <div className="support-desk" style={{ minHeight: '40vh' }}>
      <main className="support-desk__main" style={{ maxWidth: '28rem' }}>
        <p>{msg}</p>
        <p className="support-desk__muted">
          <Link to={`${base}/login`}>Back to sign-in</Link>
        </p>
      </main>
    </div>
  )
}
