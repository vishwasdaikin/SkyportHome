# SSO Setup Guide (NextAuth v5 + Google + Microsoft Entra ID)

> **For Cursor**: Drop this file into your project (e.g. `docs/SSO_SETUP_GUIDE.md`) and reference it in your prompt. It is self-contained — every file you need to create is listed below verbatim.

This guide reproduces the SSO setup used by the Home Solutions Internal site. It uses **NextAuth.js v5** with **Google OAuth** and **Microsoft Entra ID** as identity providers, restricts sign-in by email domain, and assigns a role (`admin` / `editor`) per user. Routes are protected via Next.js edge middleware that redirects unauthenticated traffic to `/login`.

---

## 1. What you get

- Server-rendered login page (`/login`) with a "Sign in with Google" and "Sign in with Microsoft" button.
- Domain allow-list per provider (e.g. Google only for `@yourcorp.io`, Microsoft only for `@yourcorp.com`).
- Per-user role (`admin` / `editor`) derived from a comma-separated env var.
- Edge-safe middleware that redirects unauthenticated users to `/login?callbackUrl=...`.
- Client-side `useAuth()` hook for components, including `isAdmin` / `isEditor` helpers.
- TypeScript module augmentation so `session.user.role` is typed everywhere.

---

## 2. Tech assumptions

| Thing | Version |
|---|---|
| Next.js | 15+ (works on 16; this guide is written against 16) |
| React | 19+ |
| NextAuth | `^5.0.0-beta.30` (v5 — config shape differs from v4) |
| Auth strategy | JWT sessions (no DB needed) |
| Hosting | Vercel (any Edge-compatible host works) |
| Router | App Router (`app/`) |

> **Next.js 16 note**: middleware was renamed from `middleware.ts` to `proxy.ts` in Next.js 16. If you are on Next 15 or earlier, name the file `middleware.ts` instead. The contents are identical.

---

## 3. Install

```bash
npm install next-auth@beta
```

That is the only runtime dependency added. NextAuth v5 (beta) is required because the file/folder conventions in this guide rely on the v5 API.

---

## 4. Files to create

Create these files exactly as written. File paths assume App Router with the project root containing `app/`.

### 4.1 `auth.config.ts` (edge-safe shared config)

This file is intentionally tiny and **must** stay edge-runtime safe. It is imported by both the full `auth.ts` (Node runtime) and `proxy.ts` (Edge runtime).

```ts
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

/**
 * Edge-safe auth config used by proxy.ts (middleware). No Node-only code,
 * no heavy callbacks — just the providers and the page routes.
 */
export default {
  providers: [
    // Google is optional — only register the provider when the env vars
    // are present so previews without a Google client still build.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  pages: { signIn: '/login', error: '/login' },
  trustHost: true,
} satisfies NextAuthConfig;
```

### 4.2 `auth.ts` (full server config — Node runtime)

Domain allow-list, role assignment, and JWT/session callbacks live here.

```ts
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

// 🟢 EDIT THESE for your org
const GOOGLE_DOMAIN = 'yourcorp.io';
const MICROSOFT_DOMAINS = ['yourcorp.com', 'subsidiary.com'];

const ADMIN_EMAILS = (process.env.AUTH_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function getDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain || null;
}

function isAllowedForProvider(provider: string, email: string | null | undefined): boolean {
  const domain = getDomain(email);
  if (!domain) return false;
  if (provider === 'google') return domain === GOOGLE_DOMAIN;
  if (provider === 'microsoft-entra-id') return MICROSOFT_DOMAINS.includes(domain);
  return false;
}

function getRole(email: string | null | undefined): 'admin' | 'editor' {
  if (!email) return 'editor';
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin';
  return 'editor';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    signIn({ user, account }) {
      if (!user?.email || !account?.provider) return false;
      return isAllowedForProvider(account.provider, user.email);
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = getRole(user.email ?? undefined);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as 'admin' | 'editor';
      }
      return session;
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
});
```

### 4.3 `proxy.ts` (Next 16) **OR** `middleware.ts` (Next ≤ 15)

