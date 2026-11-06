'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

type IconName = 'book' | 'sun' | 'moon' | 'arrow' | 'menu' | 'close';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<IconName, React.ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/><path d="M9 7h7M9 10h7"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3z"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const navLinks = [
    { name: 'خانه', href: '/' },
    { name: 'ویژگی‌ها', href: '/features' },
    { name: 'قیمت‌گذاری', href: '/pricing' },
    { name: 'درباره ما', href: '/about' },
    { name: 'تماس با ما', href: '/contact' },
    { name: 'سوالات متداول', href: '/faq' },
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <Link href="/" className="brand" aria-label="NoteAI صفحه اصلی">
          <span className="brand-mark"><Icon name="book" size={22}/></span>
          <span>NoteAI</span>
        </Link>

        <button className="mobile-menu-trigger icon-button" type="button" onClick={() => setMobileMenuOpen((v) => !v)}>
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={21}/>
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? 'is-open' : ''}`}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="topbar-actions">
          <button className="theme-switch" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {mounted && (
              <>
                <span className={theme === 'light' ? 'theme-option selected' : 'theme-option'}><Icon name="sun" size={16}/></span>
                <span className={theme === 'dark' ? 'theme-option selected' : 'theme-option'}><Icon name="moon" size={15}/></span>
              </>
            )}
          </button>
          <Link href="/login" className="button button-primary button-small">ورود / ثبت‌نام <Icon name="arrow" size={15}/></Link>
        </div>
      </div>
    </header>
  );
}