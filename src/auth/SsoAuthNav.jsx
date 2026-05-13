import { getSsoHandoffPayload, getSsoAppOrigin, performSsoLogout } from './ssoHandoff'

/**
 * Sign in / out when using sso-app handoff only (no MSAL / no AUTH_MICROSOFT_ENTRA_ID_ID in Skyport).
 * Does not use @azure/msal-react — those hooks require MsalProvider.
 */
export default function SsoAuthNav() {
  const origin = getSsoAppOrigin()
  if (!origin) return null

  const ssoPayload = typeof window !== 'undefined' ? getSsoHandoffPayload() : null
  const ssoSignedIn = Boolean(ssoPayload?.email)

  if (ssoSignedIn) {
    return (
      <span className="app-auth-nav">
        {ssoPayload.email && <span className="app-auth-user">{ssoPayload.email}</span>}
        <button type="button" className="app-auth-btn" onClick={() => performSsoLogout()}>
          Sign out
        </button>
      </span>
    )
  }

  return (
    <span className="app-auth-nav">
      <a className="app-auth-btn app-auth-btn-primary" href={origin}>
        Sign in
      </a>
    </span>
  )
}
