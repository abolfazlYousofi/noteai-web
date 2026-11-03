import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    // ۱. بررسی احراز هویت
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ۲. دریافت فایل و اطلاعات از فرم
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const durationStr = formData.get('duration') as string;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const durationSeconds = parseInt(durationStr, 10) || 0;

    // ۳. ذخیره فایل صوتی در پوشه public/uploads (برای محیط لوکال)
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ساخت یک نام فایل یکتا
    const filename = `recording-${Date.now()}.webm`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // اطمینان از وجود پوشه
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const storageKey = `/uploads/${filename}`;

    // ۴. ایجاد رکورد در دیتابیس
    const recording = await prisma.recording.create({
      data: {
        userId: session.user.id,
        title: 'جلسه ضبط شده - ' + new Date().toLocaleDateString('fa-IR'),
        durationSeconds,
        storageKey,
        status: 'uploaded',
      },
    });

    // ۵. ایجاد جاب برای پردازش هوش مصنوعی
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