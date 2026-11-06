import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="site-shell" style={{ minHeight: '100vh', paddingTop: '120px', backgroundColor: 'transparent' }}>
        
        <section className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 80px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: '20px', color: 'var(--text)' }}>داستان ما</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-soft)', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto' }}>
              NoteAI از یک درد مشترک متولد شد: خستگی ناشی از نوشتن بی‌پایان در کلاس‌ها و از دست رفتن نکاتی که استاد می‌گفت در حالی که ما سرمان پای دفتر بود.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--green)' }}>چشم‌انداز ما</h2>
              <p style={{ color: 'var(--text-soft)', lineHeight: '2', fontSize: '15px' }}>
                ما معتقدیم که فناوری باید به جای پیچیده‌تر کردن زندگی، آن را ساده‌تر کند. هدف ما این است که تا سال ۲۰۲۸، NoteAI به دستیار اصلی یادگیری برای بیش از یک میلیون دانشجوی فارسی‌زبان در سراسر جهان تبدیل شود تا هیچ دانشجویی به خاطر وقت‌گیر بودن جزوه‌نویسی، از عمق یادگیری غافل نشود.
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--green)' }}>تیم ما</h2>
              <p style={{ color: 'var(--text-soft)', lineHeight: '2', fontSize: '15px' }}>
                ما تیمی از مهندسان نرم‌افزار، متخصصان هوش مصنوعی و طراحان تجربه کاربری هستیم که همگی روزی دانشجو بوده‌ایم. ما می‌دانیم که در یک کلاس ۹۰ دقیقه‌ای چه چالش‌هایی وجود دارد و تمام تلاش خود را کرده‌ایم تا ابزاری بسازیم که ای کاش در دوران دانشجویی خودمان داشتیم.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-2)', padding: '50px', borderRadius: '32px', textAlign: 'center', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px', color: 'var(--text)' }}>ارزش‌های ما</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '30px' }}>
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)' }}>حریم خصوصی</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-soft)' }}>داده‌های شما امانت است و ما هرگز آن را برای آموزش مدل یا فروش استفاده نمی‌کنیم.</p>
              </div>
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)' }}>شفافیت</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-soft)' }}>ما صادقانه می‌گوییم که هوش مصنوعی ممکن است اشتباه کند و همیشه به شما حق ویرایش را می‌دهیم.</p>
              </div>
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)' }}>دسترس‌پذیری</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-soft)' }}>ما می‌خواهیم این فناوری برای همه دانشجویان با هر بودجه‌ای در دسترس باشد.</p>
              </div>
            </div>
          </div>

        </section>
      </main>
      <Footer />
    </>
  );
}