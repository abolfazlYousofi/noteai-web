import prisma from '@/lib/prisma';
import { UserGrowthChart, CountryPieChart } from '@/components/admin/DashboardCharts';
import { Users, ShieldAlert, FileAudio, Globe } from 'lucide-react';

export default async function AdminDashboardPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

  // ۱. آمار کلی
  const totalUsers = await prisma.user.count({ where: { isDeleted: false } });
  const vpnUsers = await prisma.user.count({ where: { isVpn: true } });
  const totalRecordings = await prisma.recording.count();

  // ۲. آمار ثبت‌نام ۷ روز اخیر (برای نمودار)
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const growthDataMap = new Map();
  recentUsers.forEach(u => {
    const date = u.createdAt.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
    growthDataMap.set(date, (growthDataMap.get(date) || 0) + 1);
  });
  const growthData = Array.from(growthDataMap, ([date, users]) => ({ date, users }));

  // ۳. آمار کشورها (برای نمودار دایره‌ای)
  const usersByCountry = await prisma.user.groupBy({
    by: ['lastCountry'],
    _count: { lastCountry: true },
    where: { lastCountry: { not: null }, isDeleted: false },
    orderBy: { _count: { lastCountry: 'desc' } },
    take: 5,
  });
  const countryData = usersByCountry.map(c => ({ name: c.lastCountry || 'نامشخص', value: c._count.lastCountry }));

  // ۴. آخرین ورودها (جدول)
  const recentLogs = await prisma.auditLog.findMany({
    where: { action: 'USER_LOGIN' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { email: true } } },
  });

  const cardStyle = {
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>داشبورد مدیریت (Enterprise)</h1>

      {/* کارت‌های آماری */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <div style={{ padding: '15px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: '#22c55e' }}><Users size={24} /></div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)' }}>کاربران فعال</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalUsers}</p>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}><ShieldAlert size={24} /></div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)' }}>کاربران با VPN</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{vpnUsers}</p>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ padding: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}><FileAudio size={24} /></div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)' }}>کل ضبط‌ها</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRecordings}</p>
          </div>
        </div>
      </div>

      {/* نمودارها */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>ثبت‌نام‌های ۷ روز اخیر</h2>
          <UserGrowthChart data={growthData} />
        </div>
        <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>پراکندگی جغرافیایی کاربران</h2>
          <CountryPieChart data={countryData} />
        </div>
      </div>

      {/* جدول آخرین ورودها */}
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={20} style={{ color: 'var(--green)' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>آخرین ورودهای کاربران</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--surface-2)' }}>
            <tr style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
              <th style={{ padding: '12px 20px' }}>ایمیل کاربر</th>
              <th style={{ padding: '12px 20px' }}>IP آدرس</th>
              <th style={{ padding: '12px 20px' }}>کشور</th>
              <th style={{ padding: '12px 20px' }}>وضعیت VPN</th>
              <th style={{ padding: '12px 20px' }}>زمان</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '13px' }}>
                <td style={{ padding: '12px 20px' }}>{log.user.email}</td>
                <td style={{ padding: '12px 20px', direction: 'ltr', textAlign: 'right' }}>{log.ipAddress}</td>
                <td style={{ padding: '12px 20px' }}>{log.country}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', backgroundColor: log.isVpn ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: log.isVpn ? '#ef4444' : '#22c55e' }}>
                    {log.isVpn ? 'استفاده می‌کند' : 'مستقیم'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--text-soft)' }}>{new Date(log.createdAt).toLocaleString('fa-IR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}