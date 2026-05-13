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
