import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from '@node-rs/argon2';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
});

export async function POST(req: Request) {
  try {
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

    // هش کردن رمز عبور با Argon2id (طبق سند بخش 5.3)
    const passwordHash = await hash(password);

    // ساخت کاربر جدید با نقش پیش‌فرض STUDENT
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'STUDENT', 
      },
    });

    // ثبت لاگ امنیتی (طبق سند بخش 6.3)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, message: 'ثبت‌ نام با موفقیت انجام شد' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}