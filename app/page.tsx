'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type IconName = 'book' | 'sun' | 'moon' | 'arrow' | 'mic' | 'image' | 'file' | 'shield' | 'spark' | 'play' | 'plus' | 'search' | 'clock' | 'check' | 'menu' | 'close' | 'chevron' | 'user' | 'star' | 'quote';

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
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" /></>,
    quote: <><path d="M10 11h-4v-4h4v4zm-4 2v4h4v-4h-4zm14-6h-4v4h4v-4zm-4 6v4h4v-4h-4z"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const features: { icon: IconName; title: string; body: string; tint: string }[] = [
  { icon: 'mic', title: 'ضبط با کیفیت بالا', body: 'صدای کلاس را بدون نویز ضبط کنید. سیستم ما مجهز به فیلترهای هوشمند برای حذف صداهای مزاحم است.', tint: 'mint' },
  { icon: 'file', title: 'تبدیل گفتار به متن', body: 'با موتور پیشرفته Whisper، صحبت‌های استاد با دقت بالا و با حفظ اصطلاحات تخصصی به متن تبدیل می‌شود.', tint: 'blue' },
  { icon: 'image', title: 'تحلیل تصاویر تخته', body: 'عکس‌های تخته و اسلایدها را آپلود کنید. هوش مصنوعی فرمول‌ها و نمودارها را استخراج و به متن متصل می‌کند.', tint: 'sage' },
  { icon: 'book', title: 'تولید جزوه ساختاریافته', body: 'خروجی نهایی یک جزوه منظم با سرفصل، بولت‌پوینت و منابع است که کاملاً قابل ویرایش و دانلود است.', tint: 'gold' },
];

const faqs = [
  { q: 'آیا کیفیت رونویسی فارسی دقیق است؟', a: 'بله، ما از پیشرفته‌ترین مدل‌های تبدیل گفتار به متن برای زبان فارسی استفاده می‌کنیم که قادر به تشخیص اصطلاحات تخصصی و کلمات انگلیسی در متن فارسی نیز هست.' },
  { q: 'آیا امکان ویرایش جزوه وجود دارد؟', a: 'قطعاً. جزوه تولید شده در یک ویرایشگر اختصاصی در اختیار شما قرار می‌گیرد و می‌توانید هر بخشی را که نیاز داشت اصلاح کنید و سپس خروجی PDF بگیرید.' },
  { q: 'چطور می‌توانم پردازش را شروع کنم؟', a: 'کافیست در حساب کاربری خود ثبت‌نام کنید، به بخش ضبط جدید بروید، صدای کلاس را ضبط کنید و دکمه پردازش را بزنید. تمام!' },
  { q: 'حریم خصوصی جلسات من چگونه تضمین می‌شود؟', a: 'تمامی فایل‌های صوتی و جزوات در فضای ابری خصوصی و رمزنگاری‌شده ذخیره می‌شوند و فقط شما به آن‌ها دسترسی دارید. در صورت تمایل می‌توانید فایل‌ها را برای همیشه حذف کنید.' },
];

