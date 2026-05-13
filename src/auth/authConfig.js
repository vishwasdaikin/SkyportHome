/**
 * Auth env helpers. Skyport-Web delegates Microsoft Entra sign-in to **Skyport-Core**
 * (confidential OAuth + httpOnly session). See docs/BACKEND_AUTH.md.
 */

/** Dev/demo only: bypass login gate and hide auth UI in the header. */
export const isAuthSkipped = () =>
  import.meta.env.VITE_SKIP_AUTH === '1' || import.meta.env.VITE_SKIP_AUTH === 'true'
