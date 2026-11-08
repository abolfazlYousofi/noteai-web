import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const createSchema = z.object({
  subject: z.string().min(3, 'موضوع باید حداقل ۳ کاراکتر باشد'),
  message: z.string().min(10, 'متن پیام باید حداقل ۱۰ کاراکتر باشد'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}

// ... (کدهای بالای فایل)

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });

    const ticket = await prisma.ticket.create({
      data: {
        userId: session.user.id,
        subject: validation.data.subject,
        priority: validation.data.priority,
        messages: {
          create: {
            senderId: session.user.id,
            content: validation.data.message,
            isAdmin: false,
          },
        },
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error: any) { // 🆕 خطا را دقیق‌تر می‌گیریم
    console.error("🚨 Ticket Create Error:", error);
    return NextResponse.json(
      { error: error.message || 'خطای ناشناخته در دیتابیس' }, 
      { status: 500 }
    );
  }
}