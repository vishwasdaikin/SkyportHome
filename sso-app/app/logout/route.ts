import { signOut } from '@/auth';

/** Allow redirect back to Skyport-Web only (matches NEXT_PUBLIC_SKYPORT_ORIGIN). */
function safeCallbackUrl(candidate: string | null, fallback: string): string {
  const skyportRaw = process.env.NEXT_PUBLIC_SKYPORT_ORIGIN?.trim().replace(/\/$/, '') ?? '';
  if (!candidate) return fallback;
  try {
    const u = new URL(candidate);
    if (!skyportRaw) return fallback;
    const allowed = new URL(skyportRaw.startsWith('http') ? skyportRaw : `https://${skyportRaw}`);
    if (u.origin === allowed.origin) return candidate;
  } catch {
    /* ignore */
  }
  return fallback;
}

/**
 * Clears the NextAuth session cookie and redirects to Skyport (or another allowed URL).
 * Used after MSAL logout (postLogoutRedirectUri) or direct navigation from Skyport “Sign out”.
 */
export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const fallback = process.env.NEXT_PUBLIC_SKYPORT_ORIGIN ?? 'http://localhost:5173/';
  const redirectTo = safeCallbackUrl(reqUrl.searchParams.get('callbackUrl'), fallback);
  return signOut({ redirectTo });
}
