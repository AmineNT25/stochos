import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    // Map token.role → session.user so the authorized() callback can read it.
    // This runs in the edge middleware; no Node.js APIs allowed here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: any) {
      if (session?.user && token) {
        session.user.role = token.role as string;
        session.user.id   = token.id   as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname   = nextUrl.pathname;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (auth?.user as any)?.role as string | undefined;

      if (pathname.startsWith('/admin')) {
        return isLoggedIn && role === 'admin'
          ? true
          : Response.redirect(new URL('/dashboard', nextUrl));
      }

      const protectedPaths = ['/dashboard', '/session', '/profile', '/leaderboard'];
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

      if (isProtected) return isLoggedIn;

      if (isLoggedIn && (pathname.startsWith('/auth') || pathname === '/')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
