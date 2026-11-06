import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from 'next-themes';
import ScrollToTop from '@/components/layout/ScrollToTop';

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-vazirmatn' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noteai.example'),
  title: { default: 'NoteAI | دستیار هوشمند جزوه', template: '%s | NoteAI' },
  description: 'با NoteAI صدای کلاس را به متن تبدیل کنید و جزوه بسازید.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060B18',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoteAI',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.variable}>
      <body style={{ fontFamily: 'var(--font-vazirmatn), sans-serif', margin: 0 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        
        {/* ThemeProvider تم را در کل سایت مدیریت می‌کند */}
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <Providers>
            {/* کلاس site-shell به اینجا منتقل شد تا تمام صفحات آن را داشته باشند */}
            <div className="site-shell">
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}