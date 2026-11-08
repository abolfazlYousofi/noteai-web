import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage';
import { randomUUID } from 'crypto';
import path from 'path';

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

    // 🆕 دریافت پلن کاربر برای تعیین محدودیت حجم (استراتژی Upselling)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = subscription?.plan || 'FREE';

    // تعریف محدودیت حجم به مگابایت برای هر پلن
    const MAX_SIZES_MB: Record<string, number> = {
      FREE: 50,      // پلن رایگان: ۵۰ مگابایت (حدود ۱۵ دقیقه)
      STUDENT: 250,  // پلن دانشجویی: ۲۵۰ مگابایت (حدود ۳۰۰ دقیقه)
      PRO: 500,      // پلن حرفه‌ای: ۵۰۰ مگابایت (حدود ۹۰۰ دقیقه)
    };

    const maxMB = MAX_SIZES_MB[plan] || 50;

    // 🛡️ اصل Fail-Safe Defaults (محدودیت حجم صدا)
    if (audioFile.size > maxMB * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: `حجم فایل صوتی شما بیش از ${maxMB} مگابایت مجاز پلن (${plan}) است. برای آپلود فایل‌های بزرگ‌تر، لطفاً پلن خود را ارتقا دهید.`,
          code: 'FILE_TOO_LARGE' 
        }, 
        { status: 413 }
      );
    }

    const durationSeconds = parseInt(durationStr, 10) || 0;
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // اصل Least Astonishment: حفظ پسوند واقعی فایل کاربر
    const originalName = audioFile.name || 'audio.webm';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'webm';
    const safeExt = ['mp3', 'm4a', 'wav', 'ogg', 'webm'].includes(ext) ? ext : 'webm';
    
    const filename = `recording-${randomUUID()}.${safeExt}`;
    
    // 🆕 استفاده از Storage Provider (لایه واسط)
    const storage = getStorageProvider();
    const storageKey = await storage.saveFile(buffer, filename);

    const recording = await prisma.recording.create({
      data: {
        userId: session.user.id,
        title: 'جلسه ضبط شده - ' + new Date().toLocaleDateString('fa-IR'),
        durationSeconds,
        storageKey,
        status: 'uploaded',
      },
    });

    // 📸 آپلود عکس‌ها و زمان‌های مربوطه
    const photos = formData.getAll('photos') as File[];
    const photoTimes = formData.getAll('photoTimes') as string[];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `حجم عکس ${photo.name} بیش از ۱۰ مگابایت است` }, { status: 413 });
      }

      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const photoName = `photo-${randomUUID()}.jpg`;
      
      // 🆕 ذخیره عکس با Provider
      await storage.saveFile(photoBuffer, photoName);
      
      const capturedAtSeconds = parseFloat(photoTimes[i]) || null;

      await prisma.photo.create({
        data: {
          recordingId: recording.id,
          storageKey: photoName,
          capturedAtSeconds: capturedAtSeconds,
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