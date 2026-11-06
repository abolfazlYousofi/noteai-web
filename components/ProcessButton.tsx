'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

const STAGES = [
  'در حال آماده‌سازی...',
  'تبدیل صدا به متن...',
  'تحلیل تصاویر تخته...',
  'تولید جزوه با هوش مصنوعی...',
  'ذخیره‌سازی نهایی...',
];

export default function ProcessButton({ recordingId }: { recordingId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    };
  }, []);

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setStage(0);

    // Advance stage every 5 seconds (rough approximation)
    stageTimerRef.current = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 5000);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'خطا در پردازش. لطفاً دوباره تلاش کنید.');
        setIsProcessing(false);
      }
    } catch {
      setError('خطا در ارتباط با سرور.');
      setIsProcessing(false);
    } finally {
      if (stageTimerRef.current) {
        clearInterval(stageTimerRef.current);
        stageTimerRef.current = null;
      }
    }
  };

  if (isProcessing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          disabled
          className="button button-secondary button-small"
          style={{ opacity: 0.7, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
          {STAGES[stage]}
        </button>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <button
        onClick={handleProcess}
        className="button button-secondary button-small"
      >
        پردازش با هوش مصنوعی
      </button>
      {error && (
        <span style={{ fontSize: '11px', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
  );
}