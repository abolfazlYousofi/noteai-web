'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'NORMAL' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/support').then(r => r.json()).then(data => {
      if (data.success) setTickets(data.tickets);
      setLoading(false);
    });
  }, []);

      const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      // 🆕 تلاش برای خواندن JSON، اگر HTML بود خطا را می‌گیرد
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('پاسخ نامعتبر از سرور (احتمالا خطای دیتابیس)');
      }

      if (res.ok) {
        setShowNew(false);
        window.location.reload(); 
      } else {
        alert((data as any).error || 'خطایی در سرور رخ داد.');
      }
    } catch (err: any) {
      alert(err.message || 'خطای شبکه در ارتباط با سرور');
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>پشتیبانی</h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px' }}>سوالات و مشکلات خود را با ما در میان بگذارید.</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> تیکت جدید
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>ثبت تیکت جدید</h2>
          <input type="text" placeholder="موضوع تیکت" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }} />
          <textarea placeholder="توضیحات کامل..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={4} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="button button-primary" style={{ flex: 1 }}>ارسال تیکت</button>
            <button type="button" onClick={() => setShowNew(false)} className="button button-secondary" style={{ flex: 1 }}>انصراف</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>هنوز تیکتی ثبت نکرده‌اید.</div>
        ) : (
          tickets.map(t => (
            <Link key={t.id} href={`/dashboard/support/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', transition: 'all 0.2s' }} className="hover:-translate-y-1">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: t.status === 'ANSWERED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.status === 'ANSWERED' ? '#22c55e' : '#eab308' }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{t.subject}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Clock size={12} /> {new Date(t.updatedAt).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', backgroundColor: t.status === 'ANSWERED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: t.status === 'ANSWERED' ? '#22c55e' : '#eab308' }}>
                    {t.status === 'ANSWERED' ? 'پاسخ داده شده' : 'در انتظار بررسی'}
                  </span>
                  <ChevronLeft size={18} style={{ color: 'var(--text-soft)' }} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}