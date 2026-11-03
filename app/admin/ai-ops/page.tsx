import prisma from '@/lib/prisma';

export default async function AdminAIOpsPage() {
  // دریافت لیست جاب‌های پردازش به همراه اطلاعات کاربر و ضبط
  const jobs = await prisma.processingJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      recording: {
        include: { user: true }
      }
    }
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px' }}>عملیات هوش مصنوعی</h1>
      <p style={{ color: 'var(--text-soft)', marginBottom: '30px', fontSize: '14px' }}>وضعیت پردازش‌های صوتی و جاب‌های در صف</p>
      
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>عنوان جلسه</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>کاربر</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>نوع جاب</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>وضعیت</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job: any) => (
              <tr key={job.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold' }}>{job.recording.title}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)' }}>{job.recording.user.email}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: 'var(--surface-2)' }}>
                    {job.jobType}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: job.status === 'completed' ? '#dcfce7' : job.status === 'failed' ? '#fee2e2' : '#fef9c3',
                    color: job.status === 'completed' ? '#166534' : job.status === 'failed' ? '#991b1b' : '#854d0e'
                  }}>
                    {job.status === 'completed' ? 'تکمیل شده' : job.status === 'failed' ? 'ناموفق' : 'در صف'}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-soft)', direction: 'ltr', textAlign: 'right' }}>
                  {new Date(job.createdAt).toLocaleString('fa-IR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-soft)' }}>هیچ جاب پردازشی یافت نشد.</div>
        )}
      </div>
    </div>
  );
}