import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, age: true, major: true, university: true, degree: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}

const profileSchema = z.object({
  name: z.string().min(1, 'نام و نام خانوادگی الزامی است'),
  age: z.number().nullable().optional(),
  major: z.string().min(1, 'رشته تحصیلی الزامی است'),
  university: z.string().min(1, 'دانشگاه الزامی است'),
  degree: z.enum(['BACHELOR', 'MASTER', 'PHD']).nullable().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    // 🆕 برای دیباگ: اگر باز هم خطا داد، این خط در ترمینال نشان می‌دهد چه چیزی ارسال شده
    console.log('PATCH Profile Body:', body);

    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validation.data.name,
        age: validation.data.age || null,
        major: validation.data.major,
        university: validation.data.university,
        degree: validation.data.degree || null,
      },
    });

    return NextResponse.json({ success: true, profile: updatedUser });
  } catch (error) {
    console.error('Profile PATCH Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}