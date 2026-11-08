import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verify } from '@node-rs/argon2';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import authConfig from './auth.config';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { getIpInfo } from '@/lib/security/ip-info';

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
        // ۱. اعتبارسنجی ورودی‌ها با Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;
        const { email, password } = parsedCredentials.data;

        // ۲. محدودیت درخواست (Rate Limit)
        const rl = checkRateLimit({ key: `login:${email}`, limit: 10, windowMs: 15 * 60 * 1000 });
        if (!rl.allowed) {
          throw new Error('تعداد تلاش‌های ورود بیش از حد مجاز. لطفاً ۱۵ دقیقه دیگر امتحان کنید.');
        }

        // ۳. پیدا کردن کاربر
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        // ۴. بررسی رمز عبور
        const passwordsMatch = await verify(user.passwordHash, password);
        if (!passwordsMatch) return null;

        // ۵. بررسی وضعیت (حذف نرم یا مسدود بودن)
        if (user.isDeleted) throw new Error('این حساب کاربری حذف شده است. لطفاً با ایمیل جدید ثبت‌نام کنید.');
        if (user.status !== 'active') throw new Error('حساب کاربری غیرفعال است.');

        // ۶. 🆕 دریافت IP و اطلاعات جغرافیایی
        const headersList = await headers();
        let ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        // 🆕 تمیز کردن فرمت IPv6 (مثلاً ::ffff:127.0.0.1)
        if (ip.startsWith('::ffff:')) {
          ip = ip.replace('::ffff:', '');
        }
        
        // دریافت کشور و وضعیت VPN (در پس‌زمینه اجرا می‌شود تا لاگین کند نشود)
        const ipInfo = await getIpInfo(ip);

        // ۷. 🆕 آپدیت آخرین IP و ثبت لاگ امنیتی
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastIp: ip,
              lastCountry: ipInfo.country,
              isVpn: ipInfo.isVpn,
            },
          });

          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'USER_LOGIN',
              ipAddress: ip,
              country: ipInfo.country,
              isVpn: ipInfo.isVpn,
            },
          });
        } catch (err) {
          console.error('Failed to log login info:', err);
          // اگر ثبت لاگ خطا داد، نباید جلوی لاگین کاربر را بگیرد
        }

        // ۸. برگرداندن اطلاعات کاربر به NextAuth
        return {
          id: user.id,
          email: user.email,
          role: user.role || 'STUDENT',
        };
      },
    }),
  ],
});