'use client';

import { useEffect, useState } from 'react';

type IconName = 'book' | 'sun' | 'moon' | 'arrow' | 'mic' | 'image' | 'file' | 'shield' | 'spark' | 'play' | 'plus' | 'search' | 'clock' | 'check' | 'menu' | 'close' | 'chevron' | 'user';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const paths: Record<IconName, React.ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/><path d="M9 7h7M9 10h7"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3z"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    mic: <><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></>,
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const features: { icon: IconName; title: string; body: string; tint: string }[] = [
  { icon: 'mic', title: 'ضبط کلاس', body: 'صدا را با کیفیت بالا ضبط کن و همزمان از تخته و اسلایدها عکس بگیر.', tint: 'mint' },
  { icon: 'file', title: 'تبدیل گفتار به متن', body: 'با هوش مصنوعی، صحبت‌های استاد به متن دقیق و قابل جستجو تبدیل می‌شود.', tint: 'blue' },
  { icon: 'image', title: 'تحلیل تصاویر و تطبیق با متن', body: 'تصاویر تخته و اسلایدها تحلیل شده و در جای مناسب به جزوه اضافه می‌شوند.', tint: 'sage' },
  { icon: 'book', title: 'تولید جزوه ساختاریافته', body: 'یک جزوه کامل با عنوان‌بندی، نکات مهم، فرمول‌ها و منابع مرتبط دریافت کن.', tint: 'gold' },
];

