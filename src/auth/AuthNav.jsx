import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { loginRequest } from './authConfig'

export default function AuthNav() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => console.error('Login failed', e))
  }

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => console.error('Logout failed', e))
  }

  const name = accounts[0]?.name || accounts[0]?.username || null

  return (
    <span className="app-auth-nav">
      {isAuthenticated ? (
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
