'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Send, User, ShieldCheck } from 'lucide-react';

export default function TicketChatPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  
  const [ticket, setTicket] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTicket = () => {
    fetch(`/api/support/${ticketId}`).then(r => r.json()).then(data => {
      if (data.success) {
        setTicket(data.ticket);
        setIsAdmin(data.isAdmin);
      }
      setLoading(false);
    });
  };

  useEffect(() => { loadTicket(); }, [ticketId]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const res = await fetch(`/api/support/${ticketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
    if (res.ok) {
      setMessage('');
      loadTicket(); // لود مجدد پیام‌ها
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!ticket) return <div>تیکت یافت نشد</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link href={isAdmin ? '/admin/support' : '/dashboard/support'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-soft)', marginBottom: '20px', textDecoration: 'none' }}>
        <ArrowRight size={18} /> بازگشت به لیست تیکت‌ها
      </Link>
      
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-2)' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>{ticket.subject}</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-soft)' }}>وضعیت: {ticket.status}</p>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {ticket.messages.map((msg: any) => (
            <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.isAdmin ? 'row' : 'row-reverse' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.isAdmin ? '#3b82f6' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                {msg.isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
              </div>
              <div style={{ backgroundColor: msg.isAdmin ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-2)', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6, maxWidth: '80%' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: msg.isAdmin ? '#3b82f6' : 'var(--green)', marginBottom: '4px' }}>{msg.isAdmin ? 'پشتیبانی' : 'شما'}</p>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '15px', borderTop: '1px solid var(--line)', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="پاسخ خود را بنویسید..." 
            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }} 
          />
          <button onClick={handleSend} className="button button-primary" style={{ width: '50px', padding: 0 }}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}