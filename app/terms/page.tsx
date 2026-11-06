import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="site-shell" style={{ minHeight: '100vh', padding: '120px 20px 80px', backgroundColor: 'transparent' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px', color: 'var(--text)' }}>قوانین و مقررات</h1>
          <div style={{ fontSize: '15px', lineHeight: '2', color: 'var(--text-soft)' }}>
            <p style={{ marginBottom: '15px' }}>استفاده از خدمات NoteAI به معنای پذیرش این قوانین است.</p>
            <h3 style={{ color: 'var(--text)', margin: '20px 0 10px', fontWeight: 'bold' }}>۱. مسئولیت محتوا</h3>
            <p>کاربران موظف هستند قبل از ضبط هرگونه جلسه، مجوزهای لازم را از استاد و دانشگاه دریافت کنند. NoteAI هیچ مسئولیتی در قبال ضبط غیرمجاز ندارد.</p>
            <h3 style={{ color: 'var(--text)', margin: '20px 0 10px', fontWeight: 'bold' }}>۲. حق نشر</h3>
            <p>محتوای تولید شده (جزوات) متعلق به کاربر است، اما استفاده تجاری از موتور NoteAI بدون مجوز کتبی ممنوع است.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
