# Google SSO Setup

The login page supports **Google OAuth** alongside Microsoft. Only emails from `@motili.com`, `@daikincomfort.com`, and `@motili.io` are allowed (enforced in NextAuth `signIn` callback).

## 1. Create OAuth credentials in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. **Configure the OAuth consent screen first** (required for new projects):
   - **APIs & Services** → **OAuth consent screen**.
   - Choose **Internal** (org only) or **External** (if you need to test with other domains).
   - Fill **App name**, **User support email**, **Developer contact** → **Save and Continue** through the steps.
   - Without this, Google returns "OAuth client was not found" / `invalid_client` even with correct ID and secret.
4. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
5. **Application type**: **Web application**.
6. **Name**: e.g. "Daikin Home Solutions Internal".
7. **Authorized redirect URIs** → **Add URI**:
   - Local: `http://localhost:3000/api/auth/callback/google` (must match exactly — no trailing slash; use 3000 if that’s where your app runs).
   - Production: `https://your-domain.com/api/auth/callback/google`
8. Click **Create** and copy the **Client ID** and **Client secret**.

## 2. Environment variables

In `.env.local`:

```env
# Paste the raw values only — no angle brackets or quotes around the ID/secret
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret
```

## 3. Run the app

1. `npm run dev`
2. Open `http://localhost:3000/login`
3. Click **Sign in with Google** and sign in with an allowed-domain account.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| **"OAuth client was not found" / Error 401: invalid_client** | **(1) OAuth consent screen:** In the same project, go to **APIs & Services** → **OAuth consent screen** and complete setup (App name, support email, Save). New projects often fail until this is done. **(2) Client ID:** In [Credentials](https://console.cloud.google.com/apis/credentials), open your **OAuth 2.0 Client ID** (type "Web application"). Copy the **Client ID** (long string ending in `.apps.googleusercontent.com`) — not the client name. In `.env.local`, set `AUTH_GOOGLE_ID` to that value with no leading/trailing spaces. **(3) Client secret:** From the same client, copy the **Client secret** (create a new one if needed); set `AUTH_GOOGLE_SECRET`; if it has special characters, wrap the value in double quotes. **(4) Redirect URI:** Under that client, **Authorized redirect URIs** must include exactly `http://localhost:3000/api/auth/callback/google`. **(5) Restart:** Restart the dev server after any `.env.local` change and open the app at `http://localhost:3000` (not 3001/3002). |
| "Sign-in is not configured" | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` are set. Redirect URI in Google Cloud exactly matches your app URL (including port). |
| "Access denied" | Sign-in is restricted to @motili.com, @daikincomfort.com, @motili.io. Use an account with one of these domains. |
| Redirect URI mismatch | In Google Cloud, the redirect URI must be exactly `http://localhost:3000/api/auth/callback/google` (no trailing slash, correct port). |
