'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Camera, X, Loader2, Check } from 'lucide-react';

export default function AddPhotosSection({ recordingId }: { recordingId: string }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoUrls = useMemo(
    () => photos.map((p) => URL.createObjectURL(p)),
    [photos]
  );
  useEffect(() => () => photoUrls.forEach((u) => URL.revokeObjectURL(u)), [photoUrls]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      cameraStreamRef.current = stream;
      setCameraOpen(true);
      // Wait for the video element to mount, then attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setError('دسترسی به دوربین امکان‌پذیر نیست. مجوز مرورگر را بررسی کنید.');
    }
  };

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          setPhotos((prev) => [...prev, file]);
          closeCamera();
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append('photos', p));

      const uploadRes = await fetch(
        `/api/recordings/${recordingId}/append-photos`,
        { method: 'POST', body: formData }
      );

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
    <div
      style={{
        backgroundColor: 'var(--surface)',
        padding: '20px',
        borderRadius: '24px',
        border: '1px solid var(--line)',
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ImagePlus size={18} /> افزودن عکس جدید
      </h3>

      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-soft)',
          marginBottom: '15px',
          lineHeight: 1.7,
        }}
      >
        عکس تخته یا اسلاید اضافه کنید. پس از آپلود، جزوه با تصاویر جدید بازسازی می‌شود.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Check size={14} /> عکس‌ها اضافه و جزوه بازسازی شد.
        </div>
      )}

      {/* Camera modal */}
      {cameraOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid var(--green)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', display: 'block' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={capturePhoto}
              className="button button-primary"
              style={{ padding: '12px 30px' }}
            >
              📸 عکس بگیر
            </button>
            <button
              onClick={closeCamera}
              className="button button-secondary"
              style={{ padding: '12px 30px' }}
            >
              انصراف
            </button>
          </div>
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

      {/* Action buttons */}
      {!busy && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
          <button
            onClick={openCamera}
            className="button button-secondary button-small"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Camera size={14} /> دوربین
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="button button-secondary button-small"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ImagePlus size={14} /> گالری
          </button>
        </div>
      )}

      {/* Preview */}
      {photos.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img
                  src={photoUrls[i]}
                  alt="پیش‌نمایش"
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                  }}
                />
                <button
                  onClick={() => removePhoto(i)}
                  disabled={busy}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {uploading && <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> در حال آپلود...</>}
            {processing && <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> در حال بازسازی جزوه...</>}
            {!busy && `${photos.length} عکس اضافه کن و بازسازی کن`}
          </button>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}