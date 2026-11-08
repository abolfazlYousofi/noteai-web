'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('ایمیل و رمز عبور را وارد کنید.');

    setLoading(true);
    setError('');

    const res = await signIn('credentials', { redirect: false, email, password });

    if (res?.error) {
      setError('ایمیل یا رمز عبور اشتباه است.');
      setLoading(false);
    } else {
      router.replace('/dashboard');
      router.refresh();
    }
  };

  return (
    <AuthLayout title="خوش برگشتی!" subtitle="برای ورود به حساب NoteAI اطلاعات خود را وارد کن.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* فیلد ایمیل */}
        <div>
          <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--text)' }}>ایمیل</label>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <input
              type="email" 
              placeholder="example@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              dir="ltr"
              style={{ width: '100%', height: '50px', padding: '0 45px 0 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-input-bg)', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
            />
            <div style={{ position: 'absolute', right: '12px', color: 'var(--text-soft)', pointerEvents: 'none' }}>
              <Mail size={18} />
            </div>
          </div>
        </div>

        {/* فیلد رمز عبور */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text)' }}>رمز عبور</label>
            <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'none' }}>فراموشی رمز عبور؟</Link>
          </div>
          <PasswordInput value={password} onChange={setPassword} placeholder="رمز عبور" isValid={false} autoComplete="current-password" />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !email || !password} 
          className="button button-primary" 
          style={{ height: '50px', marginTop: '10px', borderRadius: '12px', opacity: (loading || !email || !password) ? 0.5 : 1, cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer' }}
        >
          {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'ورود به حساب'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-soft)' }}>
        حساب کاربری نداری؟ <Link href="/register" style={{ color: 'var(--green)', fontWeight: 'bold', textDecoration: 'none' }}>ثبت‌نام کن</Link>
      </div>
    </AuthLayout>
  );
}