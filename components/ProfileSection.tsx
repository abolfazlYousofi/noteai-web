'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Save, Edit2, X, AlertCircle } from 'lucide-react';

export default function ProfileSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 🆕 حالت ویرایش
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
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data) => {
        if (data.success && data.profile) {
          setForm({
            name: data.profile.name || '',
            age: data.profile.age?.toString() || '',
            major: data.profile.major || '',
            university: data.profile.university || '',
            degree: data.profile.degree || '',
          });
          
          // 🆕 اگر اطلاعات ناقص بود، خودکار برو در حالت ویرایش
          if (!data.profile.name || !data.profile.major || !data.profile.university) {
            setIsEditing(true);
          }
        }
      })
      .catch((err) => console.warn('Profile API error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (saving) return; // 🆕 جلوگیری از کلیک چندباره
    setMessage(null);

    if (!form.name.trim() || !form.major.trim() || !form.university.trim()) {
      setMessage({ type: 'error', text: 'لطفاً فیلدهای ستاره‌دار (نام، رشته، دانشگاه) را تکمیل کنید.' });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || '',
          age: form.age ? parseInt(form.age, 10) : null,
          major: form.major || '',
          university: form.university || '',
          degree: form.degree || null,
        }),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data = { error: 'پاسخ نامعتبر از سرور' }; }

      if (res.ok) {
        setMessage({ type: 'success', text: 'پروفایل با موفقیت ذخیره شد' });
        setIsEditing(false); // 🆕 بستن حالت ویرایش
        window.dispatchEvent(new Event('profile-saved')); // 🆕 به بلاکر خبر بده
        router.refresh(); // 🆕 رفرش کردن Layout برای برداشتن قفل صفحه

         // 🆕 رفرش سخت برای پاک کردن کش Layout و برداشتن قفل از کل سایت
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        setMessage({ type: 'error', text: (data as any).error || 'خطا در ذخیره' });
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

  const requiredStar = <span style={{ color: '#dc2626', marginRight: '4px' }}>*</span>;

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)', textAlign: 'center', color: 'var(--text-soft)' }}>
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <User size={20} style={{ color: 'var(--green)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>اطلاعات شخصی</h2>
        </div>
        
        {/* 🆕 دکمه ویرایش (فقط در حالت نمایش) */}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="button button-secondary button-small" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit2 size={14} /> ویرایش
          </button>
        )}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '20px', lineHeight: 1.7 }}>
        این اطلاعات به ما کمک می‌کند تا جزوات را با دقت بیشتری برای رشته شما آماده کنیم.
      </p>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
          {message.type === 'error' && <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* 🆕 حالت نمایش (فقط خواندنی) */}
      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>نام و نام خانوادگی</label>
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>{form.name || 'ثبت نشده'}</p>
            </div>
            <div>
              <label style={labelStyle}>سن</label>
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>{form.age || 'ثبت نشده'}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>رشته تحصیلی</label>
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>{form.major || 'ثبت نشده'}</p>
            </div>
            <div>
              <label style={labelStyle}>دانشگاه</label>
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>{form.university || 'ثبت نشده'}</p>
            </div>
          </div>
          <div>
            <label style={labelStyle}>مقطع</label>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>
              {form.degree === 'BACHELOR' ? 'کارشناسی' : form.degree === 'MASTER' ? 'کارشناسی ارشد' : form.degree === 'PHD' ? 'دکتری' : 'ثبت نشده'}
            </p>
          </div>
        </div>
      ) : (
        /* 🆕 حالت ویرایش */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>{requiredStar} نام و نام خانوادگی</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: علی محمدی" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>سن</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="مثلاً: ۲۲" min="10" max="100" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>مقطع</label>
              <select value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value as any })} style={inputStyle}>
                <option value="">انتخاب کنید</option>
                <option value="BACHELOR">کارشناسی</option>
                <option value="MASTER">کارشناسی ارشد</option>
                <option value="PHD">دکتری</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>{requiredStar} رشته تحصیلی</label>
            <input type="text" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="مثلاً: مهندسی کامپیوتر" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>{requiredStar} دانشگاه</label>
            <input type="text" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="مثلاً: دانشگاه تهران" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={handleSave} disabled={saving} className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px' }}>
              <Save size={16} /> {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
            </button>
            
            {/* 🆕 دکمه انصراف (فقط اگر قبلاً اطلاعات داشته باشد) */}
            {form.name && (
              <button onClick={() => setIsEditing(false)} disabled={saving} className="button button-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px' }}>
                <X size={16} /> انصراف
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}