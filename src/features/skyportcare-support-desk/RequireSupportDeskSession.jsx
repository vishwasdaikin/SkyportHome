import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getSupportDeskSession } from './auth/supportDeskSession.js'

const base = '/internal/support-desk'

/**
 * Gates all in-app support desk routes. Login + verify routes stay outside.
 * Global {@link ../../auth/RequireAuth.jsx} may still apply (MSAL/backend); this is an additional internal layer.
 */
export default function RequireSupportDeskSession() {
  const location = useLocation()
  const session = getSupportDeskSession()
  if (!session?.email) {
    return <Navigate to={`${base}/login`} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
