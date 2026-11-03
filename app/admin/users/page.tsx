import prisma from '@/lib/prisma';

export default async function AdminUsersPage() {
  // دریافت لیست کاربران از دیتابیس
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '30px' }}>مدیریت کاربران</h1>
      
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>ایمیل</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>نقش (Role)</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>وضعیت</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>تاریخ عضویت</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold' }}>{user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: user.role === 'SUPER_ADMIN' ? 'var(--green-light)' : 'var(--surface-2)',
                    color: user.role === 'SUPER_ADMIN' ? 'var(--green)' : 'var(--text-soft)'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: user.status === 'active' ? '#16a34a' : '#dc2626' }}>
                  {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>
                  {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-soft)' }}>هیچ کاربری یافت نشد.</div>
        )}
      </div>
    </div>
  );
}