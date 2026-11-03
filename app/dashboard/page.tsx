import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProcessButton from '../../components/ProcessButton';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const recordings = await prisma.recording.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { notes: true }
  });

  const formatTime = (secs: number | null) => {
    if (!secs) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>داشبورد کاربری</h1>
        <p style={{ color: 'var(--text-soft)' }}>خوش آمدید، {session.user.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green)', marginBottom: '15px' }}>شروع یک جلسه جدید</h3>
          <Link href="/dashboard/record" className="button button-primary" style={{ padding: '12px 30px', fontSize: '16px' }}>
            🎙️ شروع ضبط
          </Link>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>آخرین ضبط‌های شما</h2>
        
        {recordings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>
            هنوز هیچ جلسه‌ای ضبط نکرده‌اید.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-soft)', fontSize: '14px' }}>
                <th style={{ padding: '15px 10px' }}>عنوان جلسه</th>
                <th style={{ padding: '15px 10px' }}>مدت زمان</th>
                <th style={{ padding: '15px 10px' }}>وضعیت</th>
                <th style={{ padding: '15px 10px' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                  <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{rec.title}</td>
                  <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>{formatTime(rec.durationSeconds)}</td>
                  <td style={{ padding: '15px 10px' }}>
                    {rec.status === 'processed' ? (
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ پردازش شده</span>
                    ) : (
                      <span style={{ color: '#ca8a04', fontWeight: 'bold' }}>⏳ در صف پردازش</span>
                    )}
                  </td>
                  <td style={{ padding: '15px 10px' }}>
                    {rec.status === 'processed' && rec.notes.length > 0 ? (
                      <Link href={`/dashboard/notes/${rec.id}`} className="button button-primary button-small">
                        مشاهده جزوه
                      </Link>
                    ) : (
                      <ProcessButton recordingId={rec.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}