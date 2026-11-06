import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordingId } = await params;

    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: { photos: true },
    });

    if (!recording || recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جلسه یافت نشد' }, { status: 404 });
    }

    const filesToDelete = [
      recording.storageKey,
      ...recording.photos.map((p) => p.storageKey),
    ];

    for (const key of filesToDelete) {
      if (!key) continue;
      try {
        await fs.unlink(path.join(process.cwd(), 'private-uploads', key));
      } catch {
        console.warn(`File not found (skipping): ${key}`);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.note.deleteMany({ where: { recordingId } });
      await tx.photo.deleteMany({ where: { recordingId } });
      await tx.transcriptSegment.deleteMany({ where: { recordingId } });
      await tx.processingJob.deleteMany({ where: { recordingId } });
      await tx.recording.delete({ where: { id: recordingId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Recording Error:', error);
    return NextResponse.json({ error: 'خطا در حذف جلسه' }, { status: 500 });
  }
}