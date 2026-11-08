import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import OpenAI from 'openai';
import { extractTextFromNoteJson } from '@/lib/ai/extract-text';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// 🆕 دریافت تاریخچه پیام‌ها
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 });

    // بررسی مالکیت
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true }
    });
    if (!note || note.recording.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const messages = await prisma.chatMessage.findMany({
      where: { noteId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ارسال پیام جدید
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { noteId, question } = await req.json();

    if (!noteId || !question) return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });

    // پیدا کردن جزوه و بررسی مالکیت
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true }
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جزوه یافت نشد' }, { status: 404 });
    }

    let contextText = '';
    if (note.contentJson) {
      try {
        const parsedJson = JSON.parse(note.contentJson);
        contextText = extractTextFromNoteJson(parsedJson);
      } catch (e) {
        contextText = note.content;
      }
    } else {
      contextText = note.content;
    }

    // ۱. ذخیره سوال کاربر در دیتابیس
    await prisma.chatMessage.create({
      data: { noteId, role: 'user', content: question }
    });

    // ۲. گرفتن پاسخ از هوش مصنوعی
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `تو یک دستیار هوشمند و بسیار دقیق برای دانشجویان هستی. 
          من متن یک جزوه دانشگاهی را به تو می‌دهم. تو باید به سوال کاربر "فقط و فقط" بر اساس اطلاعات همین جزوه پاسخ دهی.
          اگر پاسخ سوال در متن جزوه وجود نداشت، صادقانه بگو: "متأسفانه در این جزوه به این موضوع اشاره نشده است."
          هرگز از خودت چیزی اضافه نکن.`
        },
        {
          role: 'user',
          content: `متن جزوه:\n${contextText}\n\nسوال من: ${question}`
        }
      ],
      temperature: 0.2,
    });

    const answer = response.choices[0].message.content || 'خطا در پاسخ‌دهی';

    // ۳. ذخیره پاسخ هوش مصنوعی در دیتابیس
    const aiMessage = await prisma.chatMessage.create({
      data: { noteId, role: 'ai', content: answer }
    });

    return NextResponse.json({ success: true, answer, messageId: aiMessage.id });
  } catch (error) {
    console.error('Chat Error:', error);
    return NextResponse.json({ error: 'خطا در پاسخگویی' }, { status: 500 });
  }
}