import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { randomUUID } from 'crypto';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true },
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جزوه یافت نشد' }, { status: 404 });
    }

    let shareToken = note.shareToken;
    if (!shareToken) {
      shareToken = randomUUID();
      await prisma.note.update({
        where: { id: noteId },
        data: { shareToken },
      });
    }

    return NextResponse.json({ success: true, shareToken });
  } catch (error) {
    console.error('Share Note Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId } = await params;

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true },
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جزوه یافت نشد' }, { status: 404 });
    }

    await prisma.note.update({
      where: { id: noteId },
      data: { shareToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke Share Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}