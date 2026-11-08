import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import NoteViewer from '@/components/NoteViewer';
import NoteEditor from '@/components/NoteEditor';
import ExportTools from '@/components/ExportTools';
import NoteChat from '@/components/NoteChat';
import ShareButton from '@/components/ShareButton'; 
import AddPhotosSection from '@/components/AddPhotosSection';
import { NoteDocumentSchema } from '@/lib/ai/note-schema';
import DeleteRecordingButton from '@/components/DeleteRecordingButton';
import EditableTitle from '@/components/EditableTitle';
import StudyTools from '@/components/StudyTools';


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
  
  // پارس کردن JSON
  let parsedNoteData = null;
  if (note?.contentJson) {
    try {
      const rawJson = JSON.parse(note.contentJson);
      const validation = NoteDocumentSchema.safeParse(rawJson);
      if (validation.success) {
        parsedNoteData = validation.data;
      }
    } catch (e) {
      console.error("Failed to parse note JSON", e);
    }
  }

  return (
    <div>
      {/* هدر صفحه */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard/notes" className="button button-secondary button-small">بازگشت</Link>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>جزوه هوشمند</h1>
        </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {note && <ShareButton noteId={note.id} />}
          {/* دکمه قبلی را حذف و کامپوننت جدید را جایگزین کن */}
          <ExportTools noteData={parsedNoteData} fallbackText={note?.content || ''} />
          <DeleteRecordingButton recordingId={recording.id} compact />
        </div>
      </div>

      <div className="print-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* ستون اصلی: متن جزوه */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
          
          {/* پخش‌کننده صوتی */}
          <div className="no-print" style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>🎧 صوت اصلی جلسه</h3>
            <audio controls src={`/api/media/${recording.storageKey}`} style={{ width: '100%' }}></audio>
          </div>

          <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '20px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green)' }}>
              {note?.title || recording.title}
            </h2>
          </div>
          <EditableTitle recordingId={recording.id} initialTitle={note?.title || recording.title} />

                    {/* نمایش یا ویرایش */}
          {parsedNoteData ? (
            <NoteEditor noteId={note!.id} initialData={parsedNoteData} />
          ) : (
            <div style={{ fontSize: '16px', lineHeight: '2.2', color: 'var(--text)', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
              {note?.content}
            </div>
          )}

          {/* 🆕 بخش فلش‌کارت و آزمون */}
          {note && (
            <StudyTools noteId={note.id} />
          )}
          
        </div>

        {/* ستون کناری: چت و عکس‌ها */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* چت هوشمند */}
          {note && <NoteChat noteId={note.id} />}

          {/* عکس‌های تخته */}
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
                    src={`/api/media/${photo.storageKey}`} 
                    alt="تخته کلاس" 
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--line)', objectFit: 'cover' }} 
                  />
                ))}
              </div>
            )}
          </div>
          <AddPhotosSection recordingId={recording.id} />
        </div>

      </div>
    </div>
  );
}