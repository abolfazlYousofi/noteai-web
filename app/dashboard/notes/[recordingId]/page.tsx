import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import NoteEditor from '@/components/NoteEditor';
import PrintButton from '@/components/PrintButton';

export default async function NoteViewerPage({ params }: { params: Promise<{ recordingId: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const recording = await prisma.recording.findUnique({
    where: { id: resolvedParams.recordingId },
    include: { notes: true, photos: true },
  });

  if (!recording || recording.userId !== session.user.id) {
    notFound();
  }

  const note = recording.notes[0];

  return (
    <div>
      {/* هدر صفحه (در چاپ مخفی می‌شود) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard/notes" className="button button-secondary button-small">بازگشت</Link>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>مشاهده جزوه</h1>
        </div>
        <PrintButton />
      </div>

      {/* ساختار گرید (در چاپ به بلوک تبدیل می‌شود) */}
      <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
        
        {/* ستون اصلی: متن جزوه */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '20px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green)' }}>
              {note?.title || recording.title}
            </h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '14px', marginTop: '10px' }}>
              تولید شده توسط هوش مصنوعی NoteAI · {new Date(recording.createdAt).toLocaleDateString('fa-IR')}
            </p>
          </div>

          {/* کامپوننت ویرایشگر */}
          {note ? (
            <NoteEditor noteId={note.id} initialContent={note.content} />
          ) : (
            <p>جزوه‌ای یافت نشد.</p>
          )}
          
          {/* عکس‌ها در چاپ به زیر متن منتقل می‌شوند */}
          {recording.photos.length > 0 && (
            <div className="print-photos">
              {recording.photos.map((photo: { id: string; storageKey: string }) => (
                <img 
                  key={photo.id} 
                  src={photo.storageKey} 
                  alt="تخته کلاس" 
                />
              ))}
            </div>
          )}
        </div>

        {/* ستون کناری: عکس‌های تخته (در چاپ مخفی می‌شود) */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '24px', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📸 عکس‌های تخته
            </h3>
            
            {recording.photos.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-soft)' }}>برای این جلسه عکسی ثبت نشده است.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {recording.photos.map((photo: { id: string; storageKey: string }) => (
                  <img 
                    key={photo.id} 
                    src={photo.storageKey} 
                    alt="تخته کلاس" 
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--line)', objectFit: 'cover' }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}