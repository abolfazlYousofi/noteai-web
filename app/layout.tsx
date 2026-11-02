import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noteai.example'),
  title: {
    default: 'NoteAI | از شنیدن درس تا فهمیدن عمیق‌تر',
    template: '%s | NoteAI',
  },
  description:
    'با NoteAI صدای کلاس را به متن تبدیل کنید، از تخته عکس بگیرید و جزوه‌ای ساختاریافته و قابل ویرایش بسازید.',
  applicationName: 'NoteAI',
  keywords: [
    'جزوه هوشمند',
    'تبدیل صدا به متن فارسی',
    'ضبط کلاس دانشگاه',
    'هوش مصنوعی دانشجویی',
    'تولید جزوه با هوش مصنوعی',
    'تبدیل صدای استاد به جزوه',
    'جزوه نویسی خودکار',
  ],
  openGraph: {
    title: 'NoteAI | از شنیدن درس تا فهمیدن عمیق‌تر',
    description: 'صدای کلاس، عکس تخته و اسلایدها را به یک جزوه منظم تبدیل کنید.',
    locale: 'fa_IR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8f6ef',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Structured Data (JSON-LD) for SEO - Section 19.4
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoteAI',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: 'دستیار هوشمند جزوه‌نویسی برای دانشجویان. تبدیل صدای کلاس و عکس تخته به جزوه ساختاریافته با هوش مصنوعی.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IRR',
    },
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        {/* تزریق داده‌های ساختاریافته برای گوگل */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}