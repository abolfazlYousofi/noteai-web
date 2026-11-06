'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import CheckoutButton from '@/components/CheckoutButton';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PricingPage() {
  const plans = [
    { 
      id: 'FREE',
      name: 'رایگان', 
      price: '۰', 
      desc: 'برای شروع و آشنایی با NoteAI', 
      features: ['۱۵ دقیقه پردازش در ماه', 'رونویسی پایه', 'تولید جزوه محدود', 'پشتیبانی انجمن'], 
      popular: false,
      amount: 0
    },
    { 
      id: 'STUDENT',
      name: 'دانشجویی', 
      price: '۲۰۰,۰۰۰', 
      desc: 'مناسب استفاده ماهانه و ترم‌های دانشگاه', 
      features: ['۳۰۰ دقیقه پردازش در ماه', 'رونویسی پیشرفته با Whisper', 'جزوه ساختاریافته و ویرایشگر', 'پشتیبانی از عکس تخته', 'پشتیبانی ایمیلی'], 
      popular: true,
      amount: 200000
    },
    { 
      id: 'PRO',
      name: 'حرفه‌ای', 
      price: '۵۰۰,۰۰۰', 
      desc: 'برای استفاده سنگین و پروژه‌های تحقیقاتی', 
      features: ['۹۰۰ دقیقه پردازش در ماه', 'تمام امکانات دانشجویی', 'اولویت در صف پردازش', 'خروجی PDF اختصاصی', 'پشتیبانی ۲۴/۷'], 
      popular: false,
      amount: 500000
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <>
      <Header />
      
      <div className="site-shell" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden', backgroundColor: 'transparent' }}>
        <div style={{ 
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', 
          width: '100%', maxWidth: '800px', height: '500px', 
          background: 'radial-gradient(circle, rgba(22, 77, 62, 0.06) 0%, rgba(248, 250, 255, 0) 70%)', 
          zIndex: 0, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(40px, 6vw, 70px) 20px' }}>
          <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
            
            <motion.div 
              initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', marginBottom: 'clamp(30px, 5vw, 50px)' }}
            >
              <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, marginBottom: '12px', color: 'var(--text)', lineHeight: 1.3 }}>
                پلنی متناسب با نیاز خود انتخاب کنید
              </h1>
              <p style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'var(--text-soft)', maxWidth: '550px', margin: '0 auto', lineHeight: 1.8 }}>
                با پلن رایگان شروع کنید و هر زمان نیاز داشتید ارتقا دهید.
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants} initial="hidden" animate="visible"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 28vw, 310px), 1fr))', gap: 'clamp(16px, 2vw, 24px)', alignItems: 'center' }}
            >
              {plans.map((plan, i) => (
                <motion.div 
                  key={i} variants={cardVariants}
                  whileHover={{ y: -8, scale: plan.popular ? 1.03 : 1.01, boxShadow: plan.popular ? '0 20px 40px -10px rgba(22, 77, 62, 0.25)' : '0 15px 30px -10px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ 
                    backgroundColor: 'var(--surface)', padding: 'clamp(20px, 3vw, 32px)', borderRadius: '24px', 
                    border: plan.popular ? '2px solid var(--green)' : '1px solid var(--line)',
                    boxShadow: plan.popular ? '0 20px 40px -12px rgba(22, 77, 62, 0.15)' : '0 8px 20px -10px rgba(0,0,0,0.05)',
                    position: 'relative', transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                    display: 'flex', flexDirection: 'column', height: '100%',
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--green)', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(22, 77, 62, 0.3)', whiteSpace: 'nowrap' }}>
                      پیشنهاد ویژه
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text)' }}>{plan.name}</h2>
                    <p style={{ color: 'var(--text-soft)', fontSize: '12px', minHeight: '32px', lineHeight: 1.6 }}>{plan.desc}</p>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
                    <span style={{ fontSize: 'clamp(28px, 3vw, 34px)', fontWeight: 900, color: 'var(--green)', fontFamily: 'monospace' }}>{plan.price}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-soft)', marginRight: '6px' }}>تومان / ماه</span>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px', backgroundColor: plan.popular ? 'var(--green-light)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} style={{ color: plan.popular ? 'var(--green)' : 'var(--text-soft)' }} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <motion.div whileTap={{ scale: 0.95 }} style={{ marginTop: 'auto' }}>
                    {plan.amount === 0 ? (
                      <Link 
                        href="/dashboard"
                        style={{ 
                          width: '100%', textAlign: 'center', display: 'block', padding: '12px', 
                          borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
                          backgroundColor: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--line)'
                        }}
                      >
                        شروع رایگان
                      </Link>
                    ) : (
                      <CheckoutButton planId={plan.id} planName={plan.name} amount={plan.amount} />
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}