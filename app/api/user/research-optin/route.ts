import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const schema = z.object({
  optIn: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'ورودی نامعتبر' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { researchOptIn: validation.data.optIn },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Research Opt-In Error:', error);
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
      select: { researchOptIn: true },
    });

    return NextResponse.json({ success: true, optIn: user?.researchOptIn ?? false });
  } catch (error) {
    console.error('Research Opt-In Get Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}