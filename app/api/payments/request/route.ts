import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, amount } = await req.json();

    // ۱. ثبت تراکنش در دیتابیس
    const transaction = await (prisma as any).transaction.create({
      data: {
        userId: session.user.id,
        amount,
        plan,
        status: 'PENDING',
      },
    });

    // ۲. ارسال درخواست به زرین‌پال با مدیریت خطای شبکه
    let data;
    try {
      const response = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/request.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          merchant_id: process.env.ZARINPAL_MERCHANT_ID,
          amount: amount * 10,
          description: `خرید پلن ${plan} در NoteAI`,
          callback_url: process.env.ZARINPAL_CALLBACK_URL,
        }),
        // تنظیم تایم‌اوت برای جلوگیری از گیر کردن بی‌نهایت
        signal: AbortSignal.timeout(10000) 
      });
      data = await response.json();
    } catch (networkError) {
      console.error('Network Error connecting to Zarinpal:', networkError);
      // آپدیت تراکنش به وضعیت خطا
      await (prisma as any).transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.json({ error: 'عدم ارتباط با درگاه پرداخت. لطفاً VPN خود را خاموش کنید و دوباره تلاش کنید.' }, { status: 503 });
    }

    if (data.data && data.data.code === 100) {
      await (prisma as any).transaction.update({
        where: { id: transaction.id },
        data: { authority: data.data.authority },
      });

      return NextResponse.json({ 
        success: true, 
        paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}` 
      });
    } else {
      return NextResponse.json({ error: 'خطا در اتصال به درگاه پرداخت' }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}