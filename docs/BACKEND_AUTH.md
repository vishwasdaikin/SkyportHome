# Backend (Web) OAuth with Skyport-Core

Use this when you need a **confidential client** (client secret) and **httpOnly session cookies** instead of MSAL in the browser (SPA + PKCE).

## Flow

1. **Skyport-Web** sets `VITE_USE_BACKEND_AUTH=1` in `.env.local` and runs Vite (e.g. `http://localhost:5173`).
2. Vite proxies **`/api/*` → Skyport-Core** (default `http://localhost:3001`), stripping the `/api` prefix.
3. Login: browser goes to **`/api/auth/login?returnTo=/path`** → Core redirects to Microsoft; callback is **`http://localhost:5173/api/oauth/callback`** (register this as **Web**, not SPA, in Azure).
4. Core sets cookie **`skyport_session`** on the response; the browser sees it as same-site to `:5173` because the request went through the proxy.

## Azure app registration

- Add a **Web** redirect URI: `http://localhost:5173/api/oauth/callback`.
- Create a **client secret** (Certificates & secrets).
- Use the same app’s client ID, or a separate “Web” registration—just keep redirect URI and secret aligned with Core’s `.env`.

## Skyport-Core `.env` / `.env.local`

Core loads **`.env` first**, then **`.env.local`** (only non-empty keys from `.env.local` override). You can keep the client secret in **`.env`** only — a `.env.local` with an empty `AUTH_MICROSOFT_ENTRA_ID_SECRET=` line will **not** wipe it anymore.

See Skyport-Core **`.env.example`**. Important:

- `OAUTH_REDIRECT_URI=http://localhost:5173/api/oauth/callback`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `AUTH_MICROSOFT_ENTRA_ID_SECRET` = client secret

Run Core: `npm install && npm run dev` (port **3001** by default).

## Skyport-Web `.env.local`

```env
VITE_USE_BACKEND_AUTH=1
SKYPORT_CORE_URL=http://localhost:3001
```

You can omit `AUTH_MICROSOFT_ENTRA_ID_*` in the frontend when using backend-only auth; MSAL is not loaded.

For **SPA mode** (no Core), see [SSO_SETUP.md](./SSO_SETUP.md).

**Vercel (Web + Core on different URLs):** [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md).