Redirects unauthenticated requests to `/login`. Place at the project root.

```ts
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const publicPaths = ['/login'];

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // NextAuth's own routes always pass through
  if (pathname.startsWith('/api/auth')) return NextResponse.next();
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const login = new URL('/login', nextUrl.origin);
    login.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  // Skip Next internals and static assets so they don't trip the auth check.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
```

### 4.4 `app/api/auth/[...nextauth]/route.ts`

The catch-all handler for sign-in/sign-out, csrf, callback, and providers endpoints.

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

### 4.5 `types/next-auth.d.ts`

TypeScript module augmentation so `session.user.id` and `session.user.role` are typed.

```ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    role?: 'admin' | 'editor';
  }

  interface Session {
    user: User & {
      id: string;
      email: string;
      role: 'admin' | 'editor';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'admin' | 'editor';
  }
}
```

### 4.6 `components/Providers.tsx`

Wraps the React tree with `SessionProvider` (NextAuth's React context) and the optional `AuthProvider` from §4.7.

```tsx
'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
```

Then mount it in `app/layout.tsx`:

```tsx
import { Providers } from '@/components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4.7 `contexts/AuthContext.tsx`

Convenience hook so client components can grab the user, role, and a `signOut()` without importing NextAuth directly.

```tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  loading: boolean;
  signIn: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id ?? '',
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null;

  const role = session?.user?.role ?? 'editor';
  const isAdmin = role === 'admin';
  const isEditor = role === 'admin' || role === 'editor';

  async function signIn() {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return {};
  }

  async function signOut() {
    await nextAuthSignOut({ callbackUrl: '/login' });
  }

  const value: AuthContextType = {
    user,
    session: session && user ? { user } : null,
    loading,
    signIn,
    signOut,
    isAdmin,
    isEditor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 4.8 `app/login/page.tsx`

Form-based login page. The forms POST directly to NextAuth's sign-in endpoints (no client-side `signIn()` needed) and include the CSRF token NextAuth provides at `/api/auth/csrf`.

```tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const errorParam = searchParams.get('error');
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, { id: string }> | null>(null);

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((r) => r.json())
      .then((data) => setCsrfToken(data.token ?? data.csrfToken));
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((data) => setProviders(data ?? {}));
  }, []);

  const error =
    errorParam === 'AccessDenied'
      ? 'Use Google for @yourcorp.io or Microsoft for @yourcorp.com.'
      : errorParam === 'Configuration'
        ? 'Sign-in is not configured. Please contact support.'
        : errorParam
          ? 'Authentication failed. Please try again.'
          : '';

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-center mb-1">Welcome</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in with your company account to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {(providers === null || providers?.google) && (
            <form action="/api/auth/signin/google" method="POST" className="w-full">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              {csrfToken && <input type="hidden" name="csrfToken" value={csrfToken} />}
              <button
                type="submit"
                disabled={!csrfToken}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Sign in with Google
              </button>
            </form>
          )}

          {(providers === null || providers?.['microsoft-entra-id']) && (
            <form action="/api/auth/signin/microsoft-entra-id" method="POST" className="w-full">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              {csrfToken && <input type="hidden" name="csrfToken" value={csrfToken} />}
              <button
                type="submit"
                disabled={!csrfToken}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Sign in with Microsoft
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams() requires a Suspense boundary in app router.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
```

> Style the page however you like — only the two `<form>` elements and their hidden inputs are functionally required.

---

## 5. Environment variables

In `.env.local` (and in Vercel → Project → Settings → Environment Variables):

```env
# Required for any provider — sign and verify the JWT session cookie.
# Generate once with: openssl rand -base64 32
AUTH_SECRET=replace-with-32-byte-random-string

# Microsoft Entra ID (required by this template — providers cannot be
# omitted from auth.config.ts without removing them entirely)
AUTH_MICROSOFT_ENTRA_ID_ID=<Application (client) ID>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<Client secret value>
# Single-tenant: https://login.microsoftonline.com/<tenant-id>/v2.0
# Multi-tenant:  https://login.microsoftonline.com/organizations/v2.0
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0

# Google (optional — provider auto-disables when both are blank)
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret

# Optional — comma-separated emails that get the `admin` role
AUTH_ADMIN_EMAILS=alice@yourcorp.com,bob@yourcorp.io

# Optional — only set if your app does NOT run on the default URL.
# In production NextAuth derives this from the request when trustHost: true.
# AUTH_URL=https://your-domain.com
```

After every `.env.local` change, restart `npm run dev`.

---

## 6. Provider setup (one-time, per provider)

### 6.1 Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → create or pick a project.
2. **APIs & Services → OAuth consent screen** — fill App name, support email, save. *New projects fail with `invalid_client` until this is complete.*
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs (add all you need):
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-vercel-preview-*.vercel.app/api/auth/callback/google` *(see §7 about preview URLs)*
     - `https://your-production-domain.com/api/auth/callback/google`
4. Copy **Client ID** and **Client secret** → set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

### 6.2 Microsoft Entra ID

1. [Microsoft Entra admin center](https://entra.microsoft.com/) → **Identity → Applications → App registrations → New registration**.
2. **Supported account types**: pick *single tenant* (only your org) or *multi-tenant*.
3. **Redirect URI**: Platform **Web**, URI:
   - `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - `https://your-production-domain.com/api/auth/callback/microsoft-entra-id`
4. **API permissions → Add a permission → Microsoft Graph → Delegated** → check **openid**, **email**, **profile** → **Add**. Click **Grant admin consent** so users aren't asked at every sign-in.
5. **Certificates & secrets → New client secret** → copy the **Value** immediately (it's only shown once).
6. From the **Overview** page copy:
   - **Application (client) ID** → `AUTH_MICROSOFT_ENTRA_ID_ID`
   - **Directory (tenant) ID** → fill into `AUTH_MICROSOFT_ENTRA_ID_ISSUER`
7. Set `AUTH_MICROSOFT_ENTRA_ID_SECRET` to the secret Value from step 5.

---

## 7. Vercel-specific deploy steps

1. **Add the env vars** to the Vercel project for **Production**, **Preview**, and **Development**.
2. **Whitelist Vercel preview URLs in your OAuth providers**. By default each PR/commit gets a unique URL like `your-app-git-feature-branch-yourorg.vercel.app`. The simplest options:
   - **Wildcard** *(Microsoft Entra supports it, Google does not)* — register `https://*.vercel.app/api/auth/callback/microsoft-entra-id`.
   - **Stable preview URL** — in Vercel Project Settings → Git → set "Branch URL" so previews always resolve to a fixed `staging.yourdomain.com`, then register that one URL.
3. **`trustHost: true`** is already set so NextAuth will use the request's `Host` header in production. You do *not* need to set `AUTH_URL` in Vercel.
4. **Cookies**: NextAuth automatically uses `__Secure-` prefixed cookies in production over HTTPS — no extra config required.

---

## 8. Customizing for a different org

| Need | Where |
|---|---|
| Allowed Google domain | `GOOGLE_DOMAIN` constant in `auth.ts` |
| Allowed Microsoft domains | `MICROSOFT_DOMAINS` array in `auth.ts` |
| Add a third provider (GitHub, Okta, Apple, etc.) | Add to `auth.config.ts` providers array, then extend `isAllowedForProvider` in `auth.ts` |
| Skip the domain check entirely | Replace `isAllowedForProvider` with `return true` (any verified email allowed) |
| Add more roles (e.g. `viewer`) | Update `getRole`, the `Role` union in `types/next-auth.d.ts`, and `AuthContext` flags |
| Add public routes | Append paths to `publicPaths` in `proxy.ts` (use prefixes like `/blog` to allow everything below) |
| Disable Microsoft entirely | Remove the `MicrosoftEntraID(...)` entry from `auth.config.ts` providers array, drop the related env vars, and delete the Microsoft form from `app/login/page.tsx` |
| Disable Google entirely | Drop the conditional Google entry in `auth.config.ts`, remove env vars, delete the Google form |

---

## 9. Using auth in pages and API routes

### Server component / route handler

```ts
import { auth } from '@/auth';

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) return null;
  // session.user.email, session.user.role, session.user.id are all typed
  return <div>Hello {session.user.email} ({session.user.role})</div>;
}
```

```ts
// API route example
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  if (session.user.role !== 'admin') return new Response('Forbidden', { status: 403 });
  return Response.json({ ok: true });
}
```

### Client component

```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, isAdmin, signOut, loading } = useAuth();
  if (loading) return null;
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <span>{user.email}</span>
      {isAdmin && <span className="text-xs">ADMIN</span>}
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
```

---

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `Configuration` error on `/login?error=Configuration` | `AUTH_SECRET` missing OR provider env vars missing/wrong. Check the dev server log. |
| `AccessDenied` and bounced back to `/login` | Email's domain isn't in `GOOGLE_DOMAIN` / `MICROSOFT_DOMAINS`. Sign in with an allowed domain. |
| `OAuth client was not found` / Google `invalid_client` | (a) Finish Google's OAuth consent screen first; (b) `AUTH_GOOGLE_ID` matches the **Client ID** (the long `…apps.googleusercontent.com`), not the client *name*; (c) restart `npm run dev` after editing `.env.local`. |
| Microsoft: `AADSTS50194` "not configured as a multi-tenant" | Your app is single-tenant but the issuer URL says `/common` or `/organizations`. Use `https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0`. |
| Microsoft: `invalid_client` on the token exchange | The client secret expired or was copied wrong. Generate a new secret in **Certificates & secrets**, paste the **Value** into `AUTH_MICROSOFT_ENTRA_ID_SECRET`, restart. If the value contains special chars, wrap in double quotes in `.env.local`. |
| Redirect URI mismatch | Provider's redirect URI must be **exactly** `…/api/auth/callback/google` or `…/api/auth/callback/microsoft-entra-id` — including the port for localhost, no trailing slash, scheme matches (`https` in prod). |
| Vercel preview returns to `/login` indefinitely | OAuth provider doesn't have the preview URL whitelisted. Register the preview domain (or use a stable preview URL — see §7). |
| `useSearchParams() should be wrapped in a suspense boundary` | The `LoginForm` component must be inside `<Suspense>`. The template above already does this — keep the `Suspense` wrapper. |
| `auth.config.ts` errors at edge | Make sure nothing in `auth.config.ts` imports Node-only APIs (`fs`, `crypto`, DB clients, Anthropic SDK, etc.). Anything heavy goes in `auth.ts`. |
| TypeScript can't see `session.user.role` | Ensure `types/next-auth.d.ts` exists and `tsconfig.json`'s `include` array picks up `types/**/*.d.ts` (or `*.d.ts` at root). |

---

## 11. Summary checklist

- [ ] `npm install next-auth@beta`
- [ ] Create `auth.config.ts`, `auth.ts`, `proxy.ts` *(or `middleware.ts`)*, `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`, `components/Providers.tsx`, `contexts/AuthContext.tsx`, `app/login/page.tsx`
- [ ] Mount `<Providers>` in `app/layout.tsx`
- [ ] Replace `GOOGLE_DOMAIN` and `MICROSOFT_DOMAINS` in `auth.ts` with your org's domains
- [ ] Generate `AUTH_SECRET` (`openssl rand -base64 32`) and add to `.env.local` + Vercel
- [ ] Register OAuth clients in Google Cloud and Microsoft Entra (§6)
- [ ] Add provider env vars to `.env.local` + Vercel (Production + Preview + Development)
- [ ] Whitelist your Vercel preview URLs in each provider (or use a stable preview URL)
- [ ] `npm run dev` → open `http://localhost:3000/login` → sign in → confirm you land on `/`
- [ ] Deploy to Vercel; sign in on production

That's it — once both providers' redirect URIs include the production hostname and the env vars are set in Vercel, the deploy is fully gated.
