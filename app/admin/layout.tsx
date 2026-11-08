import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Home, Users, ShieldAlert, FileAudio, Settings, MessageSquare, Shield, Wallet } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  const role = (session.user as any)?.role;
  const email = session.user?.email;
  const ADMIN_ROLES = ['SUPER_ADMIN', 'SECURITY_ADMIN', 'SYSTEM_ADMIN', 'SUPPORT_AGENT', 'FINANCE_MANAGER', 'CONTENT_MANAGER', 'AI_OPERATIONS_MANAGER', 'AUDITOR'];
  if (!ADMIN_ROLES.includes(role)) redirect('/dashboard');

  // 🆕 فقط تیکت‌هایی که ادمین نخوانده است
  const openTickets = await prisma.ticket.count({ 
    where: { isReadByAdmin: false } 
  });
  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex' }}>
      <aside style={{ width: '260px', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green)' }}>NoteAI Admin</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '5px' }}>{email}</p>
          <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '10px', backgroundColor: 'var(--green-light)', color: 'var(--green)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{role}</span>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Link href="/admin" className="side-item"><Home size={18} /> داشبورد کلی</Link>
          <Link href="/admin/users" className="side-item"><Users size={18} /> مدیریت کاربران</Link>
          
          <Link href="/admin/support" className="side-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={18} /> پشتیبانی
            </div>
            {openTickets > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{openTickets}</span>
            )}
          </Link>

          <Link href="/admin/ai-ops" className="side-item"><FileAudio size={18} /> عملیات هوش مصنوعی</Link>
          <Link href="/admin/security" className="side-item"><ShieldAlert size={18} /> مرکز امنیت</Link>
                    <Link href="/admin/accounting" className="side-item">
            <Wallet size={18} /> حسابداری و مالی
          </Link>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid var(--line)' }}>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
            <button type="submit" className="button button-secondary" style={{ width: '100%' }}>خروج از پنل</button>
          </form>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', backgroundColor: 'var(--surface-2)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}