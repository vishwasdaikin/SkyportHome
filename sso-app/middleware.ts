import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/** Same NextAuth instance as auth.ts / route handlers — avoids duplicate bundles (webpack runtime errors). */
const publicPaths = ['/login', '/logout'];

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
