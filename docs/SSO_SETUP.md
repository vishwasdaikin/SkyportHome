# Azure AD / Microsoft SSO Setup

This app supports optional **Microsoft Single Sign-On (SSO)** using Azure AD (Microsoft Entra ID). When configured, users see **Sign in with Microsoft** in the header and can sign out.

**Server-side OAuth (Web client + secret)** is documented in [BACKEND_AUTH.md](./BACKEND_AUTH.md) (Skyport-Core + `VITE_USE_BACKEND_AUTH=1`).

**Safari / iPhone sign-in issues** → [SAFARI_SIGNIN.md](./SAFARI_SIGNIN.md).

## 1. Register the app in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** (or Azure Active Directory) → **App registrations** → **New registration**.
2. **Name:** e.g. `Skyport Playbook` (or your app name).
3. **Supported account types:** choose **Accounts in this organizational directory only** (single tenant) or **Accounts in any organizational directory** (multitenant) as needed.
4. **Redirect URI:**  
   - Platform: **Single-page application (SPA)**  
   - URI: `http://localhost:5173` for local dev (and add your production URL later, e.g. `https://your-domain.com`).
5. Click **Register**.

## 2. Get Client ID and Issuer

- **Application (client) ID:** App registration → **Overview** → copy **Application (client) ID**.
- **Directory (tenant) ID:** Same **Overview** page → copy **Directory (tenant) ID**.  
  The **issuer** URL is: `https://login.microsoftonline.com/<tenant-id>/v2.0` (use `common` for multitenant).

## 3. Configure the app

1. Copy `.env.example` to **`.env.local`** (with the leading dot) in the project root.
2. Set (do **not** put the client secret in the frontend – this SPA uses PKCE, no secret):

```env
AUTH_MICROSOFT_ENTRA_ID_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
```

3. Sign-in uses **OIDC only** (no Graph scope on first redirect). Add **User.Read** under **API permissions** only if you later call Microsoft Graph from the app (`graphRequest` in code).

4. **Restart the dev server** after every `.env.local` change (Ctrl+C, then `npm run dev`). Vite does not apply new env values until the server restarts; then reload the browser. Users are then sent to Microsoft sign-in before viewing the app.

## 4. Redirect URIs in Azure (production)

When you deploy, add your production URL as a **SPA** redirect URI:

- App registration → **Authentication** → **Add URI** under **Single-page application** (e.g. `https://your-domain.com`).  
  The app uses `window.location.origin` as redirect URI, so it must match what you register in Azure.

## 5. App must be a SPA (PKCE)

- Redirect URIs must be under **Authentication** → **Single-page application**, not only under “Web”.
- Do not rely on a **client secret** for this frontend; the SPA uses PKCE.

## Troubleshooting

- **AADSTS9002326 (Cross-origin token redemption / SPA only):** Your redirect URI must be registered under **Single-page application**, not only under **Web**. In the app registration → **Authentication** → **Single-page application** → **Add URI** → e.g. `http://localhost:5173` → **Save**. This app uses PKCE (browser); “Web” + client secret is a different flow.

- **AADSTS90013 (Invalid input):** Often fixed by (1) **SPA** redirect URI matching the exact origin (e.g. `http://localhost:5173`, no path unless you registered one), (2) **no quotes or spaces** around values in `.env.local`, (3) **User.Read** delegated permission + consent, (4) correct **Application (client) ID** and issuer URL.
- **Redirect URI mismatch:** The SPA redirect URI in Azure must exactly match `window.location.origin` (including port).
- **CORS / invalid redirect:** Same origin as the app.
- **Auth not triggering:** Use **`.env.local`** (not `env.local` without the dot). Restart the dev server after changes.
