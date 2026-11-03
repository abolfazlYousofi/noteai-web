'use client';

import { useState } from 'react';

export default function CheckoutButton({ planId, planName, amount }: { planId: string, planName: string, amount: number }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, amount }), // ارسال شناسه انگلیسی به سرور
      });
      
      const data = await res.json();
      
      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'خطا در اتصال به درگاه پرداخت');
        setLoading(false);
      }
    } catch (err) {
      alert('خطای شبکه');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      style={{ 
        width: '100%', textAlign: 'center', display: 'block', padding: '12px', 
        borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
        backgroundColor: 'var(--green)', color: 'white',
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s'
      }}
    >
      {loading ? 'در حال انتقال...' : `انتخاب ${planName}`}
    </button>
  );
}