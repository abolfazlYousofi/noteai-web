import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function POST(req: Request) {
  try {
    // ۱. بررسی احراز هویت
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ۲. دریافت اطلاعات جلسه از درخواست
    const { recordingId } = await req.json();
    if (!recordingId) {
      return NextResponse.json({ error: 'شناسه جلسه ارسال نشده است.' }, { status: 400 });
    }

    const recording = await prisma.recording.findUnique({
      where: { id: recordingId }
    });

    if (!recording || recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جلسه یافت نشد یا دسترسی غیرمجاز است.' }, { status: 404 });
    }

    // جلوگیری از پردازش مجدد (صرفه‌جویی در هزینه API)
    if (recording.status === 'processed') {
      return NextResponse.json({ error: 'این جلسه قبلاً پردازش شده است.' }, { status: 400 });
    }

    // ۳. بررسی سهمیه کاربر
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = subscription?.plan || 'FREE';
    const maxMinutes = plan === 'PRO' ? 900 : plan === 'STUDENT' ? 300 : 15;

    const recordings = await prisma.recording.findMany({
      where: { userId: session.user.id },
      select: { durationSeconds: true }
    });
    const totalSecondsUsed = recordings.reduce((acc: number, rec: { durationSeconds: number | null }) => acc + (rec.durationSeconds || 0), 0);
        const minutesUsed = Math.ceil(totalSecondsUsed / 60);

    // اصلاح باگ: استفاده از > به جای >= تا کاربر بتواند دقیقاً تا سقف مجاز استفاده کند
    if (minutesUsed > maxMinutes) {
      return NextResponse.json({
        error: 'سهمیه شما به پایان رسیده است.',
        details: 'لطفاً برای ادامه استفاده، پلن خود را از صفحه قیمت‌گذاری ارتقا دهید.'
      }, { status: 403 });
    }

    // ۴. بررسی وجود فایل صوتی در سرور
    const filePath = path.join(process.cwd(), 'public', recording.storageKey);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'فایل صوتی در سرور یافت نشد.' }, { status: 404 });
    }

    // ۵. تبدیل صدا به متن با Whisper
    const fileBuffer = fs.readFileSync(filePath);
    const file = await toFile(fileBuffer, 'audio.webm', { type: 'audio/webm' });

    console.log('1. Transcribing audio...');
    const transcriptResponse = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    const rawText = transcriptResponse.text;
    if (!rawText || rawText.length < 5) {
      throw new Error('صدای واضحی تشخیص داده نشد. لطفاً با صدای بلندتر ضبط کنید.');
    }

    // ۶. تبدیل متن خام به جزوه ساختاریافته با LLM
    console.log('2. Generating structured notes with LLM...');
    
    const prompt = `
      تو یک دستیار جزوه‌نویسی حرفه‌ای برای دانشجویان فارسی‌زبان هستی.
      متن زیر، پیاده‌سازی شده یک کلاس دانشگاهی است. آن را به یک جزوه ساختاریافته و منظم تبدیل کن.

      قوانین:
      1. عنوان اصلی و سرفصل‌ها را مشخص کن.
      2. نکات مهم را به صورت لیست (Bullet points) بنویس.
      3. اصطلاحات تخصصی انگلیسی را به همان صورت انگلیسی حفظ کن.
      4. لحن باید علمی، روان و قابل فهم باشد.
      5. اگر مطلبی در متن نبود، از خودت چیزی اضافه نکن.

      متن کلاس:
      ${rawText}
    `;

    const llmResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const structuredNote = llmResponse.choices[0].message.content || rawText;

    // ۷. ذخیره خروجی در دیتابیس
    const note = await prisma.note.create({
      data: {
        recordingId: recording.id,
        title: 'جزوه جلسه ' + new Date(recording.createdAt).toLocaleDateString('fa-IR'),
        content: structuredNote,
        originalContent: structuredNote,
      },
    });

    // ۸. به‌روزرسانی وضعیت ضبط و جاب
    await prisma.recording.update({
      where: { id: recording.id },
      data: { status: 'processed' }
    });
    
    await prisma.processingJob.updateMany({
      where: { recordingId: recording.id },
      data: { status: 'completed' }
    });

    return NextResponse.json({ success: true, noteId: note.id });

  } catch (error: any) {
    console.error('=== AI ERROR LOG ===', error);
    return NextResponse.json({
      error: 'خطا در پردازش هوش مصنوعی',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}