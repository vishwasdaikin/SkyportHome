/**
 * Shared, credentialed client for all Skyport-Core calls.
 *
 * Core sessions are short-lived and stateless, so the httpOnly session cookie can expire or be
 * invalidated at any time. Every Core call must go through `apiFetch` so a `401` is handled in one
 * place: redirect to `/auth/login` exactly once. `403` is intentionally NOT redirected (the user is
 * signed in, just not authorized) — callers handle it. Built on `apiUrl` so same-origin `/api/*`
 * (Safari-safe) and `VITE_API_BASE_URL` host handling stay centralized.
 */
import { apiUrl } from './api.js'

/** Thrown after `apiFetch` has already started a redirect to login. Callers should stop quietly. */
export class AuthRedirect extends Error {
  constructor(message = 'unauthenticated') {
    super(message)
    this.name = 'AuthRedirect'
  }
}

// Guards against multiple in-flight 401s each triggering their own navigation.
let redirecting = false

export function redirectToLogin(forceFresh = false) {
  if (redirecting) return
  redirecting = true
  const returnTo = encodeURIComponent(window.location.pathname + (window.location.search || '') || '/')
  const prompt = forceFresh ? '&prompt=login' : ''
  window.location.assign(`${apiUrl('/auth/login')}?returnTo=${returnTo}${prompt}`)
}

/**
 * Fetch a Core endpoint with `credentials: 'include'`. On `401`, redirects to login and throws
 * `AuthRedirect`. All other responses (including `403`) are returned to the caller unchanged.
 */
export async function apiFetch(path, opts = {}) {
  const res = await fetch(apiUrl(path), {
    credentials: 'include',
    ...opts,
  })
  if (res.status === 401) {
    redirectToLogin()
    throw new AuthRedirect('unauthenticated')
  }
  return res
}
