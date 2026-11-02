import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // تلاش برای خواندن تعداد کاربران از دیتابیس PostgreSQL
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      success: true, 
      message: 'اتصال به دیتابیس PostgreSQL با موفقیت برقرار شد!',
      totalUsers: userCount
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در اتصال به دیتابیس',
      details: error.message 
    }, { status: 500 });
  }
}