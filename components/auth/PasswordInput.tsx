'use client';

import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, CheckCircle2 } from 'lucide-react';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'رمز عبور',
  isValid = false,
  autoComplete = 'new-password',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isValid?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        dir="ltr"
        style={{
          width: '100%',
          height: '50px',
          padding: '0 45px', // فضا برای هر دو آیکون
          borderRadius: '12px',
          border: `1px solid ${isValid ? '#22c55e' : 'var(--glass-border)'}`,
          background: 'var(--glass-input-bg)',
          color: 'var(--text)',
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.2s',
        }}
      />

      {/* دکمه چشم (ضدضربه) */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // جلوگیری از گرفتن فوکوس
          setShow(!show);
        }}
        style={{
          position: 'absolute',
          left: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          zIndex: 10,
        }}
        title={show ? 'مخفی کردن' : 'نمایش'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

      {/* آیکون وضعیت (تیک یا قفل) */}
      <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
        {isValid ? <CheckCircle2 size={18} color="#22c55e" /> : <LockKeyhole size={18} color="var(--text-soft)" />}
      </div>
    </div>
  );
}