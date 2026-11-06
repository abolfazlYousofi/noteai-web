import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const features = [
  { icon: '🎙️', title: 'ضبط مستقیم در مرورگر', desc: 'بدون نیاز به نصب هیچ اپلیکیشنی، مستقیماً از مرورگر گوشی یا لپ‌تاپ خود صدای کلاس را با بالاترین کیفیت ضبط کنید. موتور ضبط ما قادر است حتی در صورت قطعی لحظه‌ای اینترنت، فایل شما را بازیابی کند.' },
  { icon: '🧠', title: 'هوش مصنوعی پیشرفته', desc: 'ما از مدل‌های پیشرفته Whisper برای تبدیل گفتار فارسی به متن و از GPT-4 برای ساختاردهی به جزوه استفاده می‌کنیم. هوش مصنوعی ما قادر است اصطلاحات تخصصی و کلمات انگلیسی را به درستی تشخیص دهد.' },
  { icon: '🖼️', title: 'اتصال هوشمند تصاویر', desc: 'دیگر نیازی به کپی کردن دستی فرمول‌ها نیست. با آپلود عکس از تخته یا اسلایدها، هوش مصنوعی ما متن، نمودار و فرمول‌های داخل تصویر را استخراج کرده و در جای مناسب جزوه قرار می‌دهد.' },
  { icon: '✨', title: 'حذف مطالب غیرضروری', desc: 'الگوریتم‌های ما به گونه‌ای آموزش دیده‌اند که سوالات بی‌ربط دانشجویان، خنده‌ها و مکث‌های طولانی را حذف کرده و فقط بر روی «نکات طلایی» و توضیحات اصلی استاد تمرکز کنند.' },
  { icon: '✏️', title: 'ویرایشگر اختصاصی جزوه', desc: 'خروجی شما یک متن خام نیست. شما یک ویرایشگر کامل با قابلیت اعمال استایل‌ها، بولت‌پوینت‌ها و اصلاح بخش‌های مختلف در اختیار دارید تا جزوه را دقیقاً همان‌طور که می‌خواهید شخصی‌سازی کنید.' },
  { icon: '📄', title: 'خروجی PDF با کیفیت', desc: 'با یک کلیک، جزوه خود را با فرمت استاندارد، فونت صحیح و چیدمان راست‌چین به صورت فایل PDF دانلود کنید تا بتوانید آن را چاپ کرده یا در موبایل خود مطالعه کنید.' },
];

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="site-shell" style={{ minHeight: '100vh', paddingTop: '120px', backgroundColor: 'transparent' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '0 20px 60px' }}>
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: '20px', color: 'var(--text)' }}>
              قدرت گرفته از <span style={{ color: 'var(--green)' }}>هوش مصنوعی</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-soft)', lineHeight: '1.8' }}>
              NoteAI تنها یک ضبط‌کننده نیست. این یک دستیار یادگیری کامل است که به شما کمک می‌کند تا زمان خود را به جای نوشتن، صرف فهمیدن کنید.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '40px 30px', backgroundColor: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--line)', transition: 'transform 0.2s', cursor: 'default' }} className="hover:-translate-y-2">
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-soft)', lineHeight: '1.9', fontSize: '14px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '60px 20px 100px' }}>
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--surface-2)', padding: '50px 30px', borderRadius: '32px', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text)' }}>آماده‌اید امتحان کنید؟</h2>
            <p style={{ color: 'var(--text-soft)', marginBottom: '30px' }}>همین حالا یک حساب کاربری رایگان بسازید و اولین جزوه هوشمند خود را تولید کنید.</p>
            <Link href="/login" className="button button-primary" style={{ padding: '15px 40px', fontSize: '16px' }}>شروع رایگان</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}