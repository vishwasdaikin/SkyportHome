# SSO app (NextAuth v5)

**Microsoft Entra ID only.** After login, users are **redirected to Skyport-Web** with a short-lived signed URL parameter (`?sso=`), which the Vite app verifies using **`VITE_SSO_HANDOFF_SECRET`** (same value as **`AUTH_SECRET`** here).

## Quick start

```bash
cd sso-app
cp .env.local.example .env.local
# Set AUTH_SECRET, NEXT_PUBLIC_SKYPORT_ORIGIN (default http://localhost:5173), and Entra vars
npm run dev
```

On the **Skyport-Web** repo root, add to **`.env.local`**:

```env
VITE_SSO_HANDOFF_SECRET=<paste the exact same string as AUTH_SECRET in sso-app/.env.local>
```

Restart **`npm run dev`** for Skyport-Web after changing env.

## Flow

1. User opens `http://localhost:3000` → signs in with Microsoft on this app.
2. Success → redirect to `NEXT_PUBLIC_SKYPORT_ORIGIN/?sso=<jwt>` (15-minute JWT).
3. Skyport-Web consumes `sso`, stores session in `sessionStorage`, strips the query → user sees the main site **without** a second MSAL redirect.

## Sign out

- **Skyport** “Sign out” (handoff session): clears `sessionStorage` and opens `GET {VITE_SSO_APP_ORIGIN}/logout?callbackUrl=…` so this app’s NextAuth cookie is cleared, then the user is sent back to Skyport (`auth.ts` `redirect` allows `NEXT_PUBLIC_SKYPORT_ORIGIN`).
- **MSAL on Skyport** (if the user also has a browser session from the in-app Microsoft login): Entra front-channel logout, then `postLogoutRedirectUri` → `http://localhost:3000/logout` (no query). Register that **exact** logout URL on the same Entra app registration that Skyport’s MSAL client ID uses. The `/logout` route then runs `signOut` and redirects to `NEXT_PUBLIC_SKYPORT_ORIGIN`.

## Customize

| Item | Location |
|------|----------|
| Allowed Microsoft email domains | `auth.ts` → `MICROSOFT_DOMAINS` |
| Skyport base URL (dev/prod) | `.env.local` → `NEXT_PUBLIC_SKYPORT_ORIGIN` |
| Admin emails | `.env.local` → `AUTH_ADMIN_EMAILS` |
| Public routes (no login) | `middleware.ts` → `publicPaths` |

## Production

1. Deploy **sso-app** and **Skyport-Web**; set `NEXT_PUBLIC_SKYPORT_ORIGIN` to the **public Skyport URL**.
2. Set **`VITE_SSO_HANDOFF_SECRET`** on Skyport’s build to match **`AUTH_SECRET`** on sso-app (both from Vercel env).
3. Register redirect URIs for both apps in Entra.

## Providers

Microsoft Entra is registered when `AUTH_MICROSOFT_ENTRA_ID_*` are set.
