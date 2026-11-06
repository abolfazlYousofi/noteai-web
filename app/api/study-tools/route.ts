import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { StudyToolsSchema } from '@/lib/ai/study-tools-schema';
import { extractTextFromNote } from '@/lib/ai/extract-text';
import { checkRateLimit } from '@/lib/rate-limit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = checkRateLimit({ key: `study-tools:${session.user.id}`, limit: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'محدودیت تعداد درخواست. لطفاً بعداً امتحان کنید.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } }
      );
    }

    const { noteId } = await req.json();

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true },
    });

    if (!note || note.recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'جزوه یافت نشد' }, { status: 404 });
    }

    const noteText = extractTextFromNote(note);
    if (!noteText || noteText.length < 50) {
      return NextResponse.json({ error: 'محتوای جزوه برای تولید سوال کافی نیست' }, { status: 400 });
    }

    const systemPrompt = `
[نقش]
تو یک استاد دانشگاه و متخصص طراحی سوالات امتحانی هستی. یک جزوه به تو می‌دهم و وظیفه‌ات تولید ابزارهای مطالعه است.

[قوانین سخت‌گیرانه]
۱. هیچ سوالی از دانش عمومی خودت نپرس. همه سوالات باید از متن جزوه استخراج شوند.
۲. سوالات باید نکات کلیدی، تعاریف، فرمول‌ها و روابط مهم را پوشش دهند.
۳. گزینه‌های تستی باید منطقی و از یک سطح دشواری باشند. فقط یک پاسخ صحیح.
۴. همه چیز به فارسی (به جز اصطلاحات تخصصی انگلیسی که به همان شکل می‌مانند).

[الزامات]
- دقیقاً ۵ فلش‌کارت بساز (سوال کوتاه + پاسخ کوتاه).
- دقیقاً ۳ سوال چهارگزینه‌ای بساز (هر کدام ۴ گزینه).
- correctIndex باید عدد ۰ تا ۳ باشد (صفر = گزینه اول).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `متن جزوه:\n${noteText}` },
      ],
      response_format: zodResponseFormat(StudyToolsSchema, 'study_tools'),
      temperature: 0.4,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('پاسخ خالی از مدل');

    const parsed = StudyToolsSchema.parse(JSON.parse(content));

    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error('Study Tools Error:', error);
    return NextResponse.json({ error: 'خطا در تولید فلش‌کارت و آزمون' }, { status: 500 });
  }
}