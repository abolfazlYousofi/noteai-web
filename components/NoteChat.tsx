'use client';

import { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

// سوالات پیشنهادی که کاربر می‌تواند با یک کلیک بپرسد
const suggestedQuestions = [
  "این جلسه را در ۳ نکته خلاصه کن",
  "استاد درباره فرمول‌های روی تخته چه توضیحی داد؟",
  "مهم‌ترین مفاهیم این جلسه برای امتحان چیست؟"
];

export default function NoteChat({ noteId }: { noteId: string }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🆕 دریافت تاریخچه چت از دیتابیس هنگام لود صفحه
  useEffect(() => {
    fetch(`/api/chat?noteId=${noteId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages) {
          setMessages(data.messages.map((m: any) => ({
            role: m.role as 'user' | 'ai',
            text: m.content
          })));
        }
      })
      .catch(err => console.error("Failed to load chat history", err));
  }, [noteId]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = text;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, question: userMsg }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'متأسفم، خطایی رخ داد.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'خطای شبکه در ارتباط با سرور.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px', backgroundColor: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      
      {/* هدر چت: با تاکید بر اختصاصی بودن */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={18} style={{ color: 'var(--green)' }} />
        </div>
        <div>
          <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: 0 }}>دستیار اختصاصی این جزوه</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-soft)', margin: '4px 0 0 0' }}>من فقط با اطلاعات همین کلاس به شما پاسخ می‌دهم.</p>
        </div>
      </div>

      {/* لیست پیام‌ها */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* پیام خوش‌آمدگویی اولیه (فقط وقتی تاریخچه خالی است) */}
        {messages.length === 0 && !loading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={18} style={{ color: 'var(--green)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', fontSize: '13px', lineHeight: 1.8 }}>
                سلام! من جزوه این جلسه را خوانده‌ام. سوالی درباره توضیحات استاد، فرمول‌های تخته یا مفاهیم این درس دارید؟ بپرسید!
              </div>
              
              {/* نمایش سوالات پیشنهادی در حالت خالی */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>می‌توانید این‌ها را بپرسید:</span>
                {suggestedQuestions.map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(q)}
                    style={{ textAlign: 'right', padding: '10px 15px', borderRadius: '12px', border: '1px dashed var(--green)', backgroundColor: 'transparent', color: 'var(--green)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:bg-[var(--green-light)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* نمایش پیام‌های رد و بدل شده */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.role === 'user' ? 'var(--green)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: msg.role === 'user' ? '#fff' : 'inherit' }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={18} style={{ color: 'var(--green)' }} />}
            </div>
            <div style={{ 
              backgroundColor: msg.role === 'user' ? 'var(--green)' : 'var(--surface-2)', 
              color: msg.role === 'user' ? '#fff' : 'var(--text)', 
              padding: '12px 16px', 
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', 
              fontSize: '13px', 
              lineHeight: 1.8, 
              maxWidth: '85%',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} style={{ color: 'var(--green)' }} />
            </div>
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', fontSize: '13px', color: 'var(--text-soft)' }}>
              در حال بررسی جزوه...
            </div>
          </div>
        )}
      </div>

      {/* باکس تایپ */}
      <div style={{ padding: '15px', borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(question)}
            placeholder="سوال خود را از این جزوه بپرسید..."
            style={{ flex: 1, padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--text)', outline: 'none', fontSize: '13px' }}
          />
          <button 
            onClick={() => handleSend(question)} 
            disabled={loading || !question.trim()}
            style={{ width: '45px', height: '45px', borderRadius: '12px', backgroundColor: 'var(--green)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (loading || !question.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !question.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            <Send size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}