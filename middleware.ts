import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// لیست نقش‌های مجاز برای ورود به پنل ادمین (طبق بخش 6.1 سند)
const ADMIN_ROLES = [
  'SUPER_ADMIN', 
  'SECURITY_ADMIN', 
  'SYSTEM_ADMIN', 
  'SUPPORT_AGENT', 
  'FINANCE_MANAGER', 
  'CONTENT_MANAGER', 
  'AI_OPERATIONS_MANAGER', 
  'AUDITOR'
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const userRole = req.auth?.user?.role;

  // ۱. محافظت از داشبورد
  if (path.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // ۲. محافظت از پنل ادمین (بررسی لاگین بودن و داشتن نقش ادمین)
  if (path.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
    if (!ADMIN_ROLES.includes(userRole as string)) {
      // اگر دانشجو بود، به داشبورد خودش برگردد
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  }

  // ۳. هدایت کاربران لاگین‌کرده از صفحات لاگین/ثبت‌نام
  if (isLoggedIn && (path === '/login' || path === '/register')) {
    if (ADMIN_ROLES.includes(userRole as string)) {
      return NextResponse.redirect(new URL('/admin', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};