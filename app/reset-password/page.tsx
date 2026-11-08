'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, XCircle, Loader2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // منطق چک کردن مستقیم در همین فایل
  const hasMinLen = password.length >= 8 && password.length <= 15;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPassValid = hasMinLen && hasUpper && hasLower && hasNumber;
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = Boolean(token) && isPassValid && isConfirmValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/reset-password', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ token, newPassword: password }), 
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'لینک نامعتبر یا منقضی شده است');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message); 
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="تعیین رمز عبور جدید" subtitle="یک رمز امن برای حساب خود انتخاب کنید.">
      {!token ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#dc2626', fontSize: '13px' }}>توکن بازیابی در آدرس وجود ندارد.</p>
          <Link href="/forgot-password" style={{ color: 'var(--green)', fontSize: '13px', textDecoration: 'none' }}>درخواست لینک جدید</Link>
        </div>
      ) : success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
            <CheckCircle2 size={18} /> رمز عبور با موفقیت تغییر کرد.
          </div>
          <button onClick={() => router.replace('/login')} className="button button-primary" style={{ height: '50px', borderRadius: '12px' }}>ورود به حساب</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* فیلد رمز عبور جدید */}
          <div>
            <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: 'bold', color: 'var(--text)' }}>رمز عبور جدید</label>
            
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور جدید"
                autoComplete="new-password"
                dir="ltr"
                style={{
                  width: '100%', height: '50px', padding: '0 45px', borderRadius: '12px',
                  border: `1px solid ${isPassValid ? '#22c55e' : 'var(--glass-border)'}`,
                  background: 'var(--glass-input-bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', transition: 'all 0.2s',
                }}
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // 🆕 جلوگیری از گرفتن فوکوس در فایرفاکس
                  setShowPass(!showPass);
                }}
                style={{ position: 'absolute', left: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', padding: '8px', zIndex: 10 }}
              >
                {/* 🆕 pointerEvents: none باعث می‌شود کلیک مستقیماً روی دکمه بیفتد، نه روی آیکون */}
                <div style={{ pointerEvents: 'none' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </button>
              <div style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }}>
                {isPassValid ? <CheckCircle2 size={18} color="#22c55e" /> : <LockKeyhole size={18} color="var(--text-soft)" />}
              </div>
            </div>

            {/* چک‌لیست شرایط */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasMinLen ? '#22c55e' : 'var(--text-soft)' }}>
                {hasMinLen ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} بین ۸ تا ۱۵ کاراکتر
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasUpper ? '#22c55e' : 'var(--text-soft)' }}>
                {hasUpper ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حداقل یک حرف بزرگ انگلیسی (A-Z)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLower ? '#22c55e' : 'var(--text-soft)' }}>
                {hasLower ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حداقل یک حرف کوچک انگلیسی (a-z)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasNumber ? '#22c55e' : 'var(--text-soft)' }}>
                {hasNumber ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حداقل یک عدد (0-9)
              </div>
            </div>
          </div>

          {/* فیلد تکرار رمز عبور */}
          <div>
            <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: 'bold', color: 'var(--text)' }}>تکرار رمز عبور</label>
            
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور"
                autoComplete="new-password"
                dir="ltr"
                style={{
                  width: '100%', height: '50px', padding: '0 45px', borderRadius: '12px',
                  border: `1px solid ${isConfirmValid ? '#22c55e' : 'var(--glass-border)'}`,
                  background: 'var(--glass-input-bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', transition: 'all 0.2s',
                }}
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowConfirmPass(!showConfirmPass);
                }}
                style={{ position: 'absolute', left: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', padding: '8px', zIndex: 10 }}
              >
                <div style={{ pointerEvents: 'none' }}>
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </button>
              <div style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }}>
                {isConfirmValid ? <CheckCircle2 size={18} color="#22c55e" /> : <LockKeyhole size={18} color="var(--text-soft)" />}
              </div>
            </div>

            {confirmPassword.length > 0 && !isConfirmValid && (
              <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <XCircle size={14}/> رمز عبور و تکرار آن یکسان نیستند.
              </span>
            )}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={!canSubmit} 
            className="button button-primary" 
            style={{ height: '50px', borderRadius: '12px', marginTop: '10px', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'ذخیره رمز جدید'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}