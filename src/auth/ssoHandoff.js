import { jwtVerify } from 'jose'

const SSO_PARAM = 'sso'
export const SSO_HANDOFF_STORAGE_KEY = 'skyport_sso_handoff_v1'

/**
 * Read ?sso= JWT from URL (from sso-app redirect), verify with VITE_SSO_HANDOFF_SECRET,
 * persist to sessionStorage, strip query from address bar.
 * Must match AUTH_SECRET in sso-app.
 */
export async function consumeSsoHandoffFromUrl() {
  if (typeof window === 'undefined') return
  const secretRaw = import.meta.env.VITE_SSO_HANDOFF_SECRET
  if (!secretRaw || String(secretRaw).trim() === '') return

  const params = new URLSearchParams(window.location.search)
  const token = params.get(SSO_PARAM)
  if (!token) return

  try {
    const key = new TextEncoder().encode(String(secretRaw).trim())
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    const email = payload.email
    const role = payload.role ?? 'editor'
    const exp = payload.exp
    if (typeof email !== 'string' || !email) return

    sessionStorage.setItem(
      SSO_HANDOFF_STORAGE_KEY,
      JSON.stringify({
        email,
        role,
        exp: typeof exp === 'number' ? exp : Math.floor(Date.now() / 1000) + 900,
        source: 'sso-app',
      }),
    )
  } catch {
    /* invalid or expired token */
  }

  params.delete(SSO_PARAM)
  const qs = params.toString()
  const next = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
  window.history.replaceState({}, '', next)
}

export function hasValidSsoHandoffSession() {
  if (typeof window === 'undefined') return false
  try {
    const raw = sessionStorage.getItem(SSO_HANDOFF_STORAGE_KEY)
    if (!raw) return false
    const { exp } = JSON.parse(raw)
    return typeof exp === 'number' && exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function clearSsoHandoffSession() {
  try {
    sessionStorage.removeItem(SSO_HANDOFF_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Valid non-expired handoff payload from sessionStorage (email / role), or null.
 */
export function getSsoHandoffPayload() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SSO_HANDOFF_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (typeof data.exp !== 'number' || data.exp * 1000 <= Date.now()) return null
    return data
  } catch {
    return null
  }
}

/**
 * Base URL of the NextAuth SSO app (no trailing slash), e.g. http://localhost:3000
 */
export function getSsoAppOrigin() {
  const o = import.meta.env.VITE_SSO_APP_ORIGIN
  return typeof o === 'string' && o.trim() !== '' ? o.trim().replace(/\/$/, '') : ''
}

/**
 * Clear local SSO handoff and end the NextAuth session on the SSO app; browser lands on Skyport (or callbackUrl).
 */
export function performSsoLogout() {
  clearSsoHandoffSession()
  const origin = getSsoAppOrigin()
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`
      : '/'
  if (!origin) {
    if (typeof window !== 'undefined') window.location.assign('/')
    return
  }
  const cb = encodeURIComponent(fallback)
  window.location.assign(`${origin}/logout?callbackUrl=${cb}`)
}
