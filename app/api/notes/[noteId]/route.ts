import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const updateSchema = z.object({
  contentJson: z.string(), // دریافت ساختار JSON به صورت رشته
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'اطلاعات نامعتبر است' }, { status: 400 });
    }

    const { contentJson } = validation.data;

    // بررسی مالکیت
    const note = await prisma.note.findUnique({
      where: { id: resolvedParams.noteId },
      include: { recording: true },
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 404 });
    }

    // آپدیت جزوه
    const updatedNote = await prisma.note.update({
      where: { id: resolvedParams.noteId },
      data: { 
        contentJson: contentJson,
        content: contentJson, // برای سازگاری، متن ساده را هم آپدیت می‌کنیم
        version: { increment: 1 } 
      },
    });

    return NextResponse.json({ success: true, version: updatedNote.version });
  } catch (error) {
    console.error('Update Note Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}