import prisma from '@/lib/prisma';
import { RevenueChart, PlanPieChart } from '@/components/admin/FinanceCharts';
import { Wallet, TrendingUp, Cpu, CreditCard } from 'lucide-react';

export default async function AdminAccountingPage() {
  // ۱. دریافت تمام تراکنش‌های موفق
  const transactions = await prisma.transaction.findMany({
    where: { status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  });

  // ۲. محاسبه کل درآمد
  const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

  // ۳. تخمین هزینه AI (فرض: هر دقیقه پردازش ۵۰ تومان هزینه دارد)
  const recordings = await prisma.recording.findMany({ select: { durationSeconds: true } });
  const totalMinutes = recordings.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 60;
  const estimatedAiCost = Math.round(totalMinutes * 50); 

  // ۴. محاسبه سود خالص
  const netProfit = totalRevenue - estimatedAiCost;

  // ۵. آماده‌سازی داده‌های نمودار درآمد ماهانه (۷ ماه اخیر)
  const revenueByMonth: Record<string, number> = {};
  transactions.forEach(t => {
    const month = new Date(t.createdAt).toLocaleDateString('fa-IR', { month: 'short' });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + t.amount;
  });
  const chartData = Object.entries(revenueByMonth).map(([date, revenue]) => ({ date, revenue })).reverse();

  // ۶. آماده‌سازی داده‌های نمودار پلن‌ها
  const subscriptions = await prisma.subscription.groupBy({
    by: ['plan'],
    _count: { plan: true },
  });
  const planData = subscriptions.map(s => ({ name: s.plan, value: s._count.plan }));

  // استایل شیشه‌ای برای کارت‌ها
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>مدیریت مالی و حسابداری</h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '14px', marginTop: '5px' }}>نمای کلی درآمدها، هزینه‌ها و وضعیت اشتراک‌ها</p>
      </div>

      {/* کارت‌های آماری بالای صفحه */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* درآمد کل */}
        <div style={cardStyle}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '4px' }}>کل درآمد</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#22c55e' }}>{totalRevenue.toLocaleString('fa-IR')} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>تومان</span></p>
          </div>
        </div>

        {/* هزینه AI */}
        <div style={cardStyle}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <Cpu size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '4px' }}>هزینه تخمینی AI</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444' }}>{estimatedAiCost.toLocaleString('fa-IR')} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>تومان</span></p>
          </div>
        </div>

        {/* سود خالص */}
        <div style={cardStyle}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '4px' }}>سود خالص</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6' }}>{netProfit.toLocaleString('fa-IR')} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>تومان</span></p>
          </div>
        </div>

        {/* تعداد تراکنش */}
        <div style={cardStyle}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '4px' }}>تراکنش‌های موفق</p>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#eab308' }}>{transactions.length} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>مورد</span></p>
          </div>
        </div>
      </div>

      {/* نمودارها */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>روند درآمد ماهانه</h2>
          <RevenueChart data={chartData} />
        </div>
        <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'stretch' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>توزیع پلن‌های کاربری</h2>
          <PlanPieChart data={planData} />
        </div>
      </div>

      {/* جدول آخرین تراکنش‌ها */}
      <div style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>آخرین تراکنش‌های موفق</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--surface-2)' }}>
            <tr style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
              <th style={{ padding: '16px' }}>کاربر</th>
              <th style={{ padding: '16px' }}>پلن خریداری شده</th>
              <th style={{ padding: '16px' }}>مبلغ (تومان)</th>
              <th style={{ padding: '16px' }}>کد رهگیری زرین‌پال</th>
              <th style={{ padding: '16px' }}>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{t.user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: 'var(--green-light)', color: 'var(--green)' }}>
                    {t.plan}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#22c55e', fontWeight: 'bold' }}>{t.amount.toLocaleString('fa-IR')}</td>
                <td style={{ padding: '16px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>{t.refId || '---'}</td>
                <td style={{ padding: '16px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>{new Date(t.createdAt).toLocaleString('fa-IR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-soft)' }}>هیچ تراکنش موفقی ثبت نشده است.</div>}
      </div>

    </div>
  );
}