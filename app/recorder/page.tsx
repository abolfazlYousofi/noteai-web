'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// --- کامپوننت آیکون‌ها ---
type IconName = 'book' | 'arrow' | 'mic' | 'play' | 'stop' | 'camera' | 'check' | 'alert';

function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: React.CSSProperties }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style };
  const paths: Record<IconName, React.ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/><path d="M9 7h7M9 10h7"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    mic: <><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7"/></>,
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/></>,
    stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

// --- توابع ذخیره‌سازی در IndexedDB ---
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NoteAIDB', 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('chunks')) db.createObjectStore('chunks', { autoIncrement: true });
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveData = async (storeName: string, data: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).add(data);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// --- کامپوننت اصلی ---
export default function RecorderPage() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [photos, setPhotos] = useState<{ url: string; time: number }[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('مرورگر شما از ضبط صدا پشتیبانی نمی‌کند. لطفاً از مرورگر دیگری استفاده کنید.');
    }
    if (navigator.storage?.persist) {
      navigator.storage.persist().then(granted => console.log('Storage Persist:', granted));
    }
  }, []);

  // ✨ این بخش جدید است: رسم موج صدا دقیقاً زمانی که Canvas در صفحه ظاهر می‌شود
  useEffect(() => {
    if (status === 'recording' && streamRef.current && canvasRef.current) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(streamRef.current);
      source.connect(analyser);
      analyser.fftSize = 256;

      audioContextRef.current = audioCtx;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // محاسبه عرض میله‌ها بر اساس اندازه واقعی canvas
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = '#164d3e'; // رنگ سبز اصلی سایت
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };
      draw();

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        audioCtx.close();
      };
    }
  }, [status]);

  const startRecording = async () => {
    setError(null);
    setPhotos([]);
    setTimeElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          await saveData('chunks', { blob: e.data, timestamp: Date.now() });
        }
      };

      mediaRecorder.start(1000);
      setStatus('recording');
      startTimeRef.current = performance.now();

      timerRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    } catch (err) {
      setError('دسترسی به میکروفون رد شد. برای ضبط صدا باید اجازه دسترسی بدهید.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('stopped');
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const relativeTime = status === 'recording' ? performance.now() - startTimeRef.current : 0;
      setPhotos(prev => [...prev, { url, time: relativeTime }]);
      await saveData('photos', { file, relativeTimeMs: relativeTime });
    }
  };

  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="topbar" style={{ position: 'relative' }}>
        <div className="topbar-inner container">
          <Link href="/" className="brand">
            <span className="brand-mark"><Icon name="book" size={22}/></span>
            <span>NoteAI</span>
          </Link>
          <Link href="/" className="button button-secondary button-small">
            <Icon name="arrow" size={16} style={{ transform: 'rotate(180deg)', marginLeft: '8px' }} /> بازگشت
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '700px', background: 'var(--surface)', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>ضبط جلسه جدید</h1>
            <p style={{ color: 'var(--text-soft)', fontSize: '14px' }}>صدا را ضبط کنید و همزمان از تخته عکس بگیرید.</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon name="alert" size={20} /> {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'monospace', color: status === 'recording' ? '#dc2626' : 'var(--text)' }}>
              {formatTime(timeElapsed)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-soft)', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {status === 'recording' ? (
                <><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}></span> در حال ضبط...</>
              ) : status === 'stopped' ? 'ضبط متوقف شده' : 'آماده برای شروع'}
            </div>
          </div>

          {/* کانواس برای نمایش موج صدا */}
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', height: '120px', marginBottom: '30px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {status === 'recording' ? (
               <canvas ref={canvasRef} width="600" height="120" style={{ width: '100%', height: '100%' }} />
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: '14px' }}>موج صدا در حین ضبط نمایش داده می‌شود</span>
            )}
          </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
        {status === 'recording' ? (
            <button onClick={stopRecording} className="button button-primary button-large" style={{ background: '#dc2626', width: '200px' }}>
            <Icon name="stop" size={18} style={{ marginLeft: '8px' }} /> توقف ضبط
            </button>
        ) : status === 'stopped' ? (
            // این بخش جدید است:
            <Link href="/notes" className="button button-primary button-large" style={{ width: '250px', backgroundColor: 'var(--green)' }}>
            مشاهده جزوه تولید شده <Icon name="arrow" size={18} style={{ marginRight: '8px' }} />
            </Link>
        ) : (
            <button onClick={startRecording} className="button button-primary button-large" style={{ width: '200px' }}>
            <Icon name="mic" size={18} style={{ marginLeft: '8px' }} /> شروع ضبط
            </button>
        )}
        </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>عکس‌های تخته</h3>
              <label className="button button-secondary button-small" style={{ cursor: 'pointer' }}>
                <Icon name="camera" size={16} style={{ marginLeft: '8px' }} /> گرفتن عکس
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} style={{ display: 'none' }} />
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <img src={p.url} alt="تخته" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '11px', textAlign: 'center', padding: '4px 0' }}>
                    {formatTime(Math.floor(p.time / 1000))}
                  </div>
                </div>
              ))}
              {photos.length === 0 && (
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>هنوز عکسی گرفته نشده است.</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}