import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// تابعی برای استخراج متن خالص از ساختار JSON
function extractTextFromNoteJson(note: any): string {
  let text = '';
  
  // ۱. اضافه کردن خلاصه
  if (note.summary) text += `خلاصه جلسه: ${note.summary}\n\n`;

  // ۲. اضافه کردن واژه‌های کلیدی
  if (note.keyTerms && note.keyTerms.length > 0) {
    text += 'واژه‌های کلیدی:\n';
    note.keyTerms.forEach((term: any) => {
      text += `- ${term.term}: ${term.definition}\n`;
    });
    text += '\n';
  }

  // ۳. استخراج متن بخش‌ها
  if (note.sections && note.sections.length > 0) {
    note.sections.forEach((section: any) => {
      text += `## ${section.heading}\n`;
      if (section.blocks) {
        section.blocks.forEach((block: any) => {
          if (block.type === 'paragraph' && block.content) {
            text += `${block.content}\n`;
          } else if (block.type === 'list' && block.items) {
            block.items.forEach((item: string) => { text += `- ${item}\n`; });
          } else if (block.type === 'equation' && block.content) {
            text += `فرمول: ${block.content}\n`;
          } else if (block.type === 'code' && block.content) {
            text += `کد:\n${block.content}\n`;
          }
        });
      }
      text += '\n';
    });
  }

  return text;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { noteId, question } = await req.json();

    if (!noteId || !question) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    // پیدا کردن جزوه و بررسی مالکیت
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true }
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جزوه یافت نشد' }, { status: 404 });
    }

    // استخراج متن از JSON (اگر JSON وجود نداشت، از متن ساده قدیمی استفاده می‌شود)
    let contextText = '';
    if (note.contentJson) {
      try {
        const parsedJson = JSON.parse(note.contentJson);
        contextText = extractTextFromNoteJson(parsedJson);
      } catch (e) {
        contextText = note.content; // اگر پارس نشد، به متن ساده برمی‌گردیم
      }
    } else {
      contextText = note.content;
    }

    // ارسال به هوش مصنوعی
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `تو یک دستیار هوشمند و بسیار دقیق برای دانشجویان هستی. 
          من متن یک جزوه دانشگاهی را به تو می‌دهم. تو باید به سوال کاربر "فقط و فقط" بر اساس اطلاعات همین جزوه پاسخ بدهی.
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

    const answer = response.choices[0].message.content;

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error('Chat Error:', error);
    return NextResponse.json({ error: 'خطا در پاسخگویی' }, { status: 500 });
  }
}