import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { auth } from '@/auth';

/**
 * After Microsoft login, issue a short-lived HS256 JWT and send the user to Skyport-Web.
 * Skyport verifies with VITE_SSO_HANDOFF_SECRET (same value as AUTH_SECRET).
 */
export default async function Home() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const secretValue = process.env.AUTH_SECRET;
  if (!secretValue) {
    redirect('/login');
  }

  const skyportOrigin =
    process.env.NEXT_PUBLIC_SKYPORT_ORIGIN?.replace(/\/$/, '') ?? 'http://localhost:5173';

  const secret = new TextEncoder().encode(secretValue);
  const token = await new SignJWT({
    email: session.user.email,
    role: session.user.role ?? 'editor',
    sub: session.user.id ?? session.user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  redirect(`${skyportOrigin}/?sso=${encodeURIComponent(token)}`);
}
