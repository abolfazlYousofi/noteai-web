import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, Clock } from 'lucide-react';

export default async function AdminSupportPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { email: true } }, _count: { select: { messages: true } } },
  });

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>پشتیبانی کاربران</h1>
      
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--surface-2)' }}>
            <tr style={{ fontSize: '13px', color: 'var(--text-soft)' }}>
              <th style={{ padding: '16px' }}>موضوع</th>
              <th style={{ padding: '16px' }}>کاربر</th>
              <th style={{ padding: '16px' }}>وضعیت</th>
              <th style={{ padding: '16px' }}>پیام‌ها</th>
              <th style={{ padding: '16px' }}>آخرین بروزرسانی</th>
              <th style={{ padding: '16px' }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{t.subject}</td>
                <td style={{ padding: '16px', color: 'var(--text-soft)' }}>{t.user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: t.status === 'ANSWERED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: t.status === 'ANSWERED' ? '#22c55e' : '#eab308' }}>
                    {t.status === 'ANSWERED' ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-soft)' }}>{t._count.messages}</td>
                <td style={{ padding: '16px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>
                  {new Date(t.updatedAt).toLocaleString('fa-IR')}
                </td>
                <td style={{ padding: '16px' }}>
                  <Link href={`/admin/support/${t.id}`} className="button button-primary button-small">مشاهده و پاسخ</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-soft)' }}>هیچ تیکتی یافت نشد.</div>}
      </div>
    </div>
  );
}