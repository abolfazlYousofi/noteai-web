import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from '@node-rs/argon2';
import { z } from 'zod';

const schema = z.object({
  token: z.string(),
  newPassword: z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .max(15, 'رمز عبور نباید بیشتر از ۱۵ کاراکتر باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حروف کوچک انگلیسی باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حروف بزرگ انگلیسی باشد')
    .regex(/[0-9]/, 'رمز عبور باید شامل اعداد باشد'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { token, newPassword } = validation.data;

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'لینک بازیابی منقضی شده یا نامعتبر است' }, { status: 400 });
    }

    const passwordHash = await hash(newPassword);

    // آپدیت رمز و پاک کردن توکن
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return NextResponse.json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}