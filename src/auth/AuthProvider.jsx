/**
 * Placeholder wrapper kept so `main.jsx` stays stable. All Microsoft sign-in runs in Skyport-Core
 * (see docs/BACKEND_AUTH.md); the SPA only uses `fetch(..., { credentials: 'include' })` to `/api/auth/*`.
 */
export default function AuthProvider({ children }) {
  return children
}
