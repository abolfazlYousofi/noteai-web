'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessButton({ recordingId }: { recordingId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId }),
      });

      if (res.ok) {
        // رفرش کردن صفحه برای دریافت اطلاعات جدید از دیتابیس
        router.refresh();
      } else {
        alert('خطا در پردازش. لطفاً کنسول ترمینال را بررسی کنید.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert('خطای شبکه در ارتباط با سرور.');
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleProcess}
      disabled={isProcessing}
      className="button button-secondary button-small"
      style={{ opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
    >
      {isProcessing ? 'در حال پردازش (چند ثانیه)...' : 'پردازش با هوش مصنوعی'}
    </button>
  );
}