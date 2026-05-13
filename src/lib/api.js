/**
 * Skyport-Web ↔ SkyportHome-Core
 *
 * Dev: apiUrl('/auth/me') → `/api/auth/me` → Vite proxies to SKYPORT_CORE_URL.
 * Prod (skyport-home.vercel.app): same-origin `/api/*` → Vercel rewrites to Core so the
 * session cookie is first-party. Safari blocks cross-site cookies to skyport-core.vercel.app.
 *
 * Prod (other hosts): set VITE_API_BASE_URL to your Core URL (Safari may fail until you use same-origin /api).
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const envBase = import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()

  if (typeof window !== 'undefined' && window.location.hostname === 'skyport-home.vercel.app') {
    return `/api${p}`
  }
  if (envBase) {
    return `${envBase.replace(/\/$/, '')}${p}`
  }
  return `/api${p}`
}
