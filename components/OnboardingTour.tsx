'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Sparkles, Mic, FileText, MessageSquare, Settings } from 'lucide-react';

const STEPS = [
  {
    icon: <Sparkles size={28} style={{ color: 'var(--green)' }} />,
    title: 'به NoteAI خوش آمدید! 👋',
    desc: 'ما اینجاییم تا با هم کلاس‌های دانشگاه را به جزوات هوشمند و قابل مطالعه تبدیل کنیم.',
  },
  {
    icon: <Mic size={28} style={{ color: '#3b82f6' }} />,
    title: 'ضبط جلسه جدید',
    desc: 'با کلیک روی این بخش، صدای استاد را ضبط کنید یا فایل صوتی گوشی خود را آپلود کنید. در حین ضبط می‌توانید از تخته سیاه هم عکس بگیرید.',
  },
  {
    icon: <FileText size={28} style={{ color: '#eab308' }} />,
    title: 'جزوات من',
    desc: 'هوش مصنوعی تمام صداها و عکس‌های شما را پردازش کرده و یک جزوه ساختاریافته با فرمول و تایم‌لاین در این بخش تحویل می‌دهد.',
  },
  {
    icon: <MessageSquare size={28} style={{ color: '#8b5cf6' }} />,
    title: 'پشتیبانی',
    desc: 'اگر سوالی داشتید یا به مشکلی برخوردید، از این بخش تیکت بزنید. تیم پشتیبانی ما در سریع‌ترین زمان پاسخگو شماست.',
  },
  {
    icon: <Settings size={28} style={{ color: 'var(--text-soft)' }} />,
    title: 'تنظیمات و امنیت',
    desc: 'در اینجا می‌توانید اطلاعات شخصی، پروفایل آکادمیک و امنیت حساب خود (مثل تغییر رمز عبور) را مدیریت کنید.',
  }
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // بررسی اینکه آیا کاربر قبلاً تور را دیده است یا نه
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShow(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!show) return null;

  const step = STEPS[currentStep];

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, width: '100%', maxWidth: '380px' }}>
      <div style={{
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* دکمه بستن */}
        <button onClick={handleClose} style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}>
          <X size={20} />
        </button>

        {/* آیکون */}
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          {step.icon}
        </div>

        {/* محتوا */}
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>{step.title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: '24px' }}>{step.desc}</p>

        {/* فوتر (دکمه‌ها) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STEPS.map((_, idx) => (
              <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: idx === currentStep ? 'var(--green)' : 'var(--line)', transition: 'all 0.2s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button onClick={handlePrev} className="button button-secondary button-small" style={{ padding: '8px 16px' }}>قبلی</button>
            )}
            <button onClick={handleNext} className="button button-primary button-small" style={{ padding: '8px 20px' }}>
              {currentStep === STEPS.length - 1 ? 'شروع کار' : 'بعدی'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}