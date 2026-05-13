import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

// 🟢 EDIT — allowed email domains for Microsoft Entra sign-in (no @ prefix)
const MICROSOFT_DOMAINS = ['daikincomfort.com'];

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
    /**
     * Default Auth.js behavior only allows redirects to the same origin as the auth app.
     * After sign-out we send users to Skyport-Web at NEXT_PUBLIC_SKYPORT_ORIGIN (different origin in dev/prod).
     */
    redirect({ url, baseUrl }) {
      const skyportRaw = process.env.NEXT_PUBLIC_SKYPORT_ORIGIN?.trim().replace(/\/$/, '') ?? '';
      try {
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        const target = new URL(url);
        if (target.origin === new URL(baseUrl).origin) return url;
        if (skyportRaw) {
          const allowed = new URL(skyportRaw.startsWith('http') ? skyportRaw : `https://${skyportRaw}`);
          if (target.origin === allowed.origin) return url;
        }
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
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
