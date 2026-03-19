/**
 * Azure AD / Microsoft Entra ID SSO configuration for MSAL.
 * Uses AUTH_MICROSOFT_ENTRA_ID_ID and AUTH_MICROSOFT_ENTRA_ID_ISSUER from .env
 * (injected via vite.config.js). Do not put AUTH_MICROSOFT_ENTRA_ID_SECRET in the client.
 */

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function stripBomQuotes(v) {
  let s = String(v ?? '').replace(/^\uFEFF/, '').trim()
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim()
  }
  return s
}

const entraId = stripBomQuotes(import.meta.env.AUTH_MICROSOFT_ENTRA_ID_ID)
/** Issuer URLs: remove accidental spaces; client ID above must not be mangled. */
const entraIssuer = stripBomQuotes(import.meta.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER).replace(/\s+/g, '')
const redirectUri = typeof window !== 'undefined' ? window.location.origin : ''

const authority = entraIssuer
  ? entraIssuer.replace(/\/v2\.0\/?$/i, '').replace(/\/+$/, '')
  : 'https://login.microsoftonline.com/common'

/**
 * Safari (desktop) and Mobile Safari lose or partition sessionStorage across the
 * login.microsoftonline.com redirect. MSAL needs localStorage + auth state in
 * cookies for redirect flows to complete. Chrome/Firefox on iOS use a different UA.
 * @see https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/Known-issues-on-Safari
 */
function msalUseSafariFriendlyCache() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iP(ad|hone|od)/.test(ua)) {
    return !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  }
  const looksLikeSafari = /Safari/i.test(ua)
  const looksLikeChromium = /Chrome|Chromium|Edg\/|OPR\/|Brave/i.test(ua)
  return looksLikeSafari && !looksLikeChromium
}

const safariFriendlyCache = msalUseSafariFriendlyCache()

export const isAzureAuthEnabled = Boolean(entraId)

/** Skyport-Core handles OAuth (Web client); Vite proxies /api → Core so session cookie is same-site. */
export const isBackendAuthEnabled = () =>
  import.meta.env.VITE_USE_BACKEND_AUTH === '1' ||
  import.meta.env.VITE_USE_BACKEND_AUTH === 'true'

/**
 * Bad values (e.g. literal <tenant-id> from docs) → AADSTS90013 / CorrelationId all zeros.
 */
export function getEntraConfigurationError() {
  if (!entraId) return null
  if (!GUID_RE.test(entraId)) {
    return (
      'AUTH_MICROSOFT_ENTRA_ID_ID must be your real Application (client) ID (GUID), copied from Azure Portal → App registration → Overview. ' +
      'No quotes, spaces, or placeholder text.'
    )
  }
  if (!entraIssuer) {
    return null
  }
  const iss = entraIssuer.toLowerCase()
  if (
    /<[a-z0-9-]+>/i.test(entraIssuer) ||
    iss.includes('tenant-id') ||
    iss.includes('your-tenant') ||
    iss.includes('{{')
  ) {
    return (
      'AUTH_MICROSOFT_ENTRA_ID_ISSUER still contains a placeholder. Use your real Directory (tenant) ID, for example:\n' +
      'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/v2.0\n' +
      '(Azure Portal → Microsoft Entra ID → Overview → Tenant ID.) Do not copy angle brackets or <tenant-id> from docs.'
    )
  }
  const hostMatch = entraIssuer.match(/login\.microsoftonline\.com\/([^/]+)/i)
  if (!hostMatch) {
    return (
      'AUTH_MICROSOFT_ENTRA_ID_ISSUER should look like:\n' +
      'https://login.microsoftonline.com/<your-tenant-guid>/v2.0\n' +
      'or use …/common/v2.0 for multi-tenant.'
    )
  }
  const segmentRaw = hostMatch[1]
  const segment = segmentRaw.toLowerCase()
  const wellKnown = ['common', 'organizations', 'consumers']
  if (!wellKnown.includes(segment) && !GUID_RE.test(segmentRaw)) {
    return (
      'The tenant part of AUTH_MICROSOFT_ENTRA_ID_ISSUER must be a GUID (Directory tenant ID) or one of: common, organizations, consumers. ' +
      'Current value is not valid.'
    )
  }
  if (GUID_RE.test(segmentRaw) && segment === entraId.toLowerCase()) {
    return (
      'The tenant GUID in AUTH_MICROSOFT_ENTRA_ID_ISSUER matches AUTH_MICROSOFT_ENTRA_ID_ID. They must be different:\n' +
      '• AUTH_MICROSOFT_ENTRA_ID_ID = Application (client) ID (App registration → Overview).\n' +
      '• Issuer path = Directory (tenant) ID (Microsoft Entra ID → Overview → Tenant ID), not the app client ID.'
    )
  }
  return null
}

export const msalConfig = {
  auth: {
    clientId: entraId || '',
    authority,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: safariFriendlyCache ? 'localStorage' : 'sessionStorage',
    storeAuthStateInCookie: safariFriendlyCache,
  },
}

/**
 * Sign-in: empty scopes → default OIDC only (no Graph). Avoids AADSTS90013 when
 * User.Read isn’t consented or app isn’t set up for Graph delegated permissions.
 */
export const loginRequest = {
  scopes: [],
}

/** Use with acquireTokenSilent / acquireTokenPopup when calling Microsoft Graph. */
export const graphRequest = {
  scopes: ['User.Read'],
}
