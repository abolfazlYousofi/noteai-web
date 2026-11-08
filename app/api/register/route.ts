import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from '@node-rs/argon2';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'; // 🆕 ایمپورت توابع امنیتی

// 🛡️ قوانین سخت‌گیرانه رمز عبور (حروف بزرگ، کوچک، عدد و طول ۸ تا ۱۵)
const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .max(15, 'رمز عبور نباید بیشتر از ۱۵ کاراکتر باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حروف کوچک انگلیسی باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حروف بزرگ انگلیسی باشد')
    .regex(/[0-9]/, 'رمز عبور باید شامل اعداد باشد'),
});

export async function POST(req: Request) {
  try {
    // 🆕 اعمال محدودیت درخواست (Rate Limit)
    const ip = getClientIp(req);
    const rate = checkRateLimit({ key: `register:${ip}`, limit: 5, windowMs: 15 * 60 * 1000 });
    
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها بیش از حد مجاز. لطفاً بعداً امتحان کنید.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter || 60) } }
      );
    }

    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = validation.data;

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'این ایمیل قبلاً ثبت شده است' }, { status: 400 });
    }

    // هش کردن رمز عبور با Argon2id
    const passwordHash = await hash(password);

    // ساخت کاربر جدید با نقش پیش‌فرض STUDENT
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'STUDENT', 
      },
    });

    // ثبت لاگ امنیتی
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        ipAddress: ip,
      },
    });

    return NextResponse.json({ success: true, message: 'ثبت‌نام با موفقیت انجام شد' }, { status: 201 });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}