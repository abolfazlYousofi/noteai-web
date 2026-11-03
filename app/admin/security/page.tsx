import prisma from '@/lib/prisma';

export default async function AdminSecurityPage() {
  // دریافت لاگ‌های امنیتی (آخرین ۵۰ مورد)
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { email: true } }
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px' }}>مرکز امنیت</h1>
      <p style={{ color: 'var(--text-soft)', marginBottom: '30px', fontSize: '14px' }}>تاریخچه رویدادهای امنیتی و اقدامات کاربران</p>
      
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>کاربر</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>اقدام (Action)</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>IP Address</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>زمان</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '16px', fontSize: '14px' }}>{log.user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>{log.ipAddress || 'نامشخص'}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>
                  {new Date(log.createdAt).toLocaleString('fa-IR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-soft)' }}>هیچ لاگی یافت نشد.</div>
        )}
      </div>
    </div>
  );
}