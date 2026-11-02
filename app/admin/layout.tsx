import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  const role = (session.user as any)?.role;
  const email = session.user?.email;

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* سایدبار */}
      <aside style={{ width: '260px', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green)' }}>NoteAI Admin</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '5px' }}>{email}</p>
          <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '10px', backgroundColor: 'var(--green-light)', color: 'var(--green)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            {role}
          </span>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Link href="/admin" style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>📊 داشبورد کلی</Link>
          <Link href="/admin/users" style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-soft)' }}>👥 مدیریت کاربران</Link>
          <Link href="/admin/ai-ops" style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-soft)' }}>🤖 عملیات هوش مصنوعی</Link>
          <Link href="/admin/security" style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-soft)' }}>🛡️ مرکز امنیت</Link>
          <Link href="/admin/audit-logs" style={{ padding: '12px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-soft)' }}>📜 لاگ‌های امنیتی</Link>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid var(--line)' }}>
          <form action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}>
            <button type="submit" className="button button-secondary" style={{ width: '100%' }}>خروج از پنل</button>
          </form>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <main style={{ flex: 1, padding: '40px', backgroundColor: 'var(--surface-2)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}