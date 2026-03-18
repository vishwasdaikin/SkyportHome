/**
 * Skyport-Web ↔ SkyportHome-Core
 *
 * Dev: use apiUrl('/path') → requests go to /api/path → Vite proxies to SKYPORT_CORE_URL.
 * Prod: set VITE_API_BASE_URL to your deployed Core URL (e.g. https://api.yourdomain.com).
 *
 * Example:
 *   const res = await fetch(apiUrl('/health'), { credentials: 'include' })
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const envBase = import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim()
  if (envBase) {
    return `${envBase.replace(/\/$/, '')}${p}`
  }
  // Prod: if VITE_* was missing at build, /api/* hits static hosting (404) — never reaches Core.
  if (typeof window !== 'undefined' && window.location.hostname === 'skyport-home.vercel.app') {
    return `https://skyport-core.vercel.app${p}`
  }
  return `/api${p}`
}
