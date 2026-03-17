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
| `OAUTH_REDIRECT_URI` | `https://skyport-core.vercel.app/oauth/callback` |
| `FRONTEND_ORIGIN` | `https://skyport-home.vercel.app` |
| `FRONTEND_ORIGINS` | Optional: extra preview URLs, comma-separated |
| `SESSION_SECRET` | `openssl rand -hex 32` |

**Azure Portal** → App registration → **Authentication** → **Web** → add redirect URI:

`https://<your-core-host>/oauth/callback`

Redeploy Core after changing env. On boot, logs should show `crossSiteSession=true` when the API host differs from `FRONTEND_ORIGIN`.

## 2. Skyport-Web (frontend)

**Vercel → Environment Variables** (Production + Preview as needed):

| Variable | Value |
|----------|--------|
| `VITE_USE_BACKEND_AUTH` | `1` |
| `VITE_API_BASE_URL` | `https://skyport-core.vercel.app` |

Do **not** set `VITE_API_BASE_URL` for local dev (leave empty; Vite proxies `/api` to Core).

Rebuild/redeploy the frontend after env changes.

## 3. Flow

1. User opens the **Web** URL → app calls `VITE_API_BASE_URL/auth/me` with credentials.
2. If not logged in → redirect to **Core** `/auth/login` → Microsoft → callback on **Core** → session cookie on Core’s domain (`SameSite=None; Secure`).
3. User returns to **Web**; `fetch` to Core includes the cookie (cross-origin).

See also [BACKEND_AUTH.md](./BACKEND_AUTH.md). **Stuck at Microsoft sign-in?** [TROUBLESHOOTING_SIGNIN.md](./TROUBLESHOOTING_SIGNIN.md).
