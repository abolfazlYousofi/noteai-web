import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = schema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'ایمیل نامعتبر است' }, { status: 400 });

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // به دلایل امنیتی (جلوگیری از افشای ایمیل‌ها)، همیشه پیام موفقیت برمی‌گردانیم
    if (!user) {
      return NextResponse.json({ success: true, message: 'اگر این ایمیل در سیستم باشد، لینک ارسال شد.' });
    }

    // ساخت توکن یکتا و زمان انقضا (۱ ساعت)
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetLink = `${siteUrl}/reset-password?token=${resetToken}`;

    // 🆕 در محیط واقعی، اینجا ایمیل ارسال می‌شود. فعلاً در کنسول چاپ می‌کنیم.
    console.log('\n========================================');
    console.log('🔐 لینک بازیابی رمز عبور (برای تست):');
    console.log(resetLink);
    console.log('========================================\n');

    return NextResponse.json({ success: true, message: 'لینک بازیابی در ترمینال چاپ شد.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}