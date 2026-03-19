# Safari / iPhone and backend auth (Skyport-Core)

## What you see

**“Signing in… Checking session (Skyport-Core)…”** then Microsoft **“We couldn’t sign you in”** (often on **Safari** while **Chrome works**).

## Why

With backend auth, the browser must send a **session cookie** on `GET /auth/me`. If the app called **`https://skyport-core.vercel.app`** directly from **`https://skyport-home.vercel.app`**, that request is **cross-site**. **Safari** (ITP) often **does not** send that cookie, so the app thinks you’re logged out and sends you to Microsoft again → loops / errors.

## Fix (production)

1. **Skyport-Web** (`skyport-home.vercel.app`) serves API under the **same origin**:  
   `https://skyport-home.vercel.app/api/*` → Vercel rewrites to Core (see `vercel.json`).  
   The app uses **`/api/...`** for auth (see `src/lib/api.js`).

2. **Skyport-Core** `OAUTH_REDIRECT_URI` must match the **browser-visible** callback URL:

   **`https://skyport-home.vercel.app/api/oauth/callback`**

   That hits the Web host; Vercel proxies to Core’s `/oauth/callback`. The session cookie is then **first-party** for `skyport-home.vercel.app`, so Safari sends it on `/api/auth/me`.

3. **Azure** → App registration → **Authentication** → **Web** → add that exact redirect URI (and redeploy Core).

4. On Core, **do not** force cookie `Domain=skyport-core.vercel.app` for this flow; let the cookie apply to the host the user actually loaded (the Web app). If you still set `Domain` explicitly, it must match the site users open (not ideal for split domains).

## Optional

Keep **`https://skyport-core.vercel.app/oauth/callback`** in Azure if you still test login by opening Core directly; production users on **skyport-home** should use the **`/api/oauth/callback`** path on the Web host.
