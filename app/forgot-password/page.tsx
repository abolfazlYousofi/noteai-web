'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/user/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="بازیابی رمز عبور" subtitle="ایمیل حساب خود را وارد کن تا لینک بازیابی برایت ارسال شود.">
      {submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.8 }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> 
            درخواست شما ثبت شد. اگر این ایمیل در سیستم وجود داشته باشد، لینک بازیابی برای آن ارسال خواهد شد. (لینک در ترمینال چاپ می‌شود).
          </div>
          <Link href="/login" style={{ textAlign: 'center', color: 'var(--green)', textDecoration: 'none', fontWeight: 'bold' }}>بازگشت به صفحه ورود</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--text)' }}>ایمیل</label>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" placeholder="example@email.com" style={{ width: '100%', height: '50px', padding: '0 45px 0 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-input-bg)', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
              <div style={{ position: 'absolute', right: '12px', color: 'var(--text-soft)', pointerEvents: 'none' }}><Mail size={18} /></div>
            </div>
          </div>
          <button type="submit" disabled={loading || !email} className="button button-primary" style={{ height: '50px', marginTop: '10px', borderRadius: '12px', opacity: (loading || !email) ? 0.5 : 1 }}>
            {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'ارسال لینک بازیابی'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}