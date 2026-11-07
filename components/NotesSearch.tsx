'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotesSearch({ recordings }: { recordings: any[] }) {
  const [query, setQuery] = useState('');

  const filtered = recordings.filter(rec => {
    const title = rec.notes[0]?.title || '';
    return title.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <>
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="جستجو در عنوان جزوات..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '16px', border: '1px solid var(--line)', backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: '15px' }}
        />
        <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>جزوه‌ای با این عنوان یافت نشد.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map((rec: any) => (
            <div key={rec.id} style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--green-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.4' }}>{rec.notes[0]?.title || 'بدون عنوان'}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '20px', flex: 1 }}>
                مدت زمان جلسه: {Math.floor((rec.durationSeconds || 0) / 60)} دقیقه <br/>
                تاریخ: {new Date(rec.createdAt).toLocaleDateString('fa-IR')}
              </p>
              <Link href={`/dashboard/notes/${rec.id}`} className="button button-secondary button-small" style={{ textAlign: 'center' }}>مطالعه و ویرایش جزوه</Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}