/**
 * “Digital Tools public site”: production build where only the Digital Tools hub,
 * `/product-board` (TechHub, HVAC Learning Campus, Daikin City), and a slim home
 * are reachable from the shell. Other routes redirect to `/digital-tools`.
 *
 * Set on the host: `VITE_DIGITAL_TOOLS_PUBLIC_SITE=true` (then rebuild / redeploy).
 */
export const DIGITAL_TOOLS_PUBLIC_SITE =
  import.meta.env.VITE_DIGITAL_TOOLS_PUBLIC_SITE === 'true'

/** Paths allowed when {@link DIGITAL_TOOLS_PUBLIC_SITE} is true (no query string checks). */
export function isPathAllowedOnDigitalToolsPublicSite(pathname) {
  if (pathname === '/' || pathname === '/digital-tools') return true
  if (pathname === '/product-board' || pathname.startsWith('/product-board/')) return true
  /** Public customer ticket intake — no login; same site password gate as the rest of the app. */
  if (pathname === '/support/request') return true
  return false
}
