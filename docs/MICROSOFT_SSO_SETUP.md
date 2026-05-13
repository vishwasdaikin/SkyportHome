# Microsoft Entra ID — Skyport-Web + Skyport-Core

Skyport-Web does **not** host OAuth secrets. Microsoft sign-in is implemented in **Skyport-Core**; the browser only follows redirects and stores the **httpOnly** session cookie returned through same-origin `/api/*` paths.

## 1. Register an application in Microsoft Entra

1. [Microsoft Entra admin center](https://entra.microsoft.com/) → **Identity** → **Applications** → **App registrations** → **New registration**.
2. **Name**: e.g. `Skyport` (your choice).
3. **Supported account types**: single-tenant or multi-tenant per your org.
4. **Redirect URI**: platform **Web** (not SPA):
   - Local Web + Core proxy: `http://localhost:5173/api/oauth/callback`
   - Production: `https://<your-skyport-web-host>/api/oauth/callback`
5. **Register**, then **Certificates & secrets** → create a **client secret** (copy the value once).

## 2. API permissions

Under **API permissions**, add Microsoft Graph **Delegated**: **openid**, **email**, **profile**. Grant admin consent if required by your tenant.

## 3. Configure Skyport-Core

Set on Core (see Core’s `.env.example`):

- `AUTH_MICROSOFT_ENTRA_ID_ID` — Application (client) ID  
- `AUTH_MICROSOFT_ENTRA_ID_SECRET` — Client secret value  
- `AUTH_MICROSOFT_ENTRA_ID_TENANT` — Tenant GUID (or `common`); not the full issuer URL  
- `OAUTH_REDIRECT_URI` — Must match the **Web** redirect URI above  
- `FRONTEND_ORIGIN` — Skyport-Web origin (e.g. `http://localhost:5173`)
- `SESSION_SECRET` — Random ≥32-char string for the session JWT

Optional sign-in policy (see [BACKEND_AUTH.md](./BACKEND_AUTH.md)):

- `OAUTH_ALLOWED_MICROSOFT_EMAIL_DOMAINS`
- `OAUTH_ADMIN_EMAILS`

## 4. Configure Skyport-Web

Root `.env.local`:

```env
SKYPORT_CORE_URL=http://localhost:3001
```

Run `npm run dev` in Skyport-Web and ensure Core is running. See [BACKEND_AUTH.md](./BACKEND_AUTH.md) for full flow.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Timeout / “Run Core on port 3001” | Core is running; `SKYPORT_CORE_URL` matches Core’s URL. |
| Redirect URI mismatch | Entra **Web** URI exactly matches `OAUTH_REDIRECT_URI` (including `https`, host, path `/api/oauth/callback`). |
| `invalid_client` on token exchange | New client secret in Entra; value copied into Core env; Core redeployed/restarted. |
| Access denied after Microsoft login | Core rejected the email domain. Add the user’s domain to `OAUTH_ALLOWED_MICROSOFT_EMAIL_DOMAINS` on Core (or unset it to allow any email). |

For Safari-specific cookie behavior, see [SAFARI_BACKEND_AUTH.md](./SAFARI_BACKEND_AUTH.md).
