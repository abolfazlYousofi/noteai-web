import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // جلوگیری از Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // جلوگیری از حدس نوع فایل
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // اجبار به استفاده از HTTPS
          },
        ],
      },
    ];
  },
};

export default nextConfig;