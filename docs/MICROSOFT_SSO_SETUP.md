# Microsoft SSO (Entra ID) Setup

The login page uses **Microsoft Entra ID** (formerly Azure AD) for sign-in. Only emails from `@motili.com`, `@daikincomfort.com`, and `@motili.io` are allowed.

## 1. Register an application in Microsoft Entra

1. Go to [Microsoft Entra admin center](https://entra.microsoft.com/).
2. **Identity** → **Applications** → **App registrations** → **New registration**.
3. **Name**: e.g. "Daikin Home Solutions Internal".
4. **Supported account types**: Choose one:
   - **Single tenant** (only your org) → issuer will use your **Directory (tenant) ID**.
   - **Multi-tenant** (any org) → issuer: `https://login.microsoftonline.com/organizations/v2.0`.
5. **Redirect URI**: Platform **Web**, URI:
   - Local: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - Production: `https://your-domain.com/api/auth/callback/microsoft-entra-id`
6. Click **Register**.

## 2. Add API permissions

The app needs **OpenID Connect** delegated permissions so users can sign in and so we get `openid`, `profile`, and `email` (for the user’s name and email).

1. In your app, go to **API permissions**.
2. Click **Add a permission**.
3. Choose **Microsoft Graph**.
4. Choose **Delegated permissions**.
5. Under **OpenID permissions**, select:
   - **openid**
   - **email**
   - **profile**
6. Click **Add permissions**.
7. (Optional but recommended) Click **Grant admin consent for [Your org]** so users aren’t prompted every time.

Without these, the OAuth flow can fail with a generic “Authentication failed” or consent errors.

## 3. Get Client ID and create a client secret

1. On the app **Overview** page, copy **Application (client) ID**.
2. **Certificates & secrets** → **New client secret** → copy the **Value** (it’s shown only once).

## 4. Set issuer (tenant URL)

- **Single tenant**: `https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0`  
  (Find **Directory (tenant) ID** on the app Overview.)
- **Multi-tenant**: `https://login.microsoftonline.com/organizations/v2.0`

## 5. Environment variables

In `.env.local`:

```env
# NextAuth – required for Microsoft SSO
AUTH_SECRET=<generate with: openssl rand -base64 32>

# Microsoft Entra ID (from App registration)
AUTH_MICROSOFT_ENTRA_ID_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<Client secret value>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
```

Optional:

- **AUTH_URL** – Set if the app runs on a non-default URL (e.g. `http://localhost:3000`). Redirect URIs in Entra must match this base URL.
- **AUTH_ADMIN_EMAILS** – Comma-separated emails that get the `admin` role (e.g. `admin@motili.com`). Others get `editor`.

## 6. Run the app

1. `npm run dev`
2. Open `http://localhost:3000/login`
3. Click **Sign in with Microsoft** and sign in with an allowed-domain account.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| "Sign-in is not configured" | `AUTH_SECRET` and all three `AUTH_MICROSOFT_ENTRA_ID_*` vars are set. Redirect URI in Entra exactly matches your app URL (including port). |
| "Access denied" / redirect back to login | Sign-in is restricted to @motili.com, @daikincomfort.com, @motili.io. Use an account with one of these domains. |
| Redirect URI mismatch | In Entra, the redirect URI must be exactly `http://localhost:3000/api/auth/callback/microsoft-entra-id` (no trailing slash, correct port). |
| "Authentication failed" | Add **API permissions** (step 2): Microsoft Graph → Delegated → **openid**, **email**, **profile**. Grant admin consent. Check the terminal where `npm run dev` is running for the real error. |
| AADSTS50194 / "not configured as a multi-tenant" | Your app is **single-tenant** but the issuer used `/common`. In `.env.local`, set `AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0` using the **Directory (tenant) ID** from your app’s Overview in Entra (not `common`). |
| **invalid_client** (after Microsoft sign-in, then kicked back to login) | Microsoft rejected the **client secret** during the token exchange. In Entra: **Certificates & secrets** → create a **new client secret**, copy the **Value** immediately (it’s shown only once). In `.env.local` set `AUTH_MICROSOFT_ENTRA_ID_SECRET` to that value exactly (no spaces, no quotes unless the value contains spaces). Restart the dev server. If the secret has special characters, wrap the value in double quotes in `.env.local`. |
