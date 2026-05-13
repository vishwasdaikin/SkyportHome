/**
 * Internal-only access: email + domain allowlist + magic link (v1).
 *
 * - No Azure AD / SSO required here; keep session shape small so a future IdP can replace this module.
 * - Magic token is HMAC-less SHA-256 of `email|salt|secret` — **secret is in the client bundle** if set via
 *   Vite env; acceptable only for trusted internal demos. Production: issue short-lived JWTs from a server.
 */

const SESSION_KEY = 'skyportcare-support-desk-internal-session'
const SALT = 'support-desk-magic-v1'

export function getAllowedEmailDomains() {
  const raw = import.meta.env.VITE_SUPPORT_DESK_ALLOWED_EMAIL_DOMAINS
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(/[,;\s]+/)
    .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean)
}

export function isAuthDevTrustAnyEmail() {
  return import.meta.env.DEV && import.meta.env.VITE_SUPPORT_DESK_AUTH_DEV_ANY_EMAIL === 'true'
}

/** Local Vite dev, or explicit opt-in — skips domain allowlist and magic-link requirement for flow testing. */
export function isSupportDeskRelaxedAuth() {
  return (
    import.meta.env.DEV ||
    import.meta.env.VITE_SUPPORT_DESK_ALLOW_ANY_EMAIL === 'true'
  )
}

export function isEmailDomainAllowed(email) {
  const em = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return false
  if (isSupportDeskRelaxedAuth()) return true

  const domains = getAllowedEmailDomains()
  if (domains.length === 0) {
    if (isAuthDevTrustAnyEmail()) return true
    return false
  }
  const at = em.lastIndexOf('@')
  if (at < 0) return false
  const domain = em.slice(at + 1)
  return domains.includes(domain)
}

export function getSupportDeskSession() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o?.email || typeof o.email !== 'string') return null
    return { email: o.email.trim().toLowerCase(), at: o.at || null }
  } catch {
    return null
  }
}

export function setSupportDeskSession(email) {
  if (typeof sessionStorage === 'undefined') return
  const e = email.trim().toLowerCase()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: e, at: new Date().toISOString() }))
}

export function clearSupportDeskSession() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}

export function getMagicLinkSecret() {
  const s = import.meta.env.VITE_SUPPORT_DESK_MAGIC_SECRET
  return typeof s === 'string' && s.length >= 8 ? s : ''
}

export async function buildMagicLinkToken(email) {
  const secret = getMagicLinkSecret()
  if (!secret) return ''
  const input = `${email.toLowerCase().trim()}|${SALT}|${secret}`
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function verifyMagicLinkToken(email, token) {
  const expected = await buildMagicLinkToken(email)
  const t = (token || '').replace(/ /g, '+')
  if (!expected || !t || expected.length !== t.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ t.charCodeAt(i)
  return diff === 0
}
