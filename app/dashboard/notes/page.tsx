import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// تعریف دقیق تایپ برای ضبط‌هایی که جزوه دارند
type RecordingWithNotes = any;

export default async function NotesListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  let recordingsWithNotes: RecordingWithNotes[] = []; // تعیین تایپ آرایه
  let dbError = false;

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
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', marginBottom: '15px' }}>خطا در ارتباط با دیتابیس</h2>
        <p style={{ color: 'var(--text-soft)' }}>ارتباط با دیتابیس Turso برقرار نشد. لطفاً از روشن بودن اینترنت و خاموش بودن VPN مطمئن شوید و صفحه را رفرش کنید.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>جزوات من</h1>
        <Link href="/dashboard/record" className="button button-primary button-small">+ ضبط جدید</Link>
      </div>
      
      {recordingsWithNotes.length === 0 ? (
        <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', textAlign: 'center', color: 'var(--text-soft)' }}>
          هنوز هیچ جزوه‌ای تولید نکرده‌اید.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {recordingsWithNotes.map((rec: any) => ( // rec: any حذف شد و تایپ خودکار مشخص شد
            <div key={rec.id} style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--green-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  📄
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.4' }}>{rec.notes[0]?.title || 'بدون عنوان'}</h3>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '20px', flex: 1 }}>
                مدت زمان جلسه: {Math.floor((rec.durationSeconds || 0) / 60)} دقیقه <br/>
                تاریخ: {new Date(rec.createdAt).toLocaleDateString('fa-IR')}
              </p>
              
              <Link href={`/dashboard/notes/${rec.id}`} className="button button-secondary button-small" style={{ textAlign: 'center' }}>
                مطالعه و ویرایش جزوه
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}