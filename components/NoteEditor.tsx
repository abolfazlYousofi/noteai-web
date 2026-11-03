'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NoteEditor({ noteId, initialContent }: { noteId: string, initialContent: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert('خطا در ذخیره تغییرات');
      }
    } catch (err) {
      console.error(err);
      alert('خطای شبکه');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: '400px',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--text)',
            fontSize: '16px',
            lineHeight: '2',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => { setIsEditing(false); setContent(initialContent); }} 
            className="button button-secondary button-small"
            disabled={isSaving}
          >
            انصراف
          </button>
          <button 
            onClick={handleSave} 
            className="button button-primary button-small"
            disabled={isSaving}
          >
            {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: '16px', lineHeight: '2.2', color: 'var(--text)', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
        {content || 'متنی یافت نشد.'}
      </div>
      
        <div className="no-print" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px' }}>
        <button onClick={() => setIsEditing(true)} className="button button-primary button-small">
          ✏️ ویرایش متن جزوه
        </button>
      </div>
    </div>
  );
}