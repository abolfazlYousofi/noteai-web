'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfileBlocker({ isIncomplete }: { isIncomplete: boolean }) {
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);

  // 🆕 گوش دادن به رویداد ذخیره شدن پروفایل
  useEffect(() => {
    const handleProfileSaved = () => setIsDismissed(true);
    window.addEventListener('profile-saved', handleProfileSaved);
    return () => window.removeEventListener('profile-saved', handleProfileSaved);
  }, []);

  // اگر پروفایل کامل بود، یا همین الان ذخیره شد، یا در صفحه تنظیمات بودیم، قفل را نشان نده
  if (!isIncomplete || isDismissed || pathname.includes('/dashboard/settings')) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      backgroundColor: 'rgba(7, 18, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        borderRadius: '24px', padding: '40px', maxWidth: '450px', width: '100%', textAlign: 'center',
        animation: 'popIn 0.3s ease-out'
      }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertCircle size={32} style={{ color: '#eab308' }} />
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '12px' }}>تکمیل پروفایل الزامی است</h2>
        
        <p style={{ fontSize: '14px', color: 'var(--text-soft)', lineHeight: 1.8, marginBottom: '30px' }}>
          برای اینکه هوش مصنوعی بتواند جزوات را با رشته تحصیلی شما هماهنگ کند و امکان استفاده از امکانات سایت فراهم شود، لطفاً ابتدا اطلاعات خود را تکمیل کنید.
        </p>

        <Link href="/dashboard/settings" className="button button-primary" style={{ display: 'inline-flex', width: '100%', height: '50px', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <UserCog size={20} /> رفتن به تنظیمات و تکمیل
        </Link>
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}