import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="site-shell" style={{ minHeight: '100vh', padding: '120px 20px 80px', backgroundColor: 'transparent' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px', color: 'var(--text)' }}>حریم خصوصی</h1>
          <div style={{ fontSize: '15px', lineHeight: '2', color: 'var(--text-soft)' }}>
            <p style={{ marginBottom: '15px' }}>امنیت داده‌های شما برای ما در اولویت است.</p>
            <h3 style={{ color: 'var(--text)', margin: '20px 0 10px', fontWeight: 'bold' }}>۱. ذخیره‌سازی داده‌ها</h3>
            <p>فایل‌های صوتی و تصویری شما به صورت رمزنگاری‌شده در سرورهای ابری امن ذخیره می‌شوند و فقط شما به آن‌ها دسترسی دارید.</p>
            <h3 style={{ color: 'var(--text)', margin: '20px 0 10px', fontWeight: 'bold' }}>۲. استفاده از هوش مصنوعی</h3>
            <p>ما از داده‌های شما برای آموزش مدل‌هایمان استفاده نمی‌کنیم. پردازش‌ها به صورت موقت انجام شده و پس از تولید جزوه، فایل‌های موقت پاک می‌شوند.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
