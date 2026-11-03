import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: 'متن خالی است' }, { status: 400 });

    const note = await prisma.note.findUnique({
      where: { id: resolvedParams.noteId },
      include: { recording: true },
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 404 });
    }

    // آپدیت متن، اما originalContent دست نخورده باقی می‌ماند
    const updatedNote = await prisma.note.update({
      where: { id: resolvedParams.noteId },
      data: { 
        content, // متن جدید (ویرایش شده)
        version: { increment: 1 } 
      },
    });

    // در آینده اینجا می‌توانیم منطقی بنویسیم که اختلاف بین content و originalContent را استخراج کند
    // و به عنوان داده آموزشی (Fine-tuning dataset) ذخیره کند.

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (error) {
    console.error('Update Note Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}