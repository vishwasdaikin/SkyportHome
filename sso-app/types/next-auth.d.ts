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
