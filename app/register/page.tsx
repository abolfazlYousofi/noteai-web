'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/login');
    } else {
      setError(data.error || 'خطایی رخ داد');
      setLoading(false);
    }
  };

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--surface)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>ثبت‌نام در NoteAI</h1>
        
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--background)' }} />
          <input type="password" placeholder="رمز عبور (حداقل ۸ کاراکتر)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--background)' }} />
          <button type="submit" disabled={loading} className="button button-primary" style={{ marginTop: '10px', height: '48px' }}>
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-soft)' }}>
          قبلاً ثبت‌نام کرده‌اید؟ <Link href="/login" style={{ color: 'var(--green)', fontWeight: 'bold' }}>وارد شوید</Link>
        </div>
      </div>
    </div>
  );
}