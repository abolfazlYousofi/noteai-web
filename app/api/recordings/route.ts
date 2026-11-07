import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const durationStr = formData.get('duration') as string;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const durationSeconds = parseInt(durationStr, 10) || 0;

        const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // اصل Least Astonishment: حفظ پسوند واقعی فایل کاربر
    const originalName = audioFile.name || 'audio.webm';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'webm';
    const safeExt = ['mp3', 'm4a', 'wav', 'ogg', 'webm'].includes(ext) ? ext : 'webm';
    
    const filename = `recording-${randomUUID()}.${safeExt}`;
    
    // تغییر مسیر به پوشه خصوصی (خارج از public)
    const uploadDir = path.join(process.cwd(), 'private-uploads');
    
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // ذخیره فقط نام فایل در دیتابیس (نه مسیر کامل)
    const storageKey = filename;

    const recording = await prisma.recording.create({
      data: {
        userId: session.user.id,
        title: 'جلسه ضبط شده - ' + new Date().toLocaleDateString('fa-IR'),
        durationSeconds,
        storageKey,
        status: 'uploaded',
      },
    });

    // آپلود عکس‌ها (در صورت وجود)
    const photos = formData.getAll('photos') as File[];
    for (const photo of photos) {
      const photoBytes = await photo.arrayBuffer();
      const photoBuffer = Buffer.from(photoBytes);
      const photoName = `photo-${Date.now()}-${Math.random()}.jpg`;
      const photoPath = path.join(uploadDir, photoName);
      await fs.writeFile(photoPath, photoBuffer);

      await prisma.photo.create({
        data: {
          recordingId: recording.id,
          storageKey: photoName, // فقط نام فایل
        }
      });
    }

    await prisma.processingJob.create({
      data: {
        recordingId: recording.id,
        jobType: 'TRANSCRIPTION',
        status: 'queued',
      },
    });

    return NextResponse.json({ success: true, recordingId: recording.id });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}