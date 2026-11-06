import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().max(100).nullable().optional(),
  age: z.number().int().min(10).max(100).nullable().optional(),
  major: z.string().max(100).nullable().optional(),
  university: z.string().max(200).nullable().optional(),
  degree: z.enum(['BACHELOR', 'MASTER', 'PHD']).nullable().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'اطلاعات نامعتبر است', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name ?? undefined,
        age: data.age ?? undefined,
        major: data.major ?? undefined,
        university: data.university ?? undefined,
        degree: data.degree ?? undefined,
      },
      select: {
        name: true,
        age: true,
        major: true,
        university: true,
        degree: true,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        age: true,
        major: true,
        university: true,
        degree: true,
      },
    });

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error('Profile Get Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}