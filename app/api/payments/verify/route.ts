import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (status !== 'OK' || !authority) {
      return NextResponse.redirect(`${siteUrl}/dashboard/billing?status=failed`);
    }

    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchantId) return NextResponse.redirect(`${siteUrl}/dashboard/billing?status=error`);

    // پیدا کردن تراکنش (فقط اگر در وضعیت PENDING باشد)
    const transaction = await prisma.transaction.findFirst({
      where: { authority, status: 'PENDING' },
    });

    if (!transaction) {
      return NextResponse.redirect(`${siteUrl}/dashboard/billing?status=notfound`);
    }

    // ارسال درخواست Verify به زرین‌پال
    const response = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: transaction.amount * 10,
        authority: authority,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (data.data && data.data.code === 100) {
      // عملیات اتمیک: آپدیت تراکنش و ارتقای اشتراک با هم
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS', refId: data.data.ref_id.toString() },
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // ۳۰ روز اعتبار

        await tx.subscription.upsert({
          where: { userId: transaction.userId },
          update: { plan: transaction.plan, expiresAt },
          create: { userId: transaction.userId, plan: transaction.plan, expiresAt },
        });
      });

      return NextResponse.redirect(`${siteUrl}/dashboard/billing?status=success`);
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.redirect(`${siteUrl}/dashboard/billing?status=failed`);
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${siteUrl}/dashboard/billing?status=error`);
  }
}