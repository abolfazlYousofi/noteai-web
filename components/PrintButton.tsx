'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="button button-primary button-small"
      title="برای ذخیره به عنوان PDF، در پنجره باز شده گزینه Save as PDF را انتخاب کنید."
    >
      🖨️ دانلود PDF
    </button>
  );
}