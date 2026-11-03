import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = [
  'SUPER_ADMIN', 'SECURITY_ADMIN', 'SYSTEM_ADMIN', 'SUPPORT_AGENT', 
  'FINANCE_MANAGER', 'CONTENT_MANAGER', 'AI_OPERATIONS_MANAGER', 'AUDITOR'
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const userRole = req.auth?.user?.role;

  if (path.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (path.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.nextUrl));
    if (!ADMIN_ROLES.includes(userRole as string)) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  }

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