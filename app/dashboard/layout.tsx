import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  const userRole = (session.user as any)?.role;
  const isAdmin = ['SUPER_ADMIN', 'SECURITY_ADMIN', 'SYSTEM_ADMIN', 'SUPPORT_AGENT', 'FINANCE_MANAGER', 'CONTENT_MANAGER', 'AI_OPERATIONS_MANAGER', 'AUDITOR'].includes(userRole);

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'transparent' }}>
      
      {/* سایدبار سمت راست */}
      <aside style={{ width: '260px', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
        
        {/* لوگو */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>N</div>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)' }}>NoteAI</span>
          </Link>
        </div>

        {/* منوی اصلی */}
        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Link href="/dashboard" className="side-item">
            <span style={{ fontSize: '18px' }}>🏠</span> داشبورد
          </Link>
          <Link href="/dashboard/record" className="side-item">
            <span style={{ fontSize: '18px' }}>🎙️</span> ضبط جدید
          </Link>
          <Link href="/dashboard/notes" className="side-item">
            <span style={{ fontSize: '18px' }}>📄</span> جزوات من
          </Link>
          <Link href="/dashboard/billing" className="side-item">
            <span style={{ fontSize: '18px' }}>💳</span> اشتراک من
          </Link>
          
          <div style={{ height: '1px', backgroundColor: 'var(--line)', margin: '15px 0' }}></div>
          
          <Link href="/dashboard/settings" className="side-item">
            <span style={{ fontSize: '18px' }}>⚙️</span> تنظیمات
          </Link>
          
          {/* لینک پنل ادمین (فقط برای ادمین‌ها) */}
          {isAdmin && (
            <Link href="/admin" className="side-item" style={{ marginTop: '20px', color: 'var(--green)', fontWeight: 'bold' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span> پنل مدیریت
            </Link>
          )}
        </nav>

        {/* اطلاعات کاربر و دکمه خروج */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-2)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '10px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {session.user?.email}
          </p>
          <form action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}>
            <button type="submit" className="button button-secondary" style={{ width: '100%', padding: '8px', fontSize: '13px' }}>خروج از حساب</button>
          </form>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', height: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

    </div>
  );
}