import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NotesSearch from '@/components/NotesSearch'; // 🆕 ایمپورت کامپوننت جستجو

type RecordingWithNotes = any;

export default async function NotesListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  let recordingsWithNotes: RecordingWithNotes[] = [];
  let dbError = false;

  // این بخش کد دیتابیس است و هیچ تغییری نکرده است
  try {
    recordingsWithNotes = await prisma.recording.findMany({
      where: { 
        userId: session.user.id,
        notes: { some: {} } 
      },
      orderBy: { createdAt: 'desc' },
      include: { notes: true }
    });
  } catch (error) {
    console.error('DB Error:', error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'var(--surface)', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', marginBottom: '15px' }}>خطا در اتصال به دیتابیس</h2>
        <p style={{ color: 'var(--text-soft)' }}>اتصال به دیتابیس Turso برقرار نشد. لطفاً از روشن بودن اینترنت و خاموش بودن VPN مطمئن شوید و صفحه را رفرش کنید.</p>
      </div>
    );
  }

  return (
    <div>
      {/* هدر صفحه (عنوان و دکمه ضبط جدید) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>جزوات من</h1>
        <Link href="/dashboard/record" className="button button-primary button-small">+ ضبط جدید</Link>
      </div>
      
      {recordingsWithNotes.length === 0 ? (
        // اگر هیچ جزوه‌ای وجود نداشت
        <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', textAlign: 'center', color: 'var(--text-soft)' }}>
          هنوز هیچ جزوه‌ای تولید نکرده‌اید.
        </div>
      ) : (
        // 🆕 استفاده از کامپوننت جستجو به جای کدهای قبلی
        <NotesSearch recordings={recordingsWithNotes} />
      )}
    </div>
  );
}