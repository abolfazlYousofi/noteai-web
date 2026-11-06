'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // ۱. اسکرول پنجره به بالا
    window.scrollTo(0, 0);
    
    // ۲. اسکرول مستقیم تگ‌های ریشه (برای اطمینان صد در صد)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}