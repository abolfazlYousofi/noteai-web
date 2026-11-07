'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertTriangle, KeyRound, Trash2, FlaskConical } from 'lucide-react';
import ProfileSection from '@/components/ProfileSection';
import { useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  
  // استیت‌های تغییر رمز
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // استیت‌های حذف حساب
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // استیت رضایت‌نامه پژوهش
  const [researchOptIn, setResearchOptIn] = useState(false);

    useEffect(() => {
    fetch('/api/user/research-optin')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResearchOptIn(data.optIn);
      })
      .catch(() => {});
  }, []);
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setPassMsg({ type: 'success', text: data.message });
        setCurrentPassword('');
        setNewPassword('');
        // چون رمز عوض شده، کاربر را بعد از ۳ ثانیه SignOut می‌کنیم
        if (data.forceLogout) {
          setTimeout(() => signOut({ callbackUrl: '/login' }), 3000);
        }
      } else {
        setPassMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: 'خطای شبکه' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ redirect: false });
        router.push('/');
      } else {
        alert('خطا در حذف حساب');
        setDeleteLoading(false);
      }
    } catch (err) {
      alert('خطای شبکه');
      setDeleteLoading(false);
    }
  };

  const handleResearchOptIn = async (checked: boolean) => {
    setResearchOptIn(checked);
    await fetch('/api/user/research-optin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optIn: checked }),
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>تنظیمات و حریم خصوصی</h1>
        <p style={{ color: 'var(--text-soft)' }}>مدیریت امنیت و اطلاعات حساب کاربری شما</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <ProfileSection />

                {/* بخش تغییر رمز عبور */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <KeyRound size={20} style={{ color: 'var(--green)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>تغییر رمز عبور</h2>
          </div>

          {passMsg.text && (
            <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', backgroundColor: passMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: passMsg.type === 'success' ? '#166534' : '#991b1b' }}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* فیلد رمز عبور فعلی با دکمه چشم */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showCurrentPass ? 'text' : 'password'} 
                placeholder="رمز عبور فعلی" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', paddingLeft: '40px', borderRadius: '10px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', alignItems: 'center' }}
                title={showCurrentPass ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* فیلد رمز عبور جدید با دکمه چشم */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showNewPass ? 'text' : 'password'} 
                placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                style={{ width: '100%', padding: '12px', paddingLeft: '40px', borderRadius: '10px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', alignItems: 'center' }}
                title={showNewPass ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={passLoading} className="button button-primary" style={{ alignSelf: 'flex-start', padding: '10px 30px', marginTop: '5px' }}>
              {passLoading ? 'در حال ذخیره...' : 'تغییر رمز'}
            </button>
          </form>
        </div>
        {/* بخش رضایت‌نامه پژوهش (جدید) */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <FlaskConical size={20} style={{ color: 'var(--green)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>مشارکت در پژوهش</h2>
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>
            با فعال‌سازی این گزینه، به ما اجازه می‌دهید از داده‌های ناشناس شما (صدا، عکس و جزوه) برای بهبود کیفیت هوش مصنوعی NoteAI استفاده کنیم. این کار کاملاً داوطلبانه است و به عملکرد حساب شما لطمه‌ای نمی‌زند.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
            <input 
              type="checkbox" 
              checked={researchOptIn} 
              onChange={(e) => handleResearchOptIn(e.target.checked)} 
              style={{ width: '18px', height: '18px' }}
            />
            <span>من با استفاده از داده‌های ناشناس خود برای بهبود هوش مصنوعی موافقم.</span>
          </label>
        </div>

        {/* بخش حذف حساب کاربری */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>منطقه خطر</h2>
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
            با حذف حساب کاربری، تمام اطلاعات شما شامل فایل‌های صوتی، عکس‌های تخته، جزوات و سابقه پرداخت برای همیشه پاک می‌شوند. این عملیات غیرقابل بازگشت است.
          </p>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="button" style={{ border: '1px solid #dc2626', color: '#dc2626', backgroundColor: 'transparent', padding: '10px 20px' }}>
              <Trash2 size={16} style={{ marginLeft: '8px' }} /> حذف حساب کاربری
            </button>
          ) : (
            <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '12px' }}>
              <p style={{ color: '#991b1b', fontWeight: 'bold', marginBottom: '15px' }}>آیا کاملاً مطمئن هستید؟</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleDeleteAccount} disabled={deleteLoading} className="button" style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px' }}>
                  {deleteLoading ? 'در حال حذف...' : 'بله، حذف کن'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="button button-secondary" style={{ padding: '10px 20px' }}>
                  انصراف
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}