export default function HomePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('noteai-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    window.localStorage.setItem('noteai-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');

  return (
    <div className="site-shell" data-theme={theme}>
      <a href="#main" className="skip-link">رفتن به محتوای اصلی</a>
      
      <header className="topbar">
        <div className="topbar-inner container">
          <a className="brand" href="#home" aria-label="NoteAI صفحه اصلی">
            <span className="brand-mark"><Icon name="book" size={22}/></span>
            <span>NoteAI</span>
          </a>

          <button className="mobile-menu-trigger icon-button" type="button" onClick={() => setMobileMenuOpen((v) => !v)} aria-label={mobileMenuOpen ? 'بستن منو' : 'بازکردن منو'} aria-expanded={mobileMenuOpen}>
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={21}/>
          </button>

          <nav className={`nav-links ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="ناوبری اصلی">
            <a className="active" href="#home" onClick={() => setMobileMenuOpen(false)}>خانه</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>ویژگی‌ها</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>قیمت‌گذاری</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>سؤالات متداول</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>درباره ما</a>
          </nav>

          <div className="topbar-actions">
            <button className="theme-switch" type="button" onClick={toggleTheme} aria-label="تغییر تم">
              <span className={theme === 'light' ? 'theme-option selected' : 'theme-option'}><Icon name="sun" size={16}/></span>
              <span className={theme === 'dark' ? 'theme-option selected' : 'theme-option'}><Icon name="moon" size={15}/></span>
            </button>
            <a href="#start" className="button button-primary button-small">شروع کنید <Icon name="arrow" size={15}/></a>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-background" aria-hidden="true"><span className="hero-orb orb-one"/><span className="hero-orb orb-two"/></div>
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><Icon name="spark" size={15}/> دستیار هوشمند دانشجویان</span>
              <h1>جزوه‌ات، دقیقاً مثل<br/><span>یک کتاب مرتب</span></h1>
              <p className="hero-description">با ضبط کلاس، گرفتن عکس از تخته و اسلایدها و هوش مصنوعی، جزوه‌های کامل و ساختاریافته بساز. تمرکزت روی یادگیری باشد، نه نوشتن.</p>
              <div className="hero-actions">
                <a className="button button-primary button-large" href="#start">شروع کنید <Icon name="arrow" size={18}/></a>
                <a className="button button-secondary button-large" href="#how-it-works"><Icon name="play" size={17}/> دموی کوتاه</a>
              </div>
            </div>

            <div className="hero-visual" aria-label="پیش‌نمایش نمونه جزوه">
              <div className="desk-decoration" aria-hidden="true">
                <div className="plant-pot"><span className="leaf leaf-a"/><span className="leaf leaf-b"/><span className="leaf leaf-c"/><span className="plant-stem"/></div>
                <div className="book-stack"><span>Computer Science</span><span>Mathematics</span><span>Engineering</span></div>
                <div className="desk-paper"/><div className="desk-pencil"/>
              </div>
              
              <div className="app-window">
                <div className="window-top">
                  <div className="window-brand"><span className="mini-mark"><Icon name="book" size={13}/></span> NoteAI</div>
                  <div className="search-bar"><Icon name="search" size={13}/> جست‌وجو در جزوه‌ها...</div>
                  <div className="window-user"><Icon name="user" size={14}/> دانشجو</div>
                </div>
                
                <div className="dashboard-layout">
                  <aside className="dashboard-sidebar">
                    <span className="side-item"><Icon name="file" size={14}/> داشبورد</span>
                    <span className="side-item selected"><Icon name="mic" size={14}/> جزوه‌ها</span>
                    <span className="side-item"><Icon name="plus" size={14}/> ضبط جدید</span>
                    <span className="side-item"><Icon name="image" size={14}/> تصاویر</span>
                    <span className="side-item"><Icon name="shield" size={14}/> تنظیمات</span>
                  </aside>
                  
                  <div className="dashboard-main">
                    <div className="lesson-heading">
                      <div>
                        <small>سیستم‌های عامل - جلسه ۳</small>
                        <strong>جزوه درس امروز</strong>
                      </div>
                      <span className="lesson-date">۲۲ مهر ۱۴۰۳ · ۵۶ دقیقه</span>
                    </div>
                    
                    {/* تب‌های بالا */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '4px 12px', backgroundColor: '#e8f0e9', color: '#164d3e', borderRadius: '20px', fontWeight: 'bold' }}>صدا</span>
                      <span style={{ fontSize: '11px', padding: '4px 12px', color: '#6b7280' }}>تصاویر</span>
                      <span style={{ fontSize: '11px', padding: '4px 12px', color: '#6b7280' }}>جزوه</span>
                    </div>

                    <div className="timeline-row"><span className="timeline-time">۱۲:۳۴</span><span className="timeline-dot"/><span>مقدمه‌ای بر مفهوم فرآیند در سیستم‌عامل</span></div>
                    <div className="timeline-row"><span className="timeline-time">۱۵:۲۰</span><span className="timeline-dot"/><span>تفاوت فرآیند و رشته (Thread)</span></div>
                    <div className="timeline-row selected-row"><span className="timeline-time">۲۲:۱۰</span><span className="timeline-dot"/><span>مثال عملی از مدیریت حافظه</span></div>
                    <div className="timeline-row"><span className="timeline-time">۳۵:۴۲</span><span className="timeline-dot"/><span>بررسی الگوریتم‌های زمان‌بندی</span></div>
                    <div className="timeline-row"><span className="timeline-time">۴۸:۱۵</span><span className="timeline-dot"/><span>جمع‌بندی و سوالات پایانی</span></div>

                    <div className="audio-player">
                      <span className="audio-play" aria-hidden="true"><Icon name="play" size={13}/></span>
                      <div className="waveform" aria-hidden="true">
                        {Array.from({length: 30}, (_, i) => <i key={i} style={{height: `${10 + ((i * 17 + 5) % 25)}px`, backgroundColor: i < 10 ? '#164d3e' : '#d1d5db'}}/> )}
                      </div>
                      <span>۲۲:۱۰ / ۵۶:۴۰</span>
                    </div>
                  </div>
                  
                  <div className="dashboard-sidecards">
                    <div className="board-photo">
                      <div className="board-header">Process</div>
                      <div className="board-lines"><span/><span/><span/><i/></div>
                      <small>تصویر تخته · ۱۵:۲۰</small>
                    </div>
                    <div className="summary-card">
                      <div className="summary-title"><Icon name="spark" size={14}/> مدیریت حافظه</div>
                      <p style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.8', margin: '0 0 8px 0' }}>
                        مدیریت حافظه نقش بسیار مهمی در بهره‌وری سیستم‌عامل دارد. حافظه را می‌توان به دو بخش اصلی تقسیم کرد: حافظه اصلی و حافظه مجازی.
                      </p>
                      <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb', textAlign: 'center', fontFamily: 'serif', fontSize: '12px', fontWeight: 'bold' }}>
                        M = P + S
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="window-bottom"><span><Icon name="check" size={12}/> آخرین ذخیره: همین الان</span><span>جزوه قابل ویرایش</span></div>
              </div>
              
              <div className="floating-note floating-note-top">
                <span className="floating-note-icon"><Icon name="image" size={17}/></span>
                <div><strong>تصویر تخته</strong><small>متصل به دقیقه ۱۵:۲۰</small></div>
                <span className="tiny-check"><Icon name="check" size={12}/></span>
              </div>
              <div className="floating-note floating-note-bottom">
                <span className="floating-note-icon mint-icon"><Icon name="file" size={17}/></span>
                <div><strong>جزوه ساختاریافته</strong><small>آماده مطالعه و ویرایش</small></div>
                <span className="tiny-check"><Icon name="check" size={12}/></span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Strip */}
        <section className="feature-strip" id="features">
          <div className="container feature-strip-grid">
            {features.map((feature) => (
              <article className="strip-feature" key={feature.title}>
                <div className={`feature-icon ${feature.tint}`}><Icon name={feature.icon} size={22}/></div>
                <div><h2>{feature.title}</h2><p>{feature.body}</p></div>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="workflow-section" id="how-it-works">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">ساده، از شروع تا جزوه</span>
              <h2>در ۳ مرحله به جزوه برس</h2>
              <p>از لحظه ضبط کلاس تا جزوه‌ای مرتب، مسیرت ساده می‌ماند.</p>
            </div>
            <div className="workflow-grid">
              <article className="workflow-step">
                <div className="step-top"><span className="step-icon"><Icon name="mic" size={23}/></span><span className="step-number">۱</span></div>
                <h3>ضبط کلاس</h3>
                <p>یک درس جدید بساز و ضبط صدا را شروع کن. هنگام تدریس می‌توانی از تخته یا اسلایدها عکس بگیری.</p>
              </article>
              <span className="step-arrow" aria-hidden="true">←</span>
              <article className="workflow-step">
                <div className="step-top"><span className="step-icon"><Icon name="spark" size={23}/></span><span className="step-number">۲</span></div>
                <h3>پردازش با هوش مصنوعی</h3>
                <p>صدا به متن تبدیل می‌شود و تصویرها برای قرارگرفتن در بخش مرتبط جزوه آماده می‌شوند.</p>
              </article>
              <span className="step-arrow" aria-hidden="true">←</span>
              <article className="workflow-step">
                <div className="step-top"><span className="step-icon"><Icon name="file" size={23}/></span><span className="step-number">۳</span></div>
                <h3>مشاهده و دریافت جزوه</h3>
                <p>جزوه‌ای ساختاریافته می‌گیری که می‌توانی آن را بررسی، ویرایش و در قالب PDF دریافت کنی.</p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" id="pricing">
          <div className="container cta-panel" id="start">
            <div className="cta-illustration" aria-hidden="true">
              <div className="book-drawing"><span/><span/><span/></div>
              <span className="cta-spark"><Icon name="spark" size={36}/></span>
            </div>
            <div className="cta-copy">
              <span className="cta-overline">یادگیری بهتر، با نوشتن کمتر</span>
              <h2>آماده‌ای تجربه‌ی متفاوتی از یادگیری داشته باشی؟</h2>
              <p>همین حالا شروع کن و اولین جزوه‌ات را بساز.</p>
            </div>
            <a href="/recorder" className="button cta-button">شروع کنید <Icon name="arrow" size={16}/></a>
            
            {/* متن مورب انگلیسی سمت چپ */}
            <div style={{ position: 'absolute', left: '20px', bottom: '20px', transform: 'rotate(-15deg)', opacity: 0.6, color: '#fff', fontSize: '12px', fontFamily: 'sans-serif', textAlign: 'left', lineHeight: 1.5 }}>
              <div>Better Notes</div>
              <div>Better Learning</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer" id="faq">
        <div className="container footer-main">
          <div className="footer-brand-block">
            <a className="brand" href="#home"><span className="brand-mark"><Icon name="book" size={21}/></span><span>NoteAI</span></a>
            <p>دستیار هوشمند یادداشت‌برداری</p>
          </div>
          <div className="footer-links">
            <a href="#features">ویژگی‌ها</a>
            <a href="#how-it-works">نحوه کار</a>
            <a href="#pricing">قیمت‌گذاری</a>
            <a href="#faq">سؤالات متداول</a>
          </div>
          <div className="footer-social">
            <a href="#faq" aria-label="لینک شبکه اجتماعی">in</a>
            <a href="#faq" aria-label="لینک شبکه اجتماعی">◎</a>
            <a href="#faq" aria-label="لینک شبکه اجتماعی">↗</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} NoteAI. تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده برای یادگیری بهتر</span>
        </div>
      </footer>
    </div>
  );
}