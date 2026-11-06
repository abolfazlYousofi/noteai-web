import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { verify, hash } from '@node-rs/argon2';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = passwordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    const isValid = await verify(user.passwordHash, currentPassword);
    if (!isValid) {
      return NextResponse.json({ error: 'رمز عبور فعلی اشتباه است' }, { status: 400 });
    }

    const newHash = await hash(newPassword);

    // آپدیت رمز عبور
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // نکته امنیتی: در NextAuth با استراتژی JWT، برای ابطال کامل نشست، 
    // کلاینت باید SignOut شود (که در UI انجام می‌دهیم).
    return NextResponse.json({ 
      success: true, 
      message: 'رمز عبور تغییر کرد. لطفاً دوباره وارد شوید.',
      forceLogout: true 
    });
  } catch (error) {
    console.error('Password Change Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}