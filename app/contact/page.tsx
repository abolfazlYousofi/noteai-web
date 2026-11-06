import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="site-shell" style={{ minHeight: '100vh', padding: '120px 20px 80px', backgroundColor: 'transparent' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px', textAlign: 'center', color: 'var(--text)' }}>تماس با ما</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginBottom: '30px' }}>سوال یا پیشنهادی دارید؟ برای ما بنویسید.</p>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="text" placeholder="نام و نام خانوادگی" style={{ padding: '15px', borderRadius: '12px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }} />
            <input type="email" placeholder="ایمیل" style={{ padding: '15px', borderRadius: '12px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }} />
            <textarea placeholder="متن پیام..." rows={5} style={{ padding: '15px', borderRadius: '12px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)', resize: 'vertical' }}></textarea>
            <button type="button" className="button button-primary" style={{ padding: '15px' }}>ارسال پیام</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
