'use client';

import Link from 'next/link';
import { useState } from 'react';

// --- کامپوننت آیکون‌ها ---
type IconName = 'book' | 'arrow' | 'mic' | 'play' | 'pause' | 'image' | 'file' | 'spark' | 'check' | 'search' | 'user' | 'chevron';

function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: React.CSSProperties }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style };
  const paths: Record<IconName, React.ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/><path d="M9 7h7M9 10h7"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    mic: <><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7"/></>,
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/></>,
    pause: <><circle cx="12" cy="12" r="9"/><rect x="9" y="8" width="2" height="8" fill="currentColor" stroke="none"/><rect x="13" y="8" width="2" height="8" fill="currentColor" stroke="none"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function NotesPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* هدر */}
      <header className="topbar" style={{ position: 'relative' }}>
        <div className="topbar-inner container">
          <Link href="/" className="brand">
            <span className="brand-mark"><Icon name="book" size={22}/></span>
            <span>NoteAI</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href="/recorder" className="button button-secondary button-small">
              <Icon name="mic" size={16} style={{ marginLeft: '8px' }} /> ضبط جدید
            </Link>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="user" size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* بدنه اصلی */}
      <main style={{ flex: 1, display: 'flex', backgroundColor: 'var(--surface-2)' }}>
        
        {/* سایدبار راست */}
        <aside style={{ width: '260px', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--line)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '10px', marginTop: '10px' }}>درس‌های من</h3>
          
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--green-light)', color: 'var(--green)', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="file" size={16} /> سیستم‌های عامل
          </div>
          <div style={{ padding: '12px', borderRadius: '8px', color: 'var(--text-soft)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="file" size={16} /> مهندسی نرم‌افزار
          </div>
          <div style={{ padding: '12px', borderRadius: '8px', color: 'var(--text-soft)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="file" size={16} /> ریاضیات گسسته
          </div>
        </aside>

        {/* محتوای جزوه */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '40px', boxShadow: 'var(--shadow)' }}>
            
            {/* هدر جزوه */}
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '20px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', backgroundColor: 'var(--green-light)', color: 'var(--green)', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>جلسه ۳</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>۲۲ مهر ۱۴۰۳ · ۵۶ دقیقه</span>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text)' }}>مدیریت حافظه در سیستم‌عامل</h1>
            </div>

            {/* بخش ۱ */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '20px', backgroundColor: 'var(--green)', borderRadius: '4px' }}></span>
                ۱. مقدمه‌ای بر مدیریت حافظه
              </h2>
              <p style={{ fontSize: '15px', lineHeight: '2', color: 'var(--text-soft)', textAlign: 'justify' }}>
                مدیریت حافظه نقش بسیار مهمی در بهره‌وری سیستم‌عامل دارد. حافظه را می‌توان به دو بخش اصلی تقسیم کرد: حافظه اصلی (RAM) و حافظه مجازی. سیستم‌عامل باید به گونه‌ای این منابع را تخصیص دهد که فرآیندها بدون تداخل به کار خود ادامه دهند.
              </p>
              
              {/* اتصال به منبع صوتی */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', backgroundColor: 'var(--surface-2)', padding: '10px 15px', borderRadius: '8px', width: 'fit-content', cursor: 'pointer', border: '1px solid var(--line)' }}>
                <Icon name="play" size={14} style={{ color: 'var(--green)' }} />
                <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>پخش از دقیقه ۱۵:۲۰</span>
              </div>
            </div>

            {/* بخش ۲ با تصویر تخته */}
            <div style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '20px', backgroundColor: 'var(--green)', borderRadius: '4px' }}></span>
                  ۲. تفاوت فرآیند و نخ (Thread)
                </h2>
                <p style={{ fontSize: '15px', lineHeight: '2', color: 'var(--text-soft)', textAlign: 'justify' }}>
                  فرآیند یک برنامه در حال اجراست که دارای فضای آدرس مستقل است، در حالی که نخ‌ها واحدهای کوچکتری درون یک فرآیند هستند که حافظه را با هم به اشتراک می‌گذارند. همانطور که استاد در کلاس اشاره کردند، ایجاد نخ‌ها بسیار سبک‌تر از فرآیندهاست.
                </p>
              </div>
              
              {/* عکس متصل شده از تخته */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                <div style={{ backgroundColor: '#2b4036', height: '150px', padding: '15px', color: '#fff', fontFamily: 'monospace', fontSize: '10px' }}>
                  <div>Process vs Thread</div>
                  <div style={{ marginTop: '15px', border: '1px solid #fff', padding: '5px', width: 'fit-content' }}>Process 1</div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <div style={{ border: '1px solid #fff', padding: '5px' }}>T1</div>
                    <div style={{ border: '1px solid #fff', padding: '5px' }}>T2</div>
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--surface-2)', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
                  تصویر تخته - دقیقه ۱۵:۲۰
                </div>
              </div>
            </div>

            {/* بخش ۳ فرمول */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '20px', backgroundColor: 'var(--green)', borderRadius: '4px' }}></span>
                ۳. فرمول محاسبه حافظه
              </h2>
              <p style={{ fontSize: '15px', lineHeight: '2', color: 'var(--text-soft)', marginBottom: '15px' }}>
                برای محاسبه فضای مورد نیاز یک فرآیند، از رابطه زیر استفاده می‌شود:
              </p>
              <div style={{ backgroundColor: 'var(--surface-2)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--line)' }}>
                <code style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'serif', color: 'var(--text)' }}>
                  M = P + S
                </code>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>
                  M: حافظه کل | P: اندازه فرآیند | S: فضای پشته
                </div>
              </div>
            </div>

            {/* دکمه دانلود PDF */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
               <button className="button button-primary button-small">
                 <Icon name="arrow" size={16} style={{ marginLeft: '8px' }} /> دانلود جزوه (PDF)
               </button>
            </div>

          </div>
        </div>

        {/* نوار پخش صدا (پایین صفحه) */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--surface)', borderTop: '1px solid var(--line)', padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10 }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={18} style={{ marginLeft: isPlaying ? 0 : '4px' }} />
          </button>
          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '35%', backgroundColor: 'var(--green)', borderRadius: '10px' }}></div>
            <div style={{ position: 'absolute', top: '-5px', left: '35%', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--green)', border: '2px solid #fff' }}></div>
          </div>
          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-soft)' }}>۱۵:۲۰ / ۵۶:۴۰</span>
        </div>

      </main>
    </div>
  );
}