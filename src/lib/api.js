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
  const base = import.meta.env.VITE_API_BASE_URL
  if (base && String(base).trim()) {
    return `${String(base).replace(/\/$/, '')}${p}`
  }
  return `/api${p}`
}
