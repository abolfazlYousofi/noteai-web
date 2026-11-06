'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2 } from 'lucide-react';

export default function AddPhotosSection({ recordingId }: { recordingId: string }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoUrls = useMemo(
    () => photos.map(p => URL.createObjectURL(p)),
    [photos]
  );
  useEffect(() => () => photoUrls.forEach(u => URL.revokeObjectURL(u)), [photoUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      photos.forEach(p => formData.append('photos', p));

      const uploadRes = await fetch(`/api/recordings/${recordingId}/append-photos`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || 'خطا در آپلود عکس‌ها');
      }

      setUploading(false);
      setProcessing(true);

      const processRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId, force: true }),
      });

      if (!processRes.ok) {
        const data = await processRes.json();
        throw new Error(data.error || 'خطا در پردازش مجدد');
      }

      setSuccess(true);
      setPhotos([]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'خطای ناشناخته');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const busy = uploading || processing;

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '24px', border: '1px solid var(--line)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ImagePlus size={18} /> افزودن عکس جدید
      </h3>

      <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '15px', lineHeight: 1.7 }}>
        عکس تخته یا اسلاید اضافه کنید. پس از آپلود، جزوه با تصاویر جدید دوباره ساخته می‌شود.
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
          ✅ عکس‌ها اضافه و جزوه بازسازی شد.
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={busy}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        className="button button-secondary button-small"
        style={{ width: '100%', marginBottom: '15px' }}
      >
        <ImagePlus size={14} style={{ marginLeft: '6px' }} /> انتخاب عکس (چندتایی)
      </button>

      {photos.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img
                  src={photoUrls[i]}
                  alt="پیش‌نمایش"
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
                />
                <button
                  onClick={() => removePhoto(i)}
                  disabled={busy}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="button button-primary"
            style={{ width: '100%' }}
          >
            {uploading && <><Loader2 size={14} style={{ marginLeft: '6px' }} /> در حال آپلود...</>}
            {processing && <><Loader2 size={14} style={{ marginLeft: '6px' }} /> در حال بازسازی جزوه...</>}
            {!busy && `${photos.length} عکس اضافه کن و بازسازی کن`}
          </button>
        </>
      )}
    </div>
  );
}