# Microsoft SSO (Skyport-Web)

Skyport-Web uses **Skyport-Core** for Microsoft Entra ID sign-in (confidential OAuth + httpOnly session cookie). Configure Entra and Core as described in **[BACKEND_AUTH.md](./BACKEND_AUTH.md)**.

High-level checklist:

1. App registration in Microsoft Entra → **Web** redirect: `https://<your-web-origin>/api/oauth/callback` (local: `http://localhost:5173/api/oauth/callback`).
2. Client secret + client ID + tenant settings on **Skyport-Core** (never in the Vite bundle).
3. Run Core and Web; open the Web origin; unauthenticated users are redirected to Microsoft via `/api/auth/login`.

There is no separate SPA PKCE env on this frontend anymore.