export default function HomePage() {
  return (
    <>
      <Header />
      
      <main id="main" style={{ paddingTop: '72px' }}>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-background" aria-hidden="true"><span className="hero-orb orb-one"/><span className="hero-orb orb-two"/></div>
          <div className="container hero-grid">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="hero-copy"
            >
              <span className="eyebrow"><Icon name="spark" size={15}/> دستیار هوشمند دانشجویان</span>
              <h1>از کلاس تا جزوه، <br/><span>فقط با یک کلیک</span></h1>
              <p className="hero-description">
                دیگر نگران از دست رفتن نکات کلاس نباشید. صدای استاد را ضبط کنید، از تخته عکس بگیرید و بگذارید هوش مصنوعی NoteAI یک جزوه تمیز و منظم برایتان بسازد.
              </p>
              <div className="hero-actions">
                <Link href="/login" className="button button-primary button-large">شروع رایگان <Icon name="arrow" size={18}/></Link>
                <a className="button button-secondary button-large" href="#how-it-works"><Icon name="play" size={17}/> دیدن دمو</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', color: 'var(--text-soft)', fontSize: '13px' }}>
                <div style={{ display: 'flex', color: '#EAB308' }}>
                  <Icon name="star" size={14}/><Icon name="star" size={14}/><Icon name="star" size={14}/><Icon name="star" size={14}/><Icon name="star" size={14}/>
                </div>
                <span>مورد اعتماد بیش از ۵,۰۰۰ دانشجو در دانشگاه‌های برتر</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-visual" aria-label="پیش‌نمایش نمونه جزوه"
            >
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
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '4px 12px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '20px', fontWeight: 'bold' }}>صدا</span>
                      <span style={{ fontSize: '11px', padding: '4px 12px', color: 'var(--text-soft)' }}>تصاویر</span>
                      <span style={{ fontSize: '11px', padding: '4px 12px', color: 'var(--text-soft)' }}>جزوه</span>
                    </div>

                    <div className="timeline-row"><span className="timeline-time">۱۲:۳۴</span><span className="timeline-dot"/><span>مقدمه‌ای بر مفهوم فرآیند در سیستم‌عامل</span></div>
                    <div className="timeline-row"><span className="timeline-time">۱۵:۲۰</span><span className="timeline-dot"/><span>تفاوت فرآیند و رشته (Thread)</span></div>
                    <div className="timeline-row selected-row"><span className="timeline-time">۲۲:۱۰</span><span className="timeline-dot"/><span>مثال عملی از مدیریت حافظه</span></div>
                    <div className="timeline-row"><span className="timeline-time">۳۵:۴۲</span><span className="timeline-dot"/><span>بررسی الگوریتم‌های زمان‌بندی</span></div>

                    <div className="audio-player">
                      <span className="audio-play" aria-hidden="true"><Icon name="play" size={13}/></span>
                      <div className="waveform" aria-hidden="true">
                        {Array.from({length: 30}, (_, i) => <i key={i} style={{height: `${10 + ((i * 17 + 5) % 25)}px`, backgroundColor: i < 10 ? 'var(--green)' : 'var(--line)'}}/> )}
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
                      <p style={{ fontSize: '9px', color: 'var(--text-soft)', lineHeight: '1.8', margin: '0 0 8px 0' }}>
                        مدیریت حافظه نقش بسیار مهمی در بهره‌وری سیستم‌عامل دارد...
                      </p>
                      <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--line)', textAlign: 'center', fontFamily: 'serif', fontSize: '12px', fontWeight: 'bold' }}>
                        M = P + S
                      </div>
                    </div>
                  </div>
                </div>
                <div className="window-bottom"><span><Icon name="check" size={12}/> آخرین ذخیره: همین الان</span><span>قابل ویرایش</span></div>
              </div>
              
              <div className="floating-note floating-note-top">
                <span className="floating-note-icon"><Icon name="image" size={17}/></span>
                <div><strong>تصویر تخته</strong><small>متصل به دقیقه ۱۵:۲۰</small></div>
                <span className="tiny-check"><Icon name="check" size={12}/></span>
              </div>
              <div className="floating-note floating-note-bottom">
                <span className="floating-note-icon mint-icon"><Icon name="file" size={17}/></span>
                <div><strong>جزوه ساختاریافته</strong><small>آماده مطالعه</small></div>
                <span className="tiny-check"><Icon name="check" size={12}/></span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Bar (نوار اعتماد) */}
        <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface)', padding: '20px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '15px', fontWeight: 'bold' }}>مورد اعتماد دانشجویان از دانشگاه‌های سراسری</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.6 }}>
            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'serif' }}>University of Tehran</span>
            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'serif' }}>Sharif University</span>
            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'serif' }}>Amirkabir</span>
          </div>
        </div>

        {/* Features Section */}
        <section className="feature-strip" id="features" style={{ padding: '80px 0' }}>
          <div className="container">
            <div className="section-heading" style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="section-kicker">چرا NoteAI؟</span>
              <h2 style={{ fontSize: '32px', fontWeight: 900 }}>هوش مصنوعی در خدمت یادگیری شما</h2>
              <p style={{ color: 'var(--text-soft)', maxWidth: '600px', margin: '10px auto' }}>ما فرآیند خسته‌کننده جزوه‌نویسی را به یک تجربه سریع و لذت‌بخش تبدیل کرده‌ایم.</p>
            </div>
            
            <div className="feature-strip-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              {features.map((feature, idx) => (
                <motion.article 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  className="strip-feature" key={feature.title} style={{ display: 'flex', flexDirection: 'column', padding: '30px', backgroundColor: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--line)' }}
                >
                  <div className={`feature-icon ${feature.tint}`} style={{ marginBottom: '20px', backgroundColor: 'var(--surface-2)', color: 'var(--green)' }}><Icon name={feature.icon} size={24}/></div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{feature.title}</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-soft)', lineHeight: 1.8 }}>{feature.body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="workflow-section" id="how-it-works" style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
          <div className="container">
            <div className="section-heading" style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="section-kicker">در ۳ مرحله ساده</span>
              <h2 style={{ fontSize: '32px', fontWeight: 900 }}>از کلاس تا جزوه</h2>
            </div>
            <div className="workflow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              <article className="workflow-step" style={{ textAlign: 'center' }}>
                <div className="step-top" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <span className="step-icon" style={{ width: '60px', height: '60px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size={28}/></span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>۱. ضبط صدا و عکس</h3>
                <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8 }}>با یک کلیک شروع به ضبط کنید و در حین تدریس از اسلایدها یا تخته عکس بگیرید.</p>
              </article>
              <article className="workflow-step" style={{ textAlign: 'center' }}>
                <div className="step-top" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <span className="step-icon" style={{ width: '60px', height: '60px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="spark" size={28}/></span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>۲. پردازش هوشمند</h3>
                <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8 }}>هوش مصنوعی صدا را به متن تبدیل کرده و ارتباط تصاویر با مفاهیم را پیدا می‌کند.</p>
              </article>
              <article className="workflow-step" style={{ textAlign: 'center' }}>
                <div className="step-top" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <span className="step-icon" style={{ width: '60px', height: '60px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={28}/></span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>۳. دریافت جزوه</h3>
                <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8 }}>یک جزوه منظم، ساختاریافته و قابل ویرایش را تحویل بگیرید و برای مطالعه آماده شوید.</p>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container" id="faq" style={{ padding: '80px 20px', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px' }}>سوالات متداول</h2>
            <p style={{ color: 'var(--text-soft)' }}>پاسخ سوالات رایج شما درباره NoteAI</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {faqs.map((faq, idx) => (
              <details key={idx} style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', padding: '20px', cursor: 'pointer' }}>
                <summary style={{ fontSize: '16px', fontWeight: 'bold', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <Icon name="chevron" size={20} />
                </summary>
                <p style={{ marginTop: '15px', color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.8 }}>{faq.a}</p>
              </details>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/faq" className="button button-secondary">مشاهده تمام سوالات متداول</Link>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: '80px 20px', position: 'relative' }}>
          <div 
            style={{ 
              maxWidth: '1050px', margin: '0 auto', background: 'linear-gradient(135deg, #133f32, #1b5341 50%, #204d3e)', 
              borderRadius: '32px', padding: 'clamp(40px, 6vw, 70px) 20px', textAlign: 'center', 
              position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(22, 77, 62, 0.3)'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(138deg, transparent 0 35px, rgba(255,255,255,0.05) 36px 37px)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, marginBottom: '20px', color: '#fff', lineHeight: 1.4 }}>
                وقت کلاس را صرف یادگیری کنید، نه نوشتن!
              </h2>
              <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.8 }}>
                همین حالا به هزاران دانشجویی بپیوندید که با NoteAI تجربه یادگیری متفاوتی داشته‌اند. اولین جزوه خود را در کمتر از ۵ دقیقه بسازید.
              </p>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/login" style={{ backgroundColor: '#fff', color: '#133f32', padding: '16px 40px', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} className="hover:-translate-y-1 hover:shadow-lg">
                  شروع رایگان
                </Link>
                <Link href="/pricing" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: '16px 40px', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', transition: 'all 0.3s ease' }} className="hover:bg-white/20">
                  مشاهده تعرفه‌ها
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}