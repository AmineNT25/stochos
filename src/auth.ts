import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { sql } from './lib/db';

declare module 'next-auth' {
  interface User {
    role: string;
  }
  interface Session {
    user: { id: string; role: string } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await sql`
          SELECT id, email, name, password_hash, role, avatar
          FROM users
          WHERE email = ${String(credentials.email)}
        `;

        const user = rows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(String(credentials.password), user.password_hash as string);
        if (!valid) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          role: user.role as string,
          image: (user.avatar as string | null) ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image ?? undefined;
      }
      if (trigger === 'update') {
        if (updateData?.image !== undefined) token.picture = updateData.image;
        if (updateData?.name)               token.name    = updateData.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id as string;
        session.user.role  = token.role as string;
        session.user.image = (token.picture as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
});
