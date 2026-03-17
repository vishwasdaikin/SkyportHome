# Sign-in worked before but not now (same access as colleagues)

The failure on **Microsoft’s** “Pick an account” / “We couldn’t sign you in” screen happens **before** Skyport receives a token. It is **not** caused by different Entra policies if IT confirms you match your colleague. Most often it is **stale identity state in your browser or Microsoft session**.

## 1. Force a fresh Microsoft sign-in (most effective)

**Option A — Log out of Microsoft for this tenant, then try the app again**

1. Open (replace with your real web URL if different):  
   `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=https%3A%2F%2Fskyport-home.vercel.app%2F`
2. After redirect, open **https://skyport-home.vercel.app/** and sign in again.

**Option B — Force password prompt (bypasses broken “already signed in” SSO)**

Open this **once** in the same browser (uses production Core):

`https://skyport-core.vercel.app/auth/login?returnTo=/&prompt=login`

After you complete Microsoft sign-in, you should land back on the home app.

*(If your Core URL is not `skyport-core.vercel.app`, swap the host.)*

## 2. Clear site data (cache / cookies artifacts)

Do **all** of these for the affected browser profile:

| Site | Action |
|------|--------|
| `https://skyport-home.vercel.app` | Cookies + site data → **Clear** |
| `https://skyport-core.vercel.app` | Cookies + site data → **Clear** |
| `https://login.microsoftonline.com` | Cookies + site data → **Clear** |
| `https://microsoftonline.com` | Clear if listed |

Chrome: **Settings → Privacy → Cookies → See all** → search `microsoft` / `skyport` / `vercel` and remove.

Then **close the browser completely** and retry, or use **InPrivate/Incognito**.

## 3. Work/school account stuck in “Signed in”

Your screenshot showed the account as **Signed in** while Microsoft still failed. That often means **Windows / Edge work account** is out of sync with the app.

- **Edge:** `edge://settings/profiles` → **Disconnect** the work profile, reconnect, or try **Chrome/Firefox** once.
- **Windows:** Settings → Accounts → **Access work or school** → if the app uses that account, sign out and back in (only if IT allows).

## 4. Extensions and VPN

- Disable **ad blockers, privacy, SSO extensions** for one test.
- Try **without corporate VPN** once (some Conditional Access rules differ by location; your colleague might be on a different path).

## 5. Still failing — get the real error code

Ask Entra admin: **Entra ID → Sign-in logs → filter your UPN → last failure**.  
Copy the **Result / error code** (e.g. `AADSTS50058`, `AADSTS50105`). Generic “try again” hides the real reason; the log does not.

## 6. App / CDN (we mitigated)

- The web app has **no service worker**; stale **HTML shell** on Vercel was possible. **Entry pages** are sent with **no-store** so the next deploy’s JS loads reliably.
- Backend auth does **not** cache your password at Microsoft; only **cookies on Core** (`skyport_session`) matter **after** a successful login. Your issue is **before** that.

---

If **Option B** (`prompt=login`) fixes it once, you can set on **Core** (Vercel env) `OAUTH_PROMPT=login` only while debugging, then remove it so colleagues aren’t forced to type password every time.

## Sign out still shows you as signed in (Chrome)

Sign out uses a **POST form** to Core (not `fetch`), then a **303** back to the web app so the browser applies cookie clears. If it still fails, set **`SESSION_CROSS_SITE=1`** on Core so the session cookie is definitely `SameSite=None; Secure`, and redeploy. Ensure **Core** env **`FRONTEND_ORIGIN`** exactly matches your web URL (e.g. `https://skyport-home.vercel.app`).
