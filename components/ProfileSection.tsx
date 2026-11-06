'use client';

import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';

export default function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    major: '',
    university: '',
    degree: '' as '' | 'BACHELOR' | 'MASTER' | 'PHD',
  });

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          setForm({
            name: data.profile.name || '',
            age: data.profile.age?.toString() || '',
            major: data.profile.major || '',
            university: data.profile.university || '',
            degree: data.profile.degree || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || null,
          age: form.age ? parseInt(form.age, 10) : null,
          major: form.major || null,
          university: form.university || null,
          degree: form.degree || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'پروفایل ذخیره شد' });
      } else {
        setMessage({ type: 'error', text: data.error || 'خطا در ذخیره' });
      }
    } catch {
      setMessage({ type: 'error', text: 'خطای شبکه' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--line)',
    backgroundColor: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'var(--text-soft)',
    marginBottom: '6px',
    display: 'block',
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)', textAlign: 'center', color: 'var(--text-soft)' }}>
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <User size={20} style={{ color: 'var(--green)' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>اطلاعات شخصی</h2>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '20px', lineHeight: 1.7 }}>
        این اطلاعات به ما کمک می‌کند تا جزوات را با دقت بیشتری برای رشته شما آماده کنیم.
      </p>

      {message && (
        <div
          style={{
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={labelStyle}>نام و نام خانوادگی</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثلاً: علی محمدی"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>سن</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="مثلاً: ۲۲"
              min="10"
              max="100"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>مقطع</label>
            <select
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value as any })}
              style={inputStyle}
            >
              <option value="">انتخاب کنید</option>
              <option value="BACHELOR">کارشناسی</option>
              <option value="MASTER">کارشناسی ارشد</option>
              <option value="PHD">دکتری</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>رشته تحصیلی</label>
          <input
            type="text"
            value={form.major}
            onChange={(e) => setForm({ ...form, major: e.target.value })}
            placeholder="مثلاً: مهندسی کامپیوتر"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>دانشگاه</label>
          <input
            type="text"
            value={form.university}
            onChange={(e) => setForm({ ...form, university: e.target.value })}
            placeholder="مثلاً: دانشگاه تهران"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="button button-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '12px 30px' }}
        >
          <Save size={16} />
          {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
        </button>
      </div>
    </div>
  );
}