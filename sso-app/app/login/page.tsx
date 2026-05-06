'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const errorParam = searchParams.get('error');
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [hasMicrosoft, setHasMicrosoft] = useState(true);

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((r) => r.json())
      .then((data: { token?: string; csrfToken?: string }) =>
        setCsrfToken(data.token ?? data.csrfToken ?? null),
      );
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((data: Record<string, { id: string }>) => {
        setHasMicrosoft(!!data?.['microsoft-entra-id']);
      });
  }, []);

  const error =
    errorParam === 'AccessDenied'
      ? 'Your email domain is not allowed. Sign in with an account from an approved Microsoft domain.'
      : errorParam === 'Configuration'
        ? 'Sign-in is not configured. Set AUTH_SECRET and Microsoft Entra variables (see .env.local.example).'
        : errorParam
          ? 'Authentication failed. Please try again.'
          : '';

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-center mb-1">Welcome</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in with Microsoft to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {!hasMicrosoft && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
            Microsoft sign-in is not configured. Add AUTH_MICROSOFT_ENTRA_ID_* to <code className="text-xs">.env.local</code>{' '}
            and restart the dev server.
          </div>
        )}

        <form action="/api/auth/signin/microsoft-entra-id" method="POST" className="w-full">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {csrfToken && <input type="hidden" name="csrfToken" value={csrfToken} />}
          <button
            type="submit"
            disabled={!csrfToken || !hasMicrosoft}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Sign in with Microsoft
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
