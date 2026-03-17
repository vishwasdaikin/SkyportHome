# Your Vercel URLs — tied together

| Role | URL |
|------|-----|
| **Skyport-Web (production)** | https://skyport-home.vercel.app |
| **Skyport-Core (production API)** | https://skyport-core.vercel.app |
| **Core — branch preview** | https://skyport-core-git-main-digital-experience2.vercel.app |
| **Core — one-off deploy preview** | https://skyport-core-odpmx5l99-digital-experience2.vercel.app *(changes per deployment)* |

---

## Production (recommended daily use)

### Skyport-Web → Vercel env (Production)

| Variable | Value |
|----------|--------|
| `VITE_USE_BACKEND_AUTH` | `1` |
| `VITE_API_BASE_URL` | `https://skyport-core.vercel.app` |

No trailing slash. Redeploy after saving.

### Skyport-Core → Vercel env (Production)

| Variable | Value |
|----------|--------|
| `OAUTH_REDIRECT_URI` | `https://skyport-core.vercel.app/oauth/callback` |
| `FRONTEND_ORIGIN` | `https://skyport-home.vercel.app` |
| `FRONTEND_ORIGINS` | *(optional)* Add preview web URLs only if you use them, e.g. `https://skyport-home-git-main-xxx.vercel.app` |

Redeploy Core after saving.

### Azure Portal → App registration → Authentication → Web

Add **every** Core host you use for login (each is a separate redirect URI):

1. `https://skyport-core.vercel.app/oauth/callback` ← **required for production**
2. `https://skyport-core-git-main-digital-experience2.vercel.app/oauth/callback` ← **if you test login on that preview**
3. `https://skyport-core-odpmx5l99-digital-experience2.vercel.app/oauth/callback` ← only until that deploy expires; **prefer the branch URL (#2)** for stable previews

---

## Preview Core deployments

Each preview Core URL must have:

- **Same Azure variables** (client ID, secret, tenant, session secret).
- **`OAUTH_REDIRECT_URI`** = `https://<that-exact-preview-host>/oauth/callback` (must match an entry in Azure).
- **`FRONTEND_ORIGIN`** = `https://skyport-home.vercel.app` (or your preview web URL if the UI is also a preview).

If you open **preview Web** and want it to hit **preview Core**, set that Web deployment’s `VITE_API_BASE_URL` to the preview Core origin (e.g. `https://skyport-core-git-main-digital-experience2.vercel.app`).

---

## Quick checklist

- [ ] Web prod: `VITE_API_BASE_URL` = `https://skyport-core.vercel.app`
- [ ] Core prod: `OAUTH_REDIRECT_URI` + `FRONTEND_ORIGIN` = table above
- [ ] Azure: Web redirect URIs for each Core host you use
- [ ] Redeploy Web and Core after env changes

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for full context.
