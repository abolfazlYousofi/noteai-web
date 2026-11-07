'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function ProcessButton({ recordingId }: { recordingId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // استیت‌های مودال
  const [showModal, setShowModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const STAGES = [
    'آماده‌سازی فایل صوتی...',
    'تبدیل صدا به متن (ممکن است طول بکشد)...',
    'تحلیل تصاویر تخته...',
    'تولید جزوه با هوش مصنوعی...',
    'ذخیره‌سازی نهایی...'
  ];

  const handleProcess = async () => {
    setShowModal(false); // بستن مودال
    setIsProcessing(true);
    setError(null);
    setStage(0);

    const stageTimer = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 8000);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId, customPrompt }), // ارسال پرامپت
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'خطا در پردازش.');
        setIsProcessing(false);
      }
    } catch {
      setError('خطا در ارتباط با سرور.');
      setIsProcessing(false);
    } finally {
      clearInterval(stageTimer);
    }
  };

  if (isProcessing) {
    return (
      <button disabled className="button button-secondary button-small" style={{ opacity: 0.8, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        {STAGES[stage]}
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </button>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button onClick={() => setShowModal(true)} className="button button-primary button-small" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> پردازش با هوش مصنوعی
        </button>
        {error && <span style={{ fontSize: '11px', color: '#dc2626' }}><AlertCircle size={10} /> {error}</span>}
      </div>

      {/* مودال وارد کردن دستورالعمل */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => !isProcessing && setShowModal(false)}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', border: '1px solid var(--line)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>دستورالعمل سفارشی (اختیاری)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '15px', lineHeight: 1.7 }}>
              آیا نکته خاصی مد نظرتان است؟ (مثلاً: «فقط روی فرمول‌ها تمرکز کن» یا «مفاهیم را خیلی ساده توضیح بده»). هوش مصنوعی این خواسته شما را در ساخت جزوه در نظر می‌گیرد.
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="مثلاً: برای امتحان فردا فقط نکات مهم و فرمول‌ها را استخراج کن..."
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)', fontSize: '14px', marginBottom: '20px', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleProcess} className="button button-primary" style={{ flex: 1 }}>شروع پردازش</button>
              <button onClick={() => setShowModal(false)} className="button button-secondary" style={{ flex: 1 }}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}