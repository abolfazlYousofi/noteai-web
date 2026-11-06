'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { StudyTools as StudyToolsType } from '@/lib/ai/study-tools-schema';


export default function StudyTools({ noteId }: { noteId: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudyToolsType | null>(null);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  
  // استیت‌های فلش‌کارت
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // استیت‌های آزمون
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const generateTools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/study-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        alert('خطا در تولید ابزارهای مطالعه');
      }
    } catch (err) {
      alert('خطای شبکه');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

    if (!data && !loading) {
    return (
      <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)', textAlign: 'center', marginTop: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>آماده‌ای خودت را محک بزنی؟</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '20px' }}>هوش مصنوعی می‌تواند از همین جزوه، فلش‌کارت و آزمون تستی بسازد.</p>
        <button onClick={generateTools} className="button button-primary" style={{ padding: '12px 24px' }}>
          <Sparkles size={18} style={{ marginLeft: '8px' }} /> تولید فلش‌کارت و آزمون
        </button>
      </div>
    );
  }
    if (!data) return null;

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--line)', textAlign: 'center', marginTop: '30px' }}>
        <RefreshCw size={30} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 15px', color: 'var(--green)' }} />
        <p style={{ fontSize: '14px', color: 'var(--text-soft)' }}>هوش مصنوعی در حال طراحی سوالات از جزوه شماست...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--line)', marginTop: '30px' }}>
      {/* تب‌ها */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--line)', paddingBottom: '15px' }}>
        <button onClick={() => setActiveTab('flashcards')} style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'flashcards' ? 'var(--green-light)' : 'transparent', color: activeTab === 'flashcards' ? 'var(--green)' : 'var(--text-soft)', border: 'none' }}>🗂️ فلش‌کارت‌ها</button>
        <button onClick={() => setActiveTab('quiz')} style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'quiz' ? 'var(--green-light)' : 'transparent', color: activeTab === 'quiz' ? 'var(--green)' : 'var(--text-soft)', border: 'none' }}>📝 آزمون تستی</button>
      </div>

      {/* بخش فلش‌کارت */}
      {activeTab === 'flashcards' && data.flashcards && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ width: '100%', maxWidth: '500px', height: '250px', perspective: '1000px', cursor: 'pointer' }}
          >
            <div style={{ 
              position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' 
            }}>
              {/* روی کارت (سوال) */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: 'var(--surface-2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center', border: '2px solid var(--line)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.6 }}>{data.flashcards[currentCard].question}</h3>
              </div>
              {/* پشت کارت (جواب) */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: 'var(--green)', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center', transform: 'rotateY(180deg)' }}>
                <p style={{ fontSize: '18px', lineHeight: 1.8 }}>{data.flashcards[currentCard].answer}</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
            <button disabled={currentCard === 0} onClick={() => { setCurrentCard(c => c - 1); setIsFlipped(false); }} className="button button-secondary">قبلی</button>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-soft)' }}>{currentCard + 1} از {data.flashcards.length}</span>
            <button disabled={currentCard === data.flashcards.length - 1} onClick={() => { setCurrentCard(c => c + 1); setIsFlipped(false); }} className="button button-secondary">بعدی</button>
          </div>
        </div>
      )}

      {/* بخش آزمون */}
      {activeTab === 'quiz' && data.quiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {data.quiz.map((q: any, qIndex: number) => {
            const isAnswered = selectedAnswers[qIndex] !== undefined;
            const isCorrect = selectedAnswers[qIndex] === q.correctIndex;

            return (
              <div key={qIndex} style={{ backgroundColor: 'var(--surface-2)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>{qIndex + 1}. {q.question}</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {q.options.map((opt: string, optIndex: number) => {
                    const isSelected = selectedAnswers[qIndex] === optIndex;
                    let bgColor = 'var(--surface)';
                    let borderColor = 'var(--line)';
                    
                    if (isAnswered) {
                      if (optIndex === q.correctIndex) {
                        bgColor = '#dcfce7'; borderColor = '#16a34a'; // سبز برای جواب درست
                      } else if (isSelected && !isCorrect) {
                        bgColor = '#fee2e2'; borderColor = '#dc2626'; // قرمز برای انتخاب غلط
                      }
                    } else if (isSelected) {
                      borderColor = 'var(--green)';
                    }

                    return (
                      <div 
                        key={optIndex}
                        onClick={() => !isAnswered && handleAnswerSelect(qIndex, optIndex)}
                        style={{ 
                          padding: '12px 15px', borderRadius: '10px', border: `1px solid ${borderColor}`, backgroundColor: bgColor,
                          cursor: isAnswered ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontSize: '14px', transition: 'all 0.2s'
                        }}
                      >
                        {opt}
                        {isAnswered && optIndex === q.correctIndex && <CheckCircle2 size={18} color="#16a34a" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="#dc2626" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}