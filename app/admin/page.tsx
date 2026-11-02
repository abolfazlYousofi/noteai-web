import prisma from '@/lib/prisma';

export default async function AdminDashboardPage() {
  // گرفتن آمار از دیتابیس
  const totalUsers = await prisma.user.count();
  const totalRecordings = await prisma.recording.count();
  
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '30px' }}>داشبورد مدیریت</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-soft)' }}>کل کاربران</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: 'var(--green)' }}>{totalUsers}</p>
        </div>
        
        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-soft)' }}>کل ضبط‌ها</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: 'var(--green)' }}>{totalRecordings}</p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-soft)' }}>وضعیت سیستم</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px', color: '#16a34a' }}>✅ آنلاین</p>
        </div>
      </div>
    </div>
  );
}