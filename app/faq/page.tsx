import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const faqs = [
  { category: 'هوش مصنوعی و پردازش', q: 'آیا کیفیت رونویسی فارسی دقیق است؟', a: 'بله، ما از پیشرفته‌ترین مدل‌های تبدیل گفتار به متن (Whisper) برای زبان فارسی استفاده می‌کنیم که قادر به تشخیص اصطلاحات تخصصی و کلمات انگلیسی در متن فارسی نیز هست. با این حال، توصیه می‌کنیم همیشه متن را یک بار مرور کنید.' },
  { category: 'هوش مصنوعی و پردازش', q: 'چقدر طول می‌کشد تا یک جزوه آماده شود؟', a: 'زمان پردازش بستگی به طول فایل صوتی و ترافیک سرور دارد. معمولاً برای یک کلاس ۹۰ دقیقه‌ای، فرآیند تبدیل و ساخت جزوه بین ۳ تا ۱۰ دقیقه زمان می‌برد. شما می‌توانید سایت را ببندید و بعداً نتیجه را ببینید.' },
  { category: 'حساب کاربری و پرداخت', q: 'آیا امکان ویرایش جزوه وجود دارد؟', a: 'قطعاً. جزوه تولید شده در یک ویرایشگر اختصاصی در اختیار شما قرار می‌گیرد و می‌توانید هر بخشی را که نیاز داشت اصلاح کنید و سپس خروجی PDF بگیرید.' },
  { category: 'حساب کاربری و پرداخت', q: 'چطور می‌توانم سهمیه بیشتری بخرم؟', a: 'شما می‌توانید از صفحه قیمت‌گذاری، یکی از پلن‌های دانشجویی یا حرفه‌ای را خریداری کنید. پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود و سهمیه بلافاصله به حساب شما اضافه می‌شود.' },
  { category: 'حریم خصوصی', q: 'آیا صداهای من جایی منتشر می‌شوند؟', a: 'خیر. تمام فایل‌های صوتی و جزوات شما در فضای ابری خصوصی ذخیره می‌شوند و فقط خود شما به آن دسته دسترسی دارید. ما به هیچ عنوان از داده‌های شما برای آموزش مدل استفاده نمی‌کنیم.' },
  { category: 'حریم خصوصی', q: 'آیا می‌توانم فایل‌هایم را کاملاً حذف کنم؟', a: 'بله. در صفحه داشبورد، گزینه‌ای برای حذف هر جلسه و تمام اطلاعات مرتبط با آن (صوت، متن و جزوه) وجود دارد. پس از حذف، داده‌ها برای همیشه پاک می‌شوند.' },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="site-shell" style={{ minHeight: '100vh', paddingTop: '120px', backgroundColor: 'transparent' }}>
        <section className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 100px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: '20px', color: 'var(--text)' }}>سوالات متداول</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-soft)' }}>پاسخ سوالاتی که ممکن است برای شما هم پیش آمده باشد.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {faqs.map((faq, idx) => (
              <details key={idx} style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', padding: '20px 25px', cursor: 'pointer' }}>
                <summary style={{ fontSize: '16px', fontWeight: 'bold', outline: 'none', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--green)', backgroundColor: 'var(--green-light)', padding: '2px 8px', borderRadius: '10px', width: 'fit-content' }}>{faq.category}</span>
                    {faq.q}
                  </div>
                </summary>
                <p style={{ marginTop: '15px', color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.9, paddingTop: '15px', borderTop: '1px solid var(--line)' }}>{faq.a}</p>
              </details>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <p style={{ color: 'var(--text-soft)' }}>سوال دیگری دارید؟ <a href="/contact" style={{ color: 'var(--green)', fontWeight: 'bold', textDecoration: 'underline' }}>با ما در تماس باشید.</a></p>
          </div>

        </section>
      </main>
      <Footer />
    </>
  );
}