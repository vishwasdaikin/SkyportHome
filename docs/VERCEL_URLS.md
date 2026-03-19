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
| `VITE_API_BASE_URL` | *(empty for prod Web — uses `/api` proxy; Safari-safe)* |

Redeploy after saving.

### Skyport-Core → Vercel env (Production)

| Variable | Value |
|----------|--------|
| `OAUTH_REDIRECT_URI` | **`https://skyport-home.vercel.app/api/oauth/callback`** |
| `FRONTEND_ORIGIN` | `https://skyport-home.vercel.app` |
| `FRONTEND_ORIGINS` | *(optional)* Add preview web URLs only if you use them, e.g. `https://skyport-home-git-main-xxx.vercel.app` |

Redeploy Core after saving.

### Azure Portal → App registration → Authentication → Web

1. **`https://skyport-home.vercel.app/api/oauth/callback`** ← **required** for users on the Web app (incl. Safari)
2. Optional: `https://skyport-core.vercel.app/oauth/callback` if you test login on Core’s URL directly
3. Preview Core hosts: `https://<preview-core>/oauth/callback` only if you log in via that host

---

## Preview Core deployments

Each preview Core URL must have:

- **Same Azure variables** (client ID, secret, tenant, session secret).
- **`OAUTH_REDIRECT_URI`** = `https://<that-exact-preview-host>/oauth/callback` (must match an entry in Azure).
- **`FRONTEND_ORIGIN`** = `https://skyport-home.vercel.app` (or your preview web URL if the UI is also a preview).

If you open **preview Web** and want it to hit **preview Core**, set that Web deployment’s `VITE_API_BASE_URL` to the preview Core origin (e.g. `https://skyport-core-git-main-digital-experience2.vercel.app`).

---

## Quick checklist

- [ ] Web prod: same-origin `/api` (no `VITE_API_BASE_URL` for skyport-home)
- [ ] Core prod: `OAUTH_REDIRECT_URI` = `https://skyport-home.vercel.app/api/oauth/callback`, `FRONTEND_ORIGIN` = skyport-home
- [ ] Azure: includes that `/api/oauth/callback` URI
- [ ] Redeploy Web and Core after env changes

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for full context.
