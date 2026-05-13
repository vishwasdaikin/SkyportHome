# Microsoft Entra via Skyport-Core (Skyport-Web)

Skyport-Web **always** delegates sign-in to **Skyport-Core**: confidential OAuth (client secret on the server), Entra redirect/callback on Core, and an **httpOnly session cookie** returned to the browser on the **same origin** as the Vite app (dev: Vite proxies `/api` → Core; prod: same pattern via your host’s rewrite rules).

There is **no** browser MSAL, no separate Next.js SSO app, and no site password in this frontend.

## Flow

1. Run **Skyport-Core** locally (default `http://localhost:3001`) and **Skyport-Web** (`npm run dev` → `http://localhost:5173`).
2. Vite proxies **`/api/*` → Core**, stripping the `/api` prefix (see root `vite.config.js`).
3. The SPA calls **`GET /api/auth/me`** with `credentials: 'include'`. If unauthenticated, the browser is sent to **`GET /api/auth/login?returnTo=...`** → Core redirects to Microsoft; callback is **`http://localhost:5173/api/oauth/callback`** (register as **Web** in Entra, not SPA).
4. Core sets the session cookie on responses; the browser treats it as same-site to `:5173` because the request path is `/api/...` on the app origin.

## Azure app registration

- Add a **Web** redirect URI: `http://localhost:5173/api/oauth/callback` (and your production URL, e.g. `https://your-app.vercel.app/api/oauth/callback`).
- Create a **client secret** (Certificates & secrets).
- Align **Application (client) ID**, secret, tenant, `OAUTH_REDIRECT_URI`, and `FRONTEND_ORIGIN` with Skyport-Core’s `.env` / `.env.example`.

## Skyport-Web `.env.local`

```env
SKYPORT_CORE_URL=http://localhost:3001
```

Optional:

- **`VITE_API_BASE_URL`** — Production or previews where the browser must call Core on a different host (see `docs/VERCEL_DEPLOY.md`).
- **`VITE_SKIP_AUTH=1`** — Local/demo only; disables the login gate and header auth UI.

## Sign-in policy (Skyport-Core env)

Rules previously in `sso-app/auth.ts` are enforced in Core during the OAuth callback:

- **`OAUTH_ALLOWED_MICROSOFT_EMAIL_DOMAINS`** — Comma-separated email-domain allowlist (no `@`). Example: `daikincomfort.com,daikin.com`. Empty = any email accepted.
- **`OAUTH_ADMIN_EMAILS`** — Comma-separated emails that get `role: 'admin'` in the session JWT and `/api/auth/me` payload. Others get `role: 'editor'`.

When the email domain is not allowed, Core clears the session cookie and redirects to the Web origin with `?auth_error=access_denied&detail=...` — `RequireAuth` in this app surfaces that message.

`/api/auth/me` returns `{ authenticated: true, user: { sub, email, name, role } }` for an active session so the header `AuthNav` can render.

## Related docs

- **Vercel / previews:** [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md), [VERCEL_URLS.md](./VERCEL_URLS.md)
- **Safari / same-origin cookie auth:** [SAFARI_BACKEND_AUTH.md](./SAFARI_BACKEND_AUTH.md)
- **Troubleshooting:** [TROUBLESHOOTING_SIGNIN.md](./TROUBLESHOOTING_SIGNIN.md)

## Legacy note

Older docs referred to **MSAL**, **`sso-app`**, **`VITE_USE_BACKEND_AUTH`**, or **site password**. Those paths are removed; this document is the single sign-in story for Skyport-Web.
