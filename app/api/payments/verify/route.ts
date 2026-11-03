import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');

    if (status !== 'OK' || !authority) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?status=failed`);
    }

    // پیدا کردن تراکنش
    const transaction = await prisma.transaction.findFirst({
      where: { authority },
    });

    if (!transaction) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?status=notfound`);
    }

    // ارسال درخواست Verify به زرین‌پال
    const response = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: transaction.amount * 10, // مبلغ به ریال
        authority: authority,
      }),
    });

    const data = await response.json();

    if (data.data && data.data.code === 100) {
      // ۱. آپدیت تراکنش به موفق
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'SUCCESS', refId: data.data.ref_id.toString() },
      });

      // ۲. ارتقای پلن کاربر
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // ۳۰ روز اعتبار

      await prisma.subscription.upsert({
        where: { userId: transaction.userId },
        update: { plan: transaction.plan, expiresAt },
        create: { userId: transaction.userId, plan: transaction.plan, expiresAt },
      });

      // ۳. هدایت کاربر به صفحه اشتراک با پیام موفقیت
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?status=success`);
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?status=failed`);
    }
  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?status=error`);
  }
}