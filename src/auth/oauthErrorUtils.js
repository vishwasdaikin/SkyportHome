/** Parse OAuth error from hash (#error=...) or query (?error=...) after redirect from Entra. */
export function parseOAuthErrorFromUrl() {
  if (typeof window === 'undefined') return null
  const trySegment = (raw) => {
    if (!raw || !raw.includes('error=')) return null
    const q = raw.startsWith('#')
      ? raw.slice(1)
      : raw.startsWith('?')
        ? raw.slice(1)
        : raw
    const p = new URLSearchParams(q)
    const err = p.get('error')
    if (!err) return null
    const desc = p.get('error_description') || err
    try {
      return decodeURIComponent(desc.replace(/\+/g, ' '))
    } catch {
      return desc
    }
  }
  return trySegment(window.location.hash) || trySegment(window.location.search)
}

export function stripOAuthErrorFromBrowserUrl() {
  if (typeof window === 'undefined') return
  const u = new URL(window.location.href)
  u.hash = ''
  ;['error', 'error_description', 'error_uri', 'state'].forEach((k) => u.searchParams.delete(k))
  const qs = u.searchParams.toString()
  window.history.replaceState({}, '', u.pathname + (qs ? `?${qs}` : '') + u.hash)
}
