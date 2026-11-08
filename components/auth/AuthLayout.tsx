import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <main
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden',
        direction: 'rtl',
      }}
    >
      {/* هاله‌های نورانی پس‌زمینه */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--green) 0%, transparent 60%)', opacity: 0.15, filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, #4f46e5 0%, transparent 60%)', opacity: 0.1, filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ستون فرم (سمت راست در RTL) */}
      <section style={{ flex: '1 1 450px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '40px 30px',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '30px', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--green)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '20px' }}>N</div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text)' }}>NoteAI</span>
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>{title}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.6 }}>{subtitle}</p>
          </div>

          {children}
        </div>
      </section>

      {/* ستون بنر برند (سمت چپ در RTL) - در موبایل مخفی می‌شود */}
      <aside
        style={{
          flex: '1 1 450px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          zIndex: 1,
        }}
        className="hide-on-mobile" // از کلاس CSS برای مخفی کردن در موبایل استفاده می‌کنیم
      >
        <div style={{ maxWidth: '400px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(10px)', color: 'var(--green)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginBottom: '20px', border: '1px solid var(--glass-border)' }}>
            <Sparkles size={16} /> دستیار هوشمند یادگیری
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: 900, color: 'var(--text)', lineHeight: 1.4, marginBottom: '20px' }}>
            فقط کلاس را ضبط نکن،<br />
            <span style={{ color: 'var(--green)' }}>هوشمندانه یاد بگیر.</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-soft)', lineHeight: 1.8 }}>
            از ضبط صدای کلاس و تحلیل تصاویر تخته تا تولید جزوه، فلش‌کارت و آزمون؛ تمام مسیر یادگیری در یک فضای هوشمند.
          </p>
        </div>
      </aside>
    </main>
  );
}