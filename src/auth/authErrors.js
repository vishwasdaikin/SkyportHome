/**
 * Friendly copy for Skyport-Core `auth_error` codes. Core returns generic codes (no upstream
 * internals leaked); `access_denied` is the only one that carries a human-readable `detail`.
 *
 * Magic-link mode (`AUTH_MODE=magic`) adds `invalid_or_expired_link` and `domain_not_allowed`.
 * The Entra codes remain for tenants where `AUTH_MODE` still includes `entra`.
 */
export const AUTH_ERROR_MESSAGES = {
  // Magic-link
  invalid_or_expired_link: 'That sign-in link is invalid or expired. Enter your email to get a new one.',
  domain_not_allowed: 'Use your @daikincomfort.com or @motili.com email address.',
  // Entra (only when AUTH_MODE includes entra)
  access_denied: 'Your account is not allowed to sign in.',
  invalid_oauth_state: 'Your sign-in session expired. Please try again.',
  invalid_id_token: 'Sign-in could not be verified. Please try again.',
  token_exchange: 'Sign-in failed. Please try again.',
  server_error: 'Something went wrong during sign-in. Please try again.',
}

const DEFAULT_AUTH_ERROR = 'Sign-in failed. Please try again.'

/**
 * Resolve a friendly message for an `auth_error` code. `access_denied` may include a readable
 * `detail` from Core; for all other codes we never surface raw `detail` (it can carry internals).
 */
export function messageForAuthError(code, detail = '') {
  if (!code) return ''
  if (code === 'access_denied') {
    return detail ? String(detail).slice(0, 500) : AUTH_ERROR_MESSAGES.access_denied
  }
  return AUTH_ERROR_MESSAGES[code] || DEFAULT_AUTH_ERROR
}
