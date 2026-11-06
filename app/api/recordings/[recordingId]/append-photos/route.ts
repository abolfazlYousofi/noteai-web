import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

export async function POST(
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
    });

    if (!recording || recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جلسه یافت نشد' }, { status: 404 });
    }

    const formData = await req.formData();
    const photos = formData.getAll('photos') as File[];

    if (photos.length === 0) {
      return NextResponse.json({ error: 'هیچ عکسی ارسال نشد' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'private-uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const createdPhotos: { id: string; storageKey: string }[] = [];

    for (const photo of photos) {
      if (photo.size > MAX_PHOTO_SIZE) {
        return NextResponse.json(
          { error: `حجم عکس ${photo.name} بیش از ۱۰ مگابایت است` },
          { status: 413 }
        );
      }

      const buffer = Buffer.from(await photo.arrayBuffer());
      const filename = `photo-${randomUUID()}.jpg`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);

      const created = await prisma.photo.create({
        data: {
          recordingId: recording.id,
          storageKey: filename,
        },
      });

      createdPhotos.push({ id: created.id, storageKey: created.storageKey });
    }

    return NextResponse.json({
      success: true,
      addedCount: createdPhotos.length,
      photos: createdPhotos,
    });
  } catch (error) {
    console.error('Append Photos Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
