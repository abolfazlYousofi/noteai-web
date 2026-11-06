'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteRecordingButton({
  recordingId,
  compact = false,
}: {
  recordingId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/recordings/${recordingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(data.error || 'خطا در حذف');
      }
    } catch {
      setError('خطای شبکه');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        title="حذف جلسه"
        style={{
          padding: compact ? '8px' : '8px 16px',
          borderRadius: '8px',
          border: '1px solid var(--line)',
          backgroundColor: 'transparent',
          color: '#dc2626',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: compact ? '14px' : '13px',
        }}
      >
        <Trash2 size={14} /> {!compact && 'حذف جلسه'}
      </button>

      {confirming && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirming(false); }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '20px',
              maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
              border: '1px solid var(--line)',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '10px' }}>
              حذف این جلسه؟
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.8, marginBottom: '20px' }}>
              فایل صوتی، عکس‌ها و جزوه این جلسه برای همیشه پاک می‌شوند. این عمل غیرقابل بازگشت است.
            </p>

            {error && (
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '13px', marginBottom: '15px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="button"
                style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', flex: 1, opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="button button-secondary"
                style={{ padding: '10px 20px', flex: 1 }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}