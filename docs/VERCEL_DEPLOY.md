# Deploy Skyport-Web + [SkyportCore](https://github.com/vishwasdaikin/SkyportCore) on Vercel

**Your live URLs:** [VERCEL_URLS.md](./VERCEL_URLS.md) — production + preview Core hosts, Azure redirect list, copy-paste env.

## 1. SkyportCore (API)

Repo: **https://github.com/vishwasdaikin/SkyportCore**

In **Vercel → Project → Settings → Environment Variables**:

| Variable | Example |
|----------|---------|
| `AUTH_MICROSOFT_ENTRA_ID_ID` | App registration client ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Client secret |
| `AUTH_MICROSOFT_ENTRA_ID_TENANT` | **GUID only** (e.g. `307cdf1f-...`) — not `https://login.../v2.0` |
| `OAUTH_REDIRECT_URI` | **`https://skyport-home.vercel.app/api/oauth/callback`** (Safari-safe; proxied to Core) — see [SAFARI_BACKEND_AUTH.md](./SAFARI_BACKEND_AUTH.md) |
| `FRONTEND_ORIGIN` | `https://skyport-home.vercel.app` |
| `FRONTEND_ORIGINS` | Optional: extra preview URLs, comma-separated |
| `SESSION_SECRET` | `openssl rand -hex 32` |

**Azure Portal** → App registration → **Authentication** → **Web** → add:

- **`https://skyport-home.vercel.app/api/oauth/callback`** (required for users who open the **Web** app on iPhone/Safari)

Optional: `https://skyport-core.vercel.app/oauth/callback` if you still hit Core’s host directly for tests.

Redeploy Core after changing env.

## 2. Skyport-Web (frontend)

**Vercel → Environment Variables** (Production + Preview as needed):

| Variable | Value |
|----------|--------|
| `VITE_USE_BACKEND_AUTH` | `1` |
| `VITE_API_BASE_URL` | Leave **empty** for `skyport-home.vercel.app` (app uses same-origin `/api/*`). Set only for custom domains or preview Web → preview Core (see [VERCEL_URLS.md](./VERCEL_URLS.md)). |

Local dev: leave `VITE_API_BASE_URL` empty; Vite proxies `/api` to Core.

Rebuild/redeploy the frontend after env changes.

## 3. Flow (production Web)

1. User opens **skyport-home** → app calls **`/api/auth/me`** (same origin; Vercel rewrites to Core).
2. If not logged in → **`/api/auth/login`** → Microsoft → callback **`https://skyport-home.vercel.app/api/oauth/callback`** → session cookie on **Web** origin (Safari-compatible).
3. Next `/api/*` requests include the cookie.

See [BACKEND_AUTH.md](./BACKEND_AUTH.md), [SAFARI_BACKEND_AUTH.md](./SAFARI_BACKEND_AUTH.md). **Stuck at sign-in?** [TROUBLESHOOTING_SIGNIN.md](./TROUBLESHOOTING_SIGNIN.md).
