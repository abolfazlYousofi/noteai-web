'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Check, X } from 'lucide-react';

export default function EditableTitle({ recordingId, initialTitle }: { recordingId: string, initialTitle: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/recordings/${recordingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      setIsEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} autoFocus style={{ fontSize: '24px', fontWeight: 'bold', padding: '8px', borderRadius: '8px', border: '2px solid var(--green)', backgroundColor: 'var(--surface)', flex: 1 }} />
        <button onClick={handleSave} disabled={loading} style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><Check size={20} /></button>
        <button onClick={() => setIsEditing(false)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><X size={20} /></button>
      </div>
    );
  }

  return (
    <h2 onClick={() => setIsEditing(true)} style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green)', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} title="برای ویرایش کلیک کنید">
      {title} <Edit2 size={16} style={{ opacity: 0.5 }} />
    </h2>
  );
}