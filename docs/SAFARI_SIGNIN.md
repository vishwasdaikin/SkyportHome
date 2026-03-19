# Sign-in on Safari (iPhone / iPad / Mac)

Microsoft Entra sign-in uses a redirect to `login.microsoftonline.com` and back. **Safari** (especially on iOS) is stricter than Chrome about storage across that redirect. The app is configured to use **localStorage + cookies** for MSAL on Mobile Safari and desktop Safari so the auth state survives the round trip.

## If you still see “We couldn’t sign you in” on Microsoft’s page

1. **Use “Use another account”** (or sign out at [microsoft.com](https://www.microsoft.com)) and sign in again—stale sessions sometimes confuse Safari.
2. **Settings → Safari → Clear History and Website Data** (or remove data only for `skyport-home.vercel.app` and `login.microsoftonline.com` under **Advanced → Website Data**).
3. Turn off **Private Browsing** for this flow.
4. Confirm in **Azure Portal → App registration → Authentication** that the **Single-page application** redirect URI is exactly  
   `https://skyport-home.vercel.app`  
   (same scheme, no trailing slash, no path—unless you intentionally use a path).

## Technical note

See [MSAL.js known issues on Safari](https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/Known-issues-on-Safari).  
`storeAuthStateInCookie` and a persistent cache location are required for reliable **authorization code flow with PKCE** redirects in WebKit.
