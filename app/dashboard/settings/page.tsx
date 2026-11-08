'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertTriangle, KeyRound, Trash2, FlaskConical, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import ProfileSection from '@/components/ProfileSection';
import PasswordInput from '@/components/auth/PasswordInput';
import { validatePassword, passwordsMatch } from '@/lib/auth/password-validation';

export default function SettingsPage() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [researchOptIn, setResearchOptIn] = useState(false);

  const validation = validatePassword(newPassword);
  const isPassValid = validation.isPasswordValid;
  const isConfirmValid = passwordsMatch(newPassword, confirmPassword);
  const canSubmitPassword = currentPassword.length > 0 && isPassValid && isConfirmValid;

  useEffect(() => {
    fetch('/api/user/research-optin').then((r) => r.json()).then((data) => { if (data.success) setResearchOptIn(data.optIn); }).catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword) return;

    setPassLoading(true); setPassMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg({ type: 'success', text: data.message });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        if (data.forceLogout) setTimeout(() => signOut({ callbackUrl: '/login' }), 3000);
      } else {
        setPassMsg({ type: 'error', text: data.error });
      }
    } catch {
      setPassMsg({ type: 'error', text: 'خطای شبکه' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) { await signOut({ redirect: false }); router.push('/'); } 
      else { alert('خطا در حذف حساب'); setDeleteLoading(false); }
    } catch { alert('خطای شبکه'); setDeleteLoading(false); }
  };

  const handleResearchOptIn = async (checked: boolean) => {
    setResearchOptIn(checked);
    await fetch('/api/user/research-optin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ optIn: checked }) });
  };

  const glassCardStyle: React.CSSProperties = {
    backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    padding: '30px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)',
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
        <div style={glassCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <KeyRound size={20} style={{ color: 'var(--green)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>تغییر رمز عبور</h2>
          </div>

          {passMsg.text && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', backgroundColor: passMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: passMsg.type === 'success' ? '#16a34a' : '#dc2626' }}>
              {passMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>رمز عبور فعلی</label>
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="رمز عبور فعلی" isValid={false} autoComplete="current-password" />
            </div>
            
            <div>
              <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>رمز عبور جدید</label>
              <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="رمز عبور جدید" isValid={isPassValid} />
              {newPassword.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.hasMinLen ? '#22c55e' : 'var(--text-soft)' }}>
                    {validation.hasMinLen ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} بین ۸ تا ۱۵ کاراکتر
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (validation.hasUpper && validation.hasLower) ? '#22c55e' : 'var(--text-soft)' }}>
                    {(validation.hasUpper && validation.hasLower) ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} حروف بزرگ و کوچک انگلیسی
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.hasNumber ? '#22c55e' : 'var(--text-soft)' }}>
                    {validation.hasNumber ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} شامل اعداد
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>تکرار رمز عبور جدید</label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="تکرار رمز عبور جدید" isValid={isConfirmValid} />
              {confirmPassword.length > 0 && !isConfirmValid && (
                <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', display: 'block' }}>رمزها یکسان نیستند.</span>
              )}
            </div>

            <button type="submit" disabled={passLoading || !canSubmitPassword} className="button button-primary" style={{ alignSelf: 'flex-start', padding: '12px 30px', borderRadius: '10px', marginTop: '10px', opacity: (!canSubmitPassword || passLoading) ? 0.5 : 1, cursor: !canSubmitPassword ? 'not-allowed' : 'pointer' }}>
              {passLoading ? 'در حال ذخیره...' : 'تغییر رمز'}
            </button>
          </form>
        </div>

        {/* رضایت‌نامه پژوهش */}
        <div style={glassCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <FlaskConical size={20} style={{ color: 'var(--green)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>مشارکت در پژوهش</h2>
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8, marginBottom: '15px' }}>با فعال‌سازی این گزینه، به ما اجازه می‌دهید از داده‌های ناشناس شما (صدا، عکس و جزوه) برای بهبود کیفیت هوش مصنوعی NoteAI استفاده کنیم.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={researchOptIn} onChange={(e) => handleResearchOptIn(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }} />
            <span>من با استفاده از داده‌های ناشناس خود برای بهبود هوش مصنوعی موافقم.</span>
          </label>
        </div>

        {/* منطقه خطر */}
        <div style={{ ...glassCardStyle, border: '1px solid rgba(220, 38, 38, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>منطقه خطر</h2>
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>با حذف حساب کاربری، تمام اطلاعات شما شامل فایل‌های صوتی، عکس‌های تخته، جزوات و سابقه پرداخت برای همیشه پاک می‌شوند.</p>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="button" style={{ border: '1px solid #dc2626', color: '#dc2626', backgroundColor: 'transparent', padding: '10px 20px' }}>
              <Trash2 size={16} style={{ marginLeft: '8px' }} /> حذف حساب کاربری
            </button>
          ) : (
            <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
              <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '15px' }}>آیا کاملاً مطمئن هستید؟</p>
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