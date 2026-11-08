import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { NoteDocumentSchema } from '@/lib/ai/note-schema';
import { checkRateLimit } from '@/lib/rate-limit';
import { splitAudioIntoChunks, cleanupDirectory } from '@/lib/ai/audio-processor';
import { getAIProvider } from '@/lib/ai/provider-factory';

// کلاینت OpenAI فقط برای تولید جزوه (متن)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = checkRateLimit({ key: `transcribe:${session.user.id}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'محدودیت تعداد درخواست پردازش. لطفاً بعداً امتحان کنید.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    const { recordingId, force, customPrompt } = await req.json();
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
      const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
      const plan = subscription?.plan || 'FREE';
      const maxMinutes = plan === 'PRO' ? 900 : plan === 'STUDENT' ? 300 : 15;

      const priorRecordings = await prisma.recording.findMany({
        where: { userId: session.user.id, id: { not: recording.id }, createdAt: { gte: new Date(new Date().setDate(1)) } },
        select: { durationSeconds: true }
      });
      const totalSecondsUsed = priorRecordings.reduce((acc, rec) => acc + (rec.durationSeconds || 0), 0);
      const minutesUsed = Math.ceil((totalSecondsUsed + (recording.durationSeconds || 0)) / 60);

      if (minutesUsed > maxMinutes) {
        return NextResponse.json({ error: 'سهمیه شما به پایان رسیده است. لطفاً پلن خود را ارتقا دهید.' }, { status: 403 });
      }
    }

    const filePath = path.join(process.cwd(), 'private-uploads', recording.storageKey);
    if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'فایل صوتی یافت نشد.' }, { status: 404 });

    const fileBuffer = fs.readFileSync(filePath);
    const MAX_WHISPER_SIZE = 20 * 1024 * 1024;
    const whisperPrompt = 'این یک جلسه دانشگاهی به زبان فارسی است. اصطلاحات تخصصی ممکن است به انگلیسی بیان شوند و باید به همان شکل انگلیسی حفظ شوند.';

    let rawText = '';
    const allSegments: { start: number; end: number; text: string }[] = [];
    
    // 🆕 استفاده از لایه واسط (OpenAI یا Hugging Face)
    const aiProvider = getAIProvider();

    if (fileBuffer.length > MAX_WHISPER_SIZE) {
      console.log(`1. File is ${Math.round(fileBuffer.length / 1024 / 1024)}MB (> 20MB), splitting...`);
      const chunksDir = path.join(process.cwd(), 'temp-chunks', recording.id);

      try {
        const chunks = await splitAudioIntoChunks(filePath, chunksDir);
        console.log(`2. Split into ${chunks.length} chunks. Transcribing...`);

        const texts: string[] = [];
        for (let i = 0; i < chunks.length; i++) {
          console.log(`   Chunk ${i + 1}/${chunks.length}...`);
          const chunkBuffer = fs.readFileSync(chunks[i]);
          
          // 🆕 فراخوانی از طریق Provider
          const result = await aiProvider.transcribe({ 
            file: chunkBuffer, 
            filename: `chunk-${i}.mp3`, 
            prompt: whisperPrompt, 
            responseFormat: 'verbose_json',
            language: 'fa'
          });

          texts.push(result.text.trim());
          const chunkOffset = i * 600;
          if (result.segments) {
            result.segments.forEach(seg => allSegments.push({ start: seg.start + chunkOffset, end: seg.end + chunkOffset, text: seg.text.trim() }));
          }
        }
        rawText = texts.join(' ');
      } finally {
        cleanupDirectory(chunksDir);
      }
    } else {
      console.log('1. Transcribing audio (single file)...');
      // 🆕 فراخوانی از طریق Provider
      const result = await aiProvider.transcribe({ 
        file: fileBuffer, 
        filename: 'audio.webm', 
        prompt: whisperPrompt, 
        responseFormat: 'verbose_json',
        language: 'fa'
      });

      rawText = result.text;
      if (result.segments) {
        result.segments.forEach(seg => allSegments.push({ start: seg.start, end: seg.end, text: seg.text.trim() }));
      }
    }

    if (!rawText || rawText.length < 5) throw new Error('صدای واضحی تشخیص داده نشد.');

    if (allSegments.length > 0) {
      await prisma.transcriptSegment.deleteMany({ where: { recordingId: recording.id } });
      await prisma.transcriptSegment.createMany({
        data: allSegments.map((s) => ({ recordingId: recording.id, startTime: s.start, endTime: s.end, text: s.text })),
      });
    }

    const formatTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
    const timestampedText = allSegments.length > 0 ? allSegments.map((s) => `[${formatTime(s.start)}] ${s.text}`).join('\n') : rawText;

    console.log('2. Preparing photos for Vision AI...');
    const imageContents: any[] = [];
    for (const photo of recording.photos) {
      const imgPath = path.join(process.cwd(), 'private-uploads', photo.storageKey);
      if (fs.existsSync(imgPath)) {
        const imgBuffer = fs.readFileSync(imgPath);
        const base64Image = imgBuffer.toString('base64');
        const ext = path.extname(imgPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        imageContents.push({ type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } });
      }
    }

    console.log('3. Generating structured notes with LLM...');
    const systemPrompt = `
[نقش]
تو یک دستیار آموزشی حرفه‌ای برای دانشجویان فارسی‌زبان هستی...

[قانون طلایی — صداقت علمی]
تو فقط می‌توانی چیزی بنویسی که در متن صوتی یا تصاویر وجود دارد...

[قواعد sourceRefs]
برای هر بلوک paragraph یا equation، حتماً یک sourceRef از نوع audio با timestampStart و timestampEnd اضافه کن...

[دستورالعمل‌های ویژه کاربر]
${customPrompt ? `کاربر از تو خواسته است: "${customPrompt}". حتماً در نظر بگیر.` : 'دستور خاصی ندارد.'}
`;

    const userContent: any[] = [
      { type: 'text', text: `این متن پیاده‌شده صدای کلاس است. جزوه را طبق دستورالعمل تولید کن:\n\n${timestampedText}` },
      ...imageContents
    ];

    // تولید جزوه (همچنان با OpenAI)
    const llmResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
      response_format: zodResponseFormat(NoteDocumentSchema, 'note_document'), 
      temperature: 0.2,
    });

    const structuredNoteJson = llmResponse.choices[0].message.content;

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
        ? await tx.note.update({ where: { id: existingNote.id }, data: { ...noteData, version: { increment: 1 } } })
        : await tx.note.create({ data: { recordingId: recording.id, ...noteData } });

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