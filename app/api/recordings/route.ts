import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage';
import { randomUUID } from 'crypto';
import path from 'path';
//import { isProfileComplete } from '@/lib/auth/profile-check'; // 🆕 ایمپورت شد

export async function POST(req: Request) {
  try {
    // ۱. بررسی احراز هویت
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ۲. 🆕 بررسی تکمیل پروفایل
    /*if (!(await isProfileComplete(session.user.id))) {
      return NextResponse.json(
        { error: 'لطفاً ابتدا اطلاعات پروفایل خود را تکمیل کنید.', code: 'PROFILE_INCOMPLETE' }, 
        { status: 403 }
      );
    }*/

    // ۳. دریافت فایل‌ها
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const durationStr = formData.get('duration') as string;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // ۴. بررسی پلن و محدودیت حجم
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = subscription?.plan || 'FREE';

    const MAX_SIZES_MB: Record<string, number> = {
      FREE: 50,
      STUDENT: 250,
      PRO: 500,
    };
    const maxMB = MAX_SIZES_MB[plan] || 50;

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
    
    // ۵. ذخیره فایل صوتی با Provider
    const originalName = audioFile.name || 'audio.webm';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'webm';
    const safeExt = ['mp3', 'm4a', 'wav', 'ogg', 'webm'].includes(ext) ? ext : 'webm';
    
    const filename = `recording-${randomUUID()}.${safeExt}`;
    const storage = getStorageProvider();
    const storageKey = await storage.saveFile(buffer, filename);

    // ۶. ساخت رکورد در دیتابیس
    const recording = await prisma.recording.create({
      data: {
        userId: session.user.id,
        title: 'جلسه ضبط شده - ' + new Date().toLocaleDateString('fa-IR'),
        durationSeconds,
        storageKey,
        status: 'uploaded',
      },
    });

    // ۷. آپلود عکس‌ها
    const photos = formData.getAll('photos') as File[];
    const photoTimes = formData.getAll('photoTimes') as string[];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `حجم عکس ${photo.name} بیش از ۱۰ مگابایت است` }, { status: 413 });
      }

      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const photoName = `photo-${randomUUID()}.jpg`;
      
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

    // ۸. ساخت Job برای پردازش
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