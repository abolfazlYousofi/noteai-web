import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Home, Mic, FileText, Settings, CreditCard, Shield, MessageSquare } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

    // 🆕 فقط تیکت‌هایی که کاربر نخوانده است
  const unreadTickets = await prisma.ticket.count({
    where: { userId: session.user.id, isReadByUser: false }
  });

  const userRole = (session.user as any)?.role;
  const isAdmin = ['SUPER_ADMIN', 'SECURITY_ADMIN', 'SYSTEM_ADMIN', 'SUPPORT_AGENT', 'FINANCE_MANAGER', 'CONTENT_MANAGER', 'AI_OPERATIONS_MANAGER', 'AUDITOR'].includes(userRole);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>N</div>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)' }}>NoteAI</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="side-item"><Home size={18} /> داشبورد</Link>
          <Link href="/dashboard/record" className="side-item"><Mic size={18} /> ضبط جدید</Link>
          <Link href="/dashboard/notes" className="side-item"><FileText size={18} /> جزوات من</Link>
          <Link href="/dashboard/billing" className="side-item"><CreditCard size={18} /> اشتراک من</Link>
          
          <div style={{ height: '1px', backgroundColor: 'var(--line)', margin: '15px 0' }}></div>
          
          <Link href="/dashboard/support" className="side-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={18} /> پشتیبانی
            </div>
            {unreadTickets > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{unreadTickets}</span>
            )}
          </Link>

          <Link href="/dashboard/settings" className="side-item"><Settings size={18} /> تنظیمات</Link>
          {isAdmin && (
            <Link href="/admin" className="side-item" style={{ color: 'var(--green)', fontWeight: 'bold' }}>
              <Shield size={18} /> پنل مدیریت
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <p style={{ fontSize: '12px', color: 'var(--text-soft)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={session.user?.email || ''}>
            {session.user?.email}
          </p>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
            <button type="submit" className="button button-secondary" style={{ padding: '8px', fontSize: '13px', width: '100%' }}>خروج از حساب</button>
          </form>
        </div>
      </aside>

      <main className="dashboard-main">
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>

      <nav className="mobile-bottom-nav">
        <Link href="/dashboard"><Home /> داشبورد</Link>
        <Link href="/dashboard/record"><Mic /> ضبط</Link>
        <Link href="/dashboard/notes"><FileText /> جزوات</Link>
        <Link href="/dashboard/settings"><Settings /> تنظیمات</Link>
      </nav>
    </div>
  );
}