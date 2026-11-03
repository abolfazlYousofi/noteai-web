import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // دریافت اطلاعات اشتراک کاربر (اگر وجود نداشته باشد، پلن رایگان است)
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  // دریافت تمام ضبط‌های کاربر برای محاسبه مصرف
  const recordings = await prisma.recording.findMany({
    where: { userId: session.user.id },
    select: { durationSeconds: true }
  });

  // محاسبه کل ثانیه‌های مصرف شده و تبدیل به دقیقه
const totalSecondsUsed = recordings.reduce((acc: number, rec: { durationSeconds: number | null }) => acc + (rec.durationSeconds || 0), 0);
  const minutesUsed = Math.ceil(totalSecondsUsed / 60);

  // تعیین سهمیه بر اساس پلن (پیش‌فرض ۱۵ دقیقه برای رایگان)
  const plan = subscription?.plan || 'FREE';
  const maxMinutes = plan === 'PRO' ? 900 : plan === 'STUDENT' ? 300 : 15;
  const remainingMinutes = Math.max(0, maxMinutes - minutesUsed);
  
  // درصد مصرف برای نوار پیشرفت
  const usagePercentage = Math.min(100, (minutesUsed / maxMinutes) * 100);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>اشتراک و مصرف</h1>
        <p style={{ color: 'var(--text-soft)' }}>مدیریت پلن و مشاهده سهمیه پردازش شما</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* کارت وضعیت پلن */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>پلن فعلی شما</h2>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--green-light)', color: 'var(--green)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px' }}>
            {plan === 'FREE' ? 'پلن رایگان' : plan === 'STUDENT' ? 'پلن دانشجویی' : 'پلن حرفه‌ای'}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-soft)', lineHeight: '1.8', marginBottom: '20px' }}>
            شما در این پلن به {maxMinutes} دقیقه پردازش صدا در ماه دسترسی دارید.
          </p>
          <Link href="/pricing" className="button button-primary" style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
            ارتقا به پلن بالاتر
          </Link>
        </div>

        {/* کارت مصرف */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>سهمیه مصرف</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-soft)' }}>مصرف شده: {minutesUsed} دقیقه</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>باقیمانده: {remainingMinutes} دقیقه</span>
          </div>
          
          {/* نوار پیشرفت */}
          <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ 
              height: '100%', 
              width: `${usagePercentage}%`, 
              backgroundColor: usagePercentage > 80 ? '#dc2626' : 'var(--green)', 
              borderRadius: '10px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: '1.6' }}>
            {usagePercentage > 80 
              ? 'شما به سقف مصرف خود نزدیک شده‌اید. برای جلوگیری از قطع شدن سرویس، پلن خود را ارتقا دهید.' 
              : 'شما می‌توانید تا پایان ماه از باقی‌مانده سهمیه خود استفاده کنید.'}
          </p>
        </div>

      </div>
    </div>
  );
}