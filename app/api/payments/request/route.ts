import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// قیمت‌های ثابت در سرور (به تومان)
const PLAN_PRICES = {
  STUDENT: 200_000,
  PRO: 500_000,
} as const;

const requestSchema = z.object({
  plan: z.enum(['STUDENT', 'PRO']),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const callbackUrl = process.env.ZARINPAL_CALLBACK_URL;

    if (!merchantId || !callbackUrl) {
      return NextResponse.json({ error: 'تنظیمات درگاه پرداخت ناقص است' }, { status: 503 });
    }

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'پلن نامعتبر است' }, { status: 400 });
    }

    const { plan } = validation.data;
    const amount = PLAN_PRICES[plan];

    // ثبت تراکنش در دیتابیس
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount,
        plan,
        status: 'PENDING',
      },
    });

    // ارسال درخواست به زرین‌پال (Sandbox)
    try {
      const response = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/request.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: amount * 10, // تبدیل تومان به ریال
          description: `خرید پلن ${plan} در NoteAI`,
          callback_url: callbackUrl,
        }),
        signal: AbortSignal.timeout(10000), // تایم‌اوت ۱۰ ثانیه‌ای
      });

      const data = await response.json();

      if (data.data && data.data.code === 100) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { authority: data.data.authority },
        });
        
        return NextResponse.json({ 
          success: true, 
          paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}` 
        });
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        });
        return NextResponse.json({ error: 'خطا در اتصال به درگاه' }, { status: 502 });
      }
    } catch (err) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.json({ error: 'عدم ارتباط با درگاه پرداخت' }, { status: 503 });
    }
  } catch (error) {
    console.error('Payment Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}