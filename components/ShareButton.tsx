'use client';

import { useState } from 'react';
import { Share2, Copy, X } from 'lucide-react';

export default function ShareButton({ noteId }: { noteId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setToken(data.shareToken);
      } else {
        alert(data.error || 'خطا در ساخت لینک');
      }
    } catch {
      alert('خطای شبکه');
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = token ? `${window.location.origin}/share/${token}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button onClick={handleShare} disabled={loading} className="button button-secondary button-small" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Share2 size={14} /> {loading ? '...' : 'اشتراک‌گذاری'}
      </button>

      {token && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setToken(null)}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', border: '1px solid var(--line)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>لینک اشتراک‌گذاری</h3>
              <button onClick={() => setToken(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '15px', lineHeight: 1.6 }}>هر کسی با این لینک می‌تواند جزوه را به صورت Read-Only ببیند. (این لینک شامل فایل صوتی یا تصویری نیست).</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" readOnly value={shareUrl} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)', direction: 'ltr' }} />
              <button onClick={copyToClipboard} className="button button-primary" style={{ padding: '10px 20px', minWidth: '100px' }}>
                {copied ? 'کپی شد!' : <><Copy size={14} style={{ marginLeft: '6px' }} /> کپی</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}