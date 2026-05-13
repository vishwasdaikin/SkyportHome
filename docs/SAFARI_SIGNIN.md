# Safari and sign-in

Skyport-Web uses **Skyport-Core** session cookies (same-origin `/api` proxy), not in-browser MSAL storage. Safari compatibility for OAuth completion is covered in **[SAFARI_BACKEND_AUTH.md](./SAFARI_BACKEND_AUTH.md)** (callback URL on the Web origin, cookie attributes, and same-site behavior).

If sign-in fails only on iPhone/Safari, start with [TROUBLESHOOTING_SIGNIN.md](./TROUBLESHOOTING_SIGNIN.md) and **SAFARI_BACKEND_AUTH.md**.
