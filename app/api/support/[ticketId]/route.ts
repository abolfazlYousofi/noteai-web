import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const replySchema = z.object({ content: z.string().min(1) });

export async function GET(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticketId } = await params;
    const isAdmin = ['SUPER_ADMIN', 'SUPPORT_AGENT'].includes((session.user as any).role);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { messages: { orderBy: { createdAt: 'asc' } }, user: { select: { email: true } } },
    });

    if (!ticket) return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    if (!isAdmin && ticket.userId !== session.user.id) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

    // 🆕 وقتی کاربر یا ادمین صفحه را باز می‌کند، تیکت را «خوانده شده» علامت می‌زنیم
    if (isAdmin && !ticket.isReadByAdmin) {
      await prisma.ticket.update({ where: { id: ticketId }, data: { isReadByAdmin: true } });
    } else if (!isAdmin && !ticket.isReadByUser) {
      await prisma.ticket.update({ where: { id: ticketId }, data: { isReadByUser: true } });
    }

    return NextResponse.json({ success: true, ticket, isAdmin });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticketId } = await params;
    const body = await req.json();
    const validation = replySchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'متن نامعتبر' }, { status: 400 });

    const isAdmin = ['SUPER_ADMIN', 'SUPPORT_AGENT'].includes((session.user as any).role);
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    
    if (!ticket) return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });
    if (!isAdmin && ticket.userId !== session.user.id) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

    await prisma.ticketMessage.create({
      data: { ticketId, senderId: session.user.id, isAdmin, content: validation.data.content },
    });

    // 🆕 آپدیت وضعیت خوانده شدن بعد از ارسال پیام
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        status: isAdmin ? 'ANSWERED' : 'OPEN', 
        updatedAt: new Date(),
        isReadByUser: isAdmin ? false : true,  // اگر ادمین جواب داد، کاربر هنوز نخوانده
        isReadByAdmin: isAdmin ? true : false  // اگر کاربر جواب داد، ادمین هنوز نخوانده
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}