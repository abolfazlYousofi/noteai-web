import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verify } from '@node-rs/argon2';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import authConfig from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // تنظیمات پایه
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;
        const { email, password } = parsedCredentials.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const passwordsMatch = await verify(user.passwordHash, password);
        if (!passwordsMatch) return null;

        if (user.status !== 'active') throw new Error('حساب کاربری غیرفعال است.');

        return {
          id: user.id,
          email: user.email,
          role: user.role || 'STUDENT', // <- این خط را جایگزین کنید
        };
      },
    }),
  ],
});