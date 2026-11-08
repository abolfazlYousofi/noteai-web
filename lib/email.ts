import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: 'NoteAI <onboarding@resend.dev>', // برای تست از این استفاده می‌کنیم
      to,
      subject: 'به NoteAI خوش آمدید! 🎉',
      html: `
        <div style="font-family: Tahoma, sans-serif; direction: rtl; text-align: right; background-color: #07120f; color: #e9f3ed; padding: 40px; border-radius: 20px;">
          <h2 style="color: #8bc6a5;">سلام ${name || 'دانشجوی عزیز'}!</h2>
          <p>از اینکه به NoteAI پیوستید خوشحالیم. حالا می‌توانید کلاس‌های خود را ضبط کنید و در چند ثانیه جزوه هوشمند تحویل بگیرید.</p>
          <br/>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background-color: #8bc6a5; color: #07120f; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">ورود به داشبورد</a>
          <p style="margin-top: 30px; font-size: 12px; color: #8ba69a;">تیم NoteAI</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    await resend.emails.send({
      from: 'NoteAI <onboarding@resend.dev>',
      to,
      subject: 'بازیابی رمز عبور NoteAI',
      html: `
        <div style="font-family: Tahoma, sans-serif; direction: rtl; text-align: right; background-color: #07120f; color: #e9f3ed; padding: 40px; border-radius: 20px;">
          <h2 style="color: #8bc6a5;">درخواست بازیابی رمز عبور</h2>
          <p>ما درخواستی برای بازیابی رمز عبور حساب شما دریافت کردیم. برای تعیین رمز جدید روی دکمه زیر کلیک کنید:</p>
          <br/>
          <a href="${resetLink}" style="background-color: #8bc6a5; color: #07120f; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">تغییر رمز عبور</a>
          <p style="margin-top: 20px; font-size: 13px; color: #ff6b6b;">اگر این درخواست از سمت شما نبوده، این ایمیل را نادیده بگیرید. این لینک تا ۱ ساعت دیگر منقضی می‌شود.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #8ba69a;">تیم NoteAI</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
  }
}