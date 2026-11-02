import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="site-shell" style={{ minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--surface)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>داشبورد کاربری</h1>
        <p>خوش آمدید، {session.user?.email}</p>
        <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-soft)' }}>نقش شما: {(session.user as any)?.role}</p>
        
        <form action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }} style={{ marginTop: '30px' }}>
          <button type="submit" className="button button-secondary">خروج از حساب</button>
        </form>

        {(session.user as any)?.role === 'SUPER_ADMIN' && (
            <Link href="/admin" className="button button-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                ورود به پنل مدیریت
            </Link>
            )}
      </div>
    </div>
  );
}