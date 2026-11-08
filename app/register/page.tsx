'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';
import { validatePassword, passwordsMatch } from '@/lib/auth/password-validation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validation = validatePassword(password);
  const isPassValid = validation.isPasswordValid;
  const isConfirmValid = passwordsMatch(password, confirmPassword);
  
  const canSubmit = email.trim().length > 0 && isPassValid && isConfirmValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.error || 'خطایی رخ داد');
        setLoading(false);
      }
    } catch {
      setError('خطای شبکه');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="ساخت حساب کاربری" subtitle="به NoteAI بپیوند و یادگیری هوشمند را شروع کن.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* فیلد ایمیل */}
        <div>
          <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--text)' }}>ایمیل</label>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <input
              type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr"
              style={{ width: '100%', height: '50px', padding: '0 45px 0 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-input-bg)', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
            />
            <div style={{ position: 'absolute', right: '12px', color: 'var(--text-soft)', pointerEvents: 'none' }}>
              <Mail size={18} />
            </div>
          </div>
        </div>

        {/* فیلد رمز عبور با چک‌لیست */}
        <div>
          <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--text)' }}>رمز عبور</label>
          <PasswordInput value={password} onChange={setPassword} isValid={isPassValid} placeholder="رمز عبور جدید" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.hasMinLen ? '#22c55e' : 'var(--text-soft)' }}>
              {validation.hasMinLen ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} بین ۸ تا ۱۵ کاراکتر
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.hasUpper ? '#22c55e' : 'var(--text-soft)' }}>
              {validation.hasUpper ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حداقل یک حرف بزرگ انگلیسی (A-Z)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.hasLower ? '#22c55e' : 'var(--text-soft)' }}>
              {validation.hasLower ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حداقل یک حرف کوچک انگلیسی (a-z)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.hasNumber ? '#22c55e' : 'var(--text-soft)' }}>
              {validation.hasNumber ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حداقل یک عدد (0-9)
            </div>
          </div>
        </div>

        {/* فیلد تکرار رمز */}
        <div>
          <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--text)' }}>تکرار رمز عبور</label>
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} isValid={isConfirmValid} placeholder="تکرار رمز عبور" />
          {confirmPassword.length > 0 && !isConfirmValid && (
             <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <XCircle size={14}/> رمزها یکسان نیستند.
             </span>
          )}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button type="submit" disabled={!canSubmit} className="button button-primary" style={{ height: '50px', marginTop: '10px', borderRadius: '12px', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
          {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'ثبت‌نام'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-soft)' }}>
        قبلاً ثبت‌نام کرده‌ای؟ <Link href="/login" style={{ color: 'var(--green)', fontWeight: 'bold', textDecoration: 'none' }}>وارد شو</Link>
      </div>
    </AuthLayout>
  );
}