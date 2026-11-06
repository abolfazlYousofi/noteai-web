'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RecordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'recording' | 'uploading' | 'success' | 'stopped'>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hasConsent, setHasConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const photoObjectUrls = useMemo(
  () => photos.map(p => URL.createObjectURL(p)),
  [photos]
);
useEffect(
  () => () => photoObjectUrls.forEach(u => URL.revokeObjectURL(u)),
  [photoObjectUrls]
);

  // استیت‌های جدید برای دوربین
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]); 

  useEffect(() => {
    return () => { 
      stopEverything(); 
      stopCamera();
    };
  }, []);

  // ... (کدهای مربوط به موج صدا و startRecording بدون تغییر می‌مانند)
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
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = '#164d3e';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };
      draw();
      
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {}); 
        }
      };
    }
  }, [status]);

  const startRecording = async () => {
    if (!hasConsent) {
      setError('برای شروع ضبط، ابتدا باید قوانین رضایت را بپذیرید.');
      return;
    }
    setError(null);
    setTimeElapsed(0);
    chunksRef.current = [];
    setPhotos([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000); 
      setStatus('recording');
      timerRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    } catch (err) {
      setError('دسترسی به میکروفون رد شد. لطفاً مجوزهای مرورگر را بررسی کنید.');
    }
  };

  // --- توابع جدید برای مدیریت دوربین (وب‌کم) ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      alert('دسترسی به دوربین امکان‌پذیر نیست. ممکن است وب‌کم نداشته باشید یا مجوز نداده باشید.');
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && photoCanvasRef.current) {
      const video = videoRef.current;
      const canvas = photoCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhotos(prev => [...prev, file]);
            stopCamera(); // بستن دوربین بعد از عکس گرفتن
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const stopRecording = async () => {
    // ... (کدهای مربوط به stopRecording بدون تغییر)
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    
    setStatus('uploading');

    mediaRecorderRef.current!.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration', timeElapsed.toString());

      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      try {
        const res = await fetch('/api/recordings', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          setStatus('success');
          setTimeout(() => {
            router.push(`/dashboard`);
            router.refresh(); 
          }, 2000);
        } else {
          setError('خطا در آپلود اطلاعات.');
          setStatus('stopped');
        }
      } catch (err) {
        setError('خطا در ارتباط با سرور.');
        setStatus('stopped');
      }
    };

    stopEverything();
  };

  const stopEverything = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>ضبط جلسه جدید</h1>
        <Link href="/dashboard" className="button button-secondary button-small">بازگشت به داشبورد</Link>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {status === 'idle' && (
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={hasConsent} onChange={(e) => setHasConsent(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span>تایید می‌کنم که برای ضبط این جلسه، مجوزهای لازم از استاد و دانشگاه را دریافت کرده‌ام.</span>
            </label>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'monospace', color: status === 'recording' ? '#dc2626' : status === 'success' ? 'var(--green)' : 'var(--text)' }}>
            {formatTime(timeElapsed)}
          </div>
          
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
            {status === 'recording' && <span style={{ color: '#dc2626' }}>🔴 در حال ضبط...</span>}
            {status === 'uploading' && <span style={{ color: 'var(--text-soft)' }}>⏳ در حال ذخیره‌سازی...</span>}
            {status === 'success' && <span style={{ color: 'var(--green)' }}>✅ با موفقیت ذخیره شد!</span>}
            {status === 'stopped' && <span style={{ color: 'var(--text-soft)' }}>ضبط متوقف شده</span>}
            {status === 'idle' && <span style={{ color: 'var(--text-soft)' }}>آماده برای شروع</span>}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '16px', height: '120px', marginBottom: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {status === 'recording' ? (
             <canvas ref={canvasRef} width="700" height="120" style={{ width: '100%', height: '100%' }} />
          ) : (
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>موج صدا در حین ضبط نمایش داده می‌شود</span>
          )}
        </div>

        {/* بخش گرفتن عکس (دو دکمه مجزا) */}
        {(status === 'recording' || status === 'idle') && (
          <div style={{ marginBottom: '30px', borderTop: '1px dashed var(--line)', paddingTop: '20px' }}>
            
            {/* اگر دوربین باز باشد، پیش‌نمایش نشان داده می‌شود */}
            {isCameraOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--green)' }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
                  <canvas ref={photoCanvasRef} style={{ display: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={capturePhoto} className="button button-primary">📸 عکس بگیر</button>
                  <button onClick={stopCamera} className="button button-secondary">انصراف</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
                {/* دکمه باز کردن دوربین */}
                <button onClick={startCamera} className="button button-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📷 گرفتن عکس با دوربین
                </button>
                
                {/* دکمه انتخاب از فایل‌ها */}
                <label className="button button-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🖼️ انتخاب از فایل‌ها
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handlePhotoUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
            )}

            {/* پیش‌نمایش عکس‌های گرفته شده */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img 
                      src={photoObjectUrls[i]} 
                      alt="پیش‌نمایش" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--line)' }} 
                    />
                    <button 
                      onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {status === 'recording' ? (
            <button onClick={stopRecording} className="button button-primary button-large" style={{ background: '#dc2626', width: '200px' }}>
              توقف و ذخیره
            </button>
          ) : status === 'uploading' ? (
             <button disabled className="button button-primary button-large" style={{ width: '200px', opacity: 0.7 }}>
               در حال آپلود...
             </button>
          ) : status === 'success' ? (
            <button disabled className="button button-primary button-large" style={{ width: '200px', backgroundColor: 'var(--green)' }}>
               ذخیره شد ✅
             </button>
          ) : (
            <button onClick={startRecording} disabled={status === 'stopped'} className="button button-primary button-large" style={{ width: '200px' }}>
              شروع ضبط
            </button>
          )}
        </div>
      </div>
    </div>
  );
}