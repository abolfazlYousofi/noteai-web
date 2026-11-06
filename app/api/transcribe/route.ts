import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { zodResponseFormat } from 'openai/helpers/zod';
import { NoteDocumentSchema } from '@/lib/ai/note-schema';
import { checkRateLimit } from '@/lib/rate-limit';
import { splitAudioIntoChunks, cleanupDirectory } from '@/lib/ai/audio-processor';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { recordingId, force } = await req.json();
    const rl = checkRateLimit({ key: `transcribe:${session.user.id}`, limit: 5, windowMs: 60 * 60 * 1000 });
if (!rl.allowed) {
  return NextResponse.json(
    { error: 'محدودیت تعداد درخواست پردازش. لطفاً بعداً امتحان کنید.' },
    { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } }
  );
}
    const recording = await prisma.recording.findUnique({ 
      where: { id: recordingId },
      include: { photos: true, notes: true }
    });

    if (!recording || recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جلسه یافت نشد' }, { status: 404 });
    }

    if (recording.status === 'processed' && !force) {
      return NextResponse.json({ error: 'این جلسه قبلاً پردازش شده است.' }, { status: 400 });
    }
    if (!force) {
    // ۱. بررسی سهمیه
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const plan = subscription?.plan || 'FREE';
    const maxMinutes = plan === 'PRO' ? 900 : plan === 'STUDENT' ? 300 : 15;

    // فقط Recordingهای ماه جاری، بدون احتساب Recording فعلی
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const priorRecordings = await prisma.recording.findMany({
      where: {
        userId: session.user.id,
        id: { not: recording.id },
        createdAt: { gte: startOfMonth },
      },
      select: { durationSeconds: true },
    });
    const totalSecondsUsed = priorRecordings.reduce((acc: number, rec: { durationSeconds: number | null }) => acc + (rec.durationSeconds || 0), 0);
    const currentSeconds = recording.durationSeconds || 0;
    const minutesUsed = Math.ceil((totalSecondsUsed + currentSeconds) / 60);

    if (minutesUsed > maxMinutes) {
      return NextResponse.json({ error: 'سهمیه شما به پایان رسیده است. لطفاً پلن خود را ارتقا دهید.' }, { status: 403 });
    }
  }

    // ۲. تبدیل صدا به متن (Whisper)
    const filePath = path.join(process.cwd(), 'private-uploads', recording.storageKey);
    if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'فایل صوتی یافت نشد.' }, { status: 404 });

            const fileBuffer = fs.readFileSync(filePath);
    const MAX_WHISPER_SIZE = 20 * 1024 * 1024;
    const whisperPrompt = 'این یک جلسه دانشگاهی به زبان فارسی است. اصطلاحات تخصصی ممکن است به انگلیسی بیان شوند و باید به همان شکل انگلیسی حفظ شوند.';

    let rawText = '';
    const allSegments: { start: number; end: number; text: string }[] = [];

    if (fileBuffer.length > MAX_WHISPER_SIZE) {
      const sizeMB = Math.round(fileBuffer.length / 1024 / 1024);
      console.log(`1. File is ${sizeMB}MB (> 20MB), splitting into chunks...`);

      const chunksDir = path.join(process.cwd(), 'temp-chunks', recording.id);

      try {
        const chunks = await splitAudioIntoChunks(filePath, chunksDir);
        console.log(`2. Split into ${chunks.length} chunks. Transcribing...`);

        const texts: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          console.log(`   Chunk ${i + 1}/${chunks.length}...`);
          const chunkBuffer = fs.readFileSync(chunks[i]);
          const chunkFile = await toFile(chunkBuffer, `chunk-${i}.mp3`, { type: 'audio/mpeg' });

          const chunkResponse = await openai.audio.transcriptions.create({
            file: chunkFile,
            model: 'whisper-1',
            prompt: whisperPrompt,
            response_format: 'verbose_json',
          });

          texts.push(chunkResponse.text.trim());

          // Timestamp offset: each chunk starts at i * 600 seconds
          const chunkOffset = i * 600;
          if (chunkResponse.segments) {
            for (const seg of chunkResponse.segments) {
              allSegments.push({
                start: seg.start + chunkOffset,
                end: seg.end + chunkOffset,
                text: seg.text.trim(),
              });
            }
          }
        }

        rawText = texts.join(' ');
      } finally {
        cleanupDirectory(chunksDir);
      }
    } else {
      console.log('1. Transcribing audio (single file)...');
      const file = await toFile(fileBuffer, 'audio.webm', { type: 'audio/webm' });

      const transcriptResponse = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        prompt: whisperPrompt,
        response_format: 'verbose_json',
      });

      rawText = transcriptResponse.text;

      if (transcriptResponse.segments) {
        for (const seg of transcriptResponse.segments) {
          allSegments.push({
            start: seg.start,
            end: seg.end,
            text: seg.text.trim(),
          });
        }
      }
    }

    if (!rawText || rawText.length < 5) throw new Error('صدای واضحی تشخیص داده نشد.');

    // Save transcript segments to DB (overwrite on re-process)
    if (allSegments.length > 0) {
      await prisma.transcriptSegment.deleteMany({ where: { recordingId: recording.id } });
      await prisma.transcriptSegment.createMany({
        data: allSegments.map((s) => ({
          recordingId: recording.id,
          startTime: s.start,
          endTime: s.end,
          text: s.text,
        })),
      });
      console.log(`3. Saved ${allSegments.length} transcript segments`);
    }

    // Build timestamped text for LLM
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const timestampedText =
      allSegments.length > 0
        ? allSegments.map((s) => `[${formatTime(s.start)}] ${s.text}`).join('\n')
        : rawText;

    // ۳. آماده‌سازی عکس‌ها برای ارسال به مدل Vision
    console.log('2. Preparing photos for Vision AI...');
    const imageContents: any[] = [];
    
    for (const photo of recording.photos) {
      const imgPath = path.join(process.cwd(), 'private-uploads', photo.storageKey);
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        const base64Image = imgBuffer.toString('base64');
        const ext = path.extname(imgPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        
        imageContents.push({
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}` }
        });
      }
    }

    // ۴. تولید جزوه با LLM (با ساختار Zod)
    console.log('3. Generating structured notes with text and images...');
    
        const systemPrompt = `
[نقش]
تو یک دستیار آموزشی حرفه‌ای برای دانشجویان فارسی‌زبان هستی. وظیفه‌ات تبدیل متن خام پیاده‌شده از صدای کلاس + تصاویر تخته/اسلاید، به یک "جزوه دانشگاهی ساختاریافته، دقیق و قابل مطالعه" است.

[قانون طلایی — صداقت علمی]
تو فقط می‌توانی چیزی بنویسی که در متن صوتی یا تصاویر وجود دارد.
- اگر مطلبی در منابع نبود، حتی اگر درست باشد، اضافه نکن.
- اگر بخشی از صوت نامفهوم بود، حدس نزن؛ آن را در uncertainties بنویس.
- اگر تصویر و صوت با هم تناقض داشتند، هر دو را با ذکر منبع بنویس و در uncertainties توضیح بده.
- حق نداری از دانش عمومی خودت استفاده کنی. اگر استاد اشاره نکرد، تو هم اشاره نکن.

[ساختار خروجی]
- title: عنوان کوتاه و دقیق (۵-۸ کلمه) — از موضوع اصلی جلسه، نه جمله اول استاد.
- summary: خلاصه ۲-۴ جمله‌ای از کل جلسه — فقط نکات کلیدی، نه تکرار متن.
- keyTerms: ۵-۱۵ اصطلاح کلیدی جلسه با تعریف ۱ جمله‌ای (از خود متن، نه دانش عمومی).
- sections: بخش‌بندی منطقی بر اساس تغییر موضوع. هر بخش یک heading کوتاه دارد.
- uncertainties: فهرست موارد نامفهوم، متناقض، یا مشکوک.

[قواعد بلوک‌ها]
- paragraph: توضیح پیوسته (۱-۳ جمله). برای توصیف مفهوم، زمینه، یا استدلال.
- equation: فرمول ریاضی به LaTeX. فقط فرمول‌هایی که در تصویر دیده یا در صوت صریح گفته شده. هیچ فرمولی اختراع نکن.
- list: فهرست نکات هم‌سطح (بدون ترتیب منطقی). برای مراحل الگوریتم یا ویژگی‌های یک مفهوم از list استفاده کن (چون ترتیب دارد).
- code: کد برنامه‌نویسی با language مشخص.
- heading: زیرعنوان درون یک بخش (به‌ندرت — فقط اگر بخش خیلی بزرگ شد).


[قواعد sourceRefs]
برای هر بلوک paragraph یا equation، حتماً یک sourceRef از نوع audio با timestampStart و timestampEnd اضافه کن.
- timestampStart: ثانیه شروع گفتار مربوطه (عدد صحیح، نه رشته)
- timestampEnd: ثانیه پایان گفتار (عدد صحیح)
- imageId: اگر آن بلوک از تصویر استخراج شده، storageKey عکس را بنویس؛ وگرنه null
- type: همیشه 'audio'

این اعداد را از تایم‌استمپ‌های داخل متن صوتی بردار. اگر بلوکی از چند جمله می‌آید، بازه را از اولین تا آخرین جمله در نظر بگیر.

مثال:
{
  "type": "paragraph",
  "content": "یونیزاسیون فرآیندی است که...",
  "items": null,
  "language": null,
  "sourceRefs": [{ "type": "audio", "timestampStart": 45, "timestampEnd": 92, "imageId": null }]
}

[قواعد فارسی و اصطلاحات]
- اصطلاحات تخصصی انگلیسی را به انگلیسی بنویس (نه ترجمه، نه فینگلیش): Thread, API, Kernel, Array, Pointer, Mutex, ...
- اگر استاد معادل فارسی + انگلیسی گفت، هر دو را در پرانتز بنویس: «نخ (Thread)»
- اصطلاحات فارسی رایج را ترجمه نکن: «حافظه پویا» نه «Dynamic Memory».
- اعداد و علائم ریاضی را با فرمت اصلی بنویس (نه فارسی، نه عربی).

[قواعد حذف]
این موارد را حذف کن:
- سلام و احوال‌پرسی ابتدای کلاس
- سوالات پراکنده دانشجویان (مگر اینکه استاد پاسخ مهمی داده باشد — در آن صورت فقط پاسخ را بیاور)
- خنده، مکث، «خب»، «آها»، «ببینید»
- تکرارهای بی‌فایده («همونطور که گفتم...»، «قبلاً گفتیم...»)
- ارجاعات شخصی به افراد حاضر («آقای فلانی، شما یادت هست؟»)

[قواعد حفظ]
این موارد را حفظ کن:
- نکته‌ای که استاد با تأکید گفت («این خیلی مهمه»، «حتماً یادتون باشه»)
- مثال‌هایی که استاد برای روشن شدن مفهوم آورد
- هشدارها («اینو با اون اشتباه نگیرید»)
- ارجاعات استاد به امتحان یا تکلیف
- تعاریف صریح («به این می‌گیم...»)

[فرمت LaTeX]
- فقط برای equation استفاده کن.
- فرمول‌های ساده درون متن را با $...$ بنویس (اگر لازم بود).
- فرمول کامل بلوک را بدون $ بنویس (BlockMath خودش اضافه می‌کند).
- نمادهای استاندارد: \\int, \\sum, \\frac, \\partial, \\nabla, \\alpha, \\beta, \\lambda, ...

[زبان uncertainty]
هر مورد در uncertainties باید یکی از این‌ها باشد:
- «در دقیقه X، بخشی از گفتار نامفهوم بود: [توضیح کوتاه]»
- «در تصویر Y، فرمول ناخوانا بود»
- «بین گفتار و تصویر تناقض وجود دارد: [توضیح]»
- «مفهوم Z بدون تعریف کافی بیان شد»
`;

    const userContent: any[] = [
      { 
        type: 'text', 
        text: `این متن پیاده‌شده صدای کلاس است (هر خط با [دقیقه:ثانیه] شروع می‌شود). لطفاً با توجه به تصاویر ارسال شده، جزوه را طبق دستورالعمل تولید کن. برای هر بلوک paragraph یا equation، حتماً در sourceRefs زمان شروع و پایان گفتار مربوطه را ذکر کن:\n\n${timestampedText}`       },
      ...imageContents
    ];

    // ۵. فراخوانی مدل با اجبار به خروجی JSON (Zod Structured Outputs)
    const llmResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: zodResponseFormat(NoteDocumentSchema, 'note_document'), 
      temperature: 0.2,
    });

    const structuredNoteJson = llmResponse.choices[0].message.content;

    // ۶. ذخیره در دیتابیس (هم فیلد متنی و هم فیلد JSON)
    const note = await prisma.$transaction(async (tx) => {
  const existingNote = await tx.note.findUnique({ where: { recordingId: recording.id } });
  const noteData = {
    title: 'جزوه جلسه ' + new Date(recording.createdAt).toLocaleDateString('fa-IR'),
    content: structuredNoteJson || '',
    originalContent: structuredNoteJson || '',
    contentJson: structuredNoteJson,
    schemaVersion: '1.0.0',
  };

  const result = existingNote
    ? await tx.note.update({
        where: { id: existingNote.id },
        data: { ...noteData, version: { increment: 1 } },
      })
    : await tx.note.create({
        data: { recordingId: recording.id, ...noteData },
      });

  await tx.recording.update({ where: { id: recording.id }, data: { status: 'processed' } });
  await tx.processingJob.updateMany({ where: { recordingId: recording.id }, data: { status: 'completed' } });

  return result;
});
    return NextResponse.json({ success: true, noteId: note.id });

  } catch (error: any) {
    console.error('=== AI ERROR LOG ===', error);
    return NextResponse.json({ error: 'خطا در پردازش هوش مصنوعی', errorId: Date.now().toString(36) }, { status: 500 });
  }
}