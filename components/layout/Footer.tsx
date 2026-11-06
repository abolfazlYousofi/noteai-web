import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/>
                <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M9 7h7M9 10h7"/>
              </svg>
            </span>
            <span>NoteAI</span>
          </Link>
          <p>دستیار هوشمند یادداشت‌برداری برای دانشجویان</p>
        </div>
        <div className="footer-links">
          <Link href="/pricing">قیمت‌گذاری</Link>
          <Link href="#">قوانین و مقررات</Link>
          <Link href="#">حریم خصوصی</Link>
          <Link href="#">تماس با ما</Link>
        </div>
        <div className="footer-social">
          <a href="#" aria-label="تلگرام">T</a>
          <a href="#" aria-label="اینستاگرام">I</a>
          <a href="#" aria-label="لینکدین">L</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} NoteAI. تمامی حقوق محفوظ است.</span>
        <span>ساخته‌شده برای یادگیری بهتر</span>
      </div>
    </footer>
  );
}