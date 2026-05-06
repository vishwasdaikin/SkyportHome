import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { loginRequest } from './authConfig'
import {
  clearSsoHandoffSession,
  getSsoHandoffPayload,
  getSsoAppOrigin,
  performSsoLogout,
} from './ssoHandoff'

export default function AuthNav() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const ssoPayload = typeof window !== 'undefined' ? getSsoHandoffPayload() : null
  const ssoSignedIn = Boolean(ssoPayload?.email)

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => console.error('Login failed', e))
  }

  const handleLogout = () => {
    const ssoOrigin = getSsoAppOrigin()
    if (isAuthenticated && ssoOrigin) {
      clearSsoHandoffSession()
      instance
        .logoutRedirect({
          /** Must match a “Front-channel logout URL” / logout redirect URI allowed for the SPA in Entra */
          postLogoutRedirectUri: `${ssoOrigin}/logout`,
        })
        .catch((e) => console.error('Logout failed', e))
      return
    }
    if (isAuthenticated) {
      instance.logoutRedirect().catch((e) => console.error('Logout failed', e))
      return
    }
    if (ssoSignedIn) {
      performSsoLogout()
    }
  }

  const name =
    accounts[0]?.name || accounts[0]?.username || (ssoSignedIn ? ssoPayload.email : null)

  const showSignedIn = isAuthenticated || ssoSignedIn

  return (
    <span className="app-auth-nav">
      {showSignedIn ? (
        <>
          {name && <span className="app-auth-user">{name}</span>}
          <button type="button" className="app-auth-btn" onClick={handleLogout}>
            Sign out
          </button>
        </>
      ) : (
        <button type="button" className="app-auth-btn app-auth-btn-primary" onClick={handleLogin}>
          Sign in with Microsoft
        </button>
      )}
    </span>
  )
}
