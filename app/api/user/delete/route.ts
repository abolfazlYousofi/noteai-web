import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // ۱. ابتدا لیست تمام فایل‌های فیزیکی کاربر را برای حذف پیدا می‌کنیم
    const recordings = await prisma.recording.findMany({
      where: { userId },
      include: { photos: true }
    });

    const filesToDelete: string[] = [];
    recordings.forEach(rec => {
      if (rec.storageKey) filesToDelete.push(rec.storageKey);
      rec.photos.forEach(photo => {
        if (photo.storageKey) filesToDelete.push(photo.storageKey);
      });
    });

    // ۲. حذف فایل‌های فیزیکی از هارد (در آینده این بخش با S3 جایگزین می‌شود)
    for (const fileKey of filesToDelete) {
      try {
        const filePath = path.join(process.cwd(), 'private-uploads', fileKey);
        await fs.unlink(filePath); // حذف فایل
      } catch (err) {
        // اگر فایل پیدا نشد، خطا نده و برو جلو
        console.warn(`File not found: ${fileKey}`);
      }
    }

    // ۳. حذف تمامی داده‌ها از دیتابیس به صورت اتمیک (Transaction)
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });
      await tx.transaction.deleteMany({ where: { userId } });
      
      const recordingIds = recordings.map(r => r.id);

      await tx.note.deleteMany({ where: { recordingId: { in: recordingIds } } });
      await tx.photo.deleteMany({ where: { recordingId: { in: recordingIds } } });
      await tx.transcriptSegment.deleteMany({ where: { recordingId: { in: recordingIds } } });
      await tx.processingJob.deleteMany({ where: { recordingId: { in: recordingIds } } });
      await tx.recording.deleteMany({ where: { userId } });

      // حذف نهایی کاربر
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true, message: 'حساب کاربری و تمام فایل‌های فیزیکی حذف شدند' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return NextResponse.json({ error: 'خطا در حذف حساب کاربری' }, { status: 500 });
  }
}