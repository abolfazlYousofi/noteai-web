import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email'; // 🆕 ایمپورت شد

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = schema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'ایمیل نامعتبر است' }, { status: 400 });

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // ساخت توکن و زمان انقضا
      const resetToken = crypto.randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const resetLink = `${siteUrl}/reset-password?token=${resetToken}`;

      // 🆕 ارسال ایمیل واقعی
      await sendPasswordResetEmail(email, resetLink);
      
      // برای دیباگ در محیط لوکال، هم چاپ می‌کنیم
      console.log('\n========================================');
      console.log('🔐 لینک بازیابی (برای تست):', resetLink);
      console.log('========================================\n');
    }

    // به دلایل امنیتی، همیشه پیام موفقیت برمی‌گردانیم
    return NextResponse.json({ success: true, message: 'اگر این ایمیل در سیستم باشد، لینک ارسال شد.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}