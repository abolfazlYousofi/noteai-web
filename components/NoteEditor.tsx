'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { NoteDocument } from '@/lib/ai/note-schema';
import { Save, Edit3, X, Plus, Trash2 } from 'lucide-react';

export default function NoteEditor({ noteId, initialData, readOnly = false }: { noteId: string, initialData: NoteDocument, readOnly?: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<NoteDocument>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editingHeading, setEditingHeading] = useState<number | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentJson: JSON.stringify(data) }),
      });

      if (res.ok) {
        setEditingBlock(null);
        setEditingHeading(null);
        router.refresh();
      } else {
        alert('خطا در ذخیره تغییرات');
      }
    } catch (err) {
      alert('خطای شبکه');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBlockContent = (sIdx: number, bIdx: number, newContent: string) => {
    const newData = structuredClone(data);
    newData.sections[sIdx].blocks[bIdx].content = newContent;
    setData(newData);
  };

  const updateSectionHeading = (sIdx: number, newHeading: string) => {
    const newData = structuredClone(data);
    newData.sections[sIdx].heading = newHeading;
    setData(newData);
  };

  const addBlock = (sIdx: number, type: 'paragraph' | 'equation') => {
    const newData = structuredClone(data);
    newData.sections[sIdx].blocks.push({
      type,
      content: '',
      items: null,
      language: null,
      sourceRefs: null
    });
    setData(newData);
    setEditingBlock(`${sIdx}-${newData.sections[sIdx].blocks.length - 1}`);
  };

  const removeBlock = (sIdx: number, bIdx: number) => {
    if (!confirm('این بخش حذف شود؟')) return;
    const newData = structuredClone(data);
    newData.sections[sIdx].blocks.splice(bIdx, 1);
    setData(newData);
  };

  const seekAudio = (seconds: number) => {
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    if (audio) {
      audio.currentTime = seconds;
      audio.play().catch(() => {});
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ direction: 'rtl', color: 'var(--text)' }}>
      
      {/* هدر ویرایشگر (فقط در حالت ویرایش) */}
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '15px', backgroundColor: 'var(--surface-2)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={20} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>حالت ویرایش (روی هر بخش کلیک کنید)</span>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="button button-primary" 
            style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      )}

      {/* خلاصه اجرایی */}
      <div style={{ backgroundColor: 'var(--surface-2)', padding: '20px', borderRadius: '16px', marginBottom: '30px', borderLeft: '4px solid var(--green)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--green)' }}>📝 خلاصه اجرایی</h3>
        <p style={{ fontSize: '15px', lineHeight: 1.8 }}>{data.summary}</p>
      </div>

      {/* بخش‌های اصلی */}
      {data.sections.map((section, sIdx) => (
        <div key={sIdx} style={{ marginBottom: '40px' }}>
          
          {/* ویرایش تیتر */}
          {editingHeading === sIdx && !readOnly ? (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={section.heading} 
                onChange={(e) => updateSectionHeading(sIdx, e.target.value)}
                style={{ flex: 1, padding: '10px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', border: '2px solid var(--green)', backgroundColor: 'var(--surface)' }}
              />
              <button onClick={() => setEditingHeading(null)} style={{ padding: '10px', backgroundColor: 'var(--green)', color: 'white', borderRadius: '8px', border: 'none' }}>تایید</button>
            </div>
          ) : (
            <h2 
              onClick={() => !readOnly && setEditingHeading(sIdx)}
              style={{ cursor: readOnly ? 'default' : 'pointer', fontSize: '22px', fontWeight: '900', color: 'var(--text)', marginBottom: '20px', borderBottom: '2px dashed var(--line)', paddingBottom: '10px' }}
              title={readOnly ? '' : "برای ویرایش تیتر کلیک کنید"}
            >
              {section.heading}
            </h2>
          )}
          
          {section.blocks.map((block, bIdx) => {
            const blockKey = `${sIdx}-${bIdx}`;
            const isEditing = editingBlock === blockKey;

            // حالت ویرایش بلوک
            if (isEditing && !readOnly) {
              return (
                <div key={bIdx} style={{ marginBottom: '15px', padding: '15px', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--green)' }}>
                  <textarea
                    value={block.content || (block.items ? block.items.join('\n') : '')}
                    onChange={(e) => updateBlockContent(sIdx, bIdx, e.target.value)}
                    placeholder={block.type === 'equation' ? 'فرمول LaTeX را وارد کنید...' : 'متن را وارد کنید...'}
                    style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '15px', lineHeight: 1.8 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button onClick={() => setEditingBlock(null)} className="button button-small" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <X size={14} /> بستن
                    </button>
                  </div>
                </div>
              );
            }

            // حالت نمایش بلوک
            return (
              <div key={bIdx} style={{ position: 'relative' }} className="group hover:bg-[var(--surface-2)] rounded-lg">
                
                {/* دکمه شناور حذف (فقط در حالت ویرایش و هاور) */}
                {!readOnly && (
                  <button 
                    onClick={() => removeBlock(sIdx, bIdx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ position: 'absolute', left: '-10px', top: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', zIndex: 10 }}
                    title="حذف این بخش"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div 
                  onClick={() => !readOnly && block.type !== 'equation' && block.type !== 'code' && setEditingBlock(blockKey)}
                  style={{ cursor: (!readOnly && block.type !== 'equation' && block.type !== 'code') ? 'text' : 'default', padding: '5px' }}
                >
                  {block.type === 'paragraph' && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontSize: '15px', lineHeight: 2, textAlign: 'justify', margin: 0 }}>{block.content}</p>
                      {block.sourceRefs?.[0]?.timestampStart != null && (
                        <button onClick={(e) => { e.stopPropagation(); seekAudio(block.sourceRefs![0]!.timestampStart!); }} title="پخش از این دقیقه" style={{ marginTop: '6px', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--green)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ⏱ {formatTime(block.sourceRefs[0].timestampStart)}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {block.type === 'heading' && <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '20px 0 10px' }}>{block.content}</h3>}

                  {block.type === 'equation' && block.content && (
                    <div style={{ margin: '20px 0' }}>
                      <div style={{ direction: 'ltr', backgroundColor: 'var(--surface-2)', padding: '20px', borderRadius: '12px', textAlign: 'center', overflowX: 'auto' }}>
                        <BlockMath math={block.content} />
                      </div>
                      {block.sourceRefs?.[0]?.timestampStart != null && (
                        <button onClick={(e) => { e.stopPropagation(); seekAudio(block.sourceRefs![0]!.timestampStart!); }} title="پخش از این دقیقه" style={{ marginTop: '6px', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--green)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ⏱ {formatTime(block.sourceRefs[0].timestampStart)}
                        </button>
                      )}
                    </div>
                  )}

                  {block.type === 'list' && block.items && (
                    <ul style={{ paddingRight: '20px', marginBottom: '15px', listStyleType: 'disc' }}>
                      {block.items.map((item, iIdx) => (
                        <li key={iIdx} style={{ fontSize: '15px', lineHeight: 1.8, marginBottom: '8px' }}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {block.type === 'code' && block.content && (
                    <div style={{ direction: 'ltr', backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', margin: '20px 0', overflowX: 'auto' }}>
                      <pre><code style={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '13px' }}>{block.content}</code></pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* دکمه‌های افزودن بلوک به این بخش (فقط در حالت ویرایش) */}
          {!readOnly && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px dashed var(--line)', paddingTop: '15px' }}>
              <button onClick={() => addBlock(sIdx, 'paragraph')} className="button button-secondary button-small" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <Plus size={14} /> افزودن متن
              </button>
              <button onClick={() => addBlock(sIdx, 'equation')} className="button button-secondary button-small" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <Plus size={14} /> افزودن فرمول
              </button>
            </div>
          )}

        </div>
      ))}

      {/* دکمه ذخیره پایین صفحه (فقط در حالت ویرایش) */}
      {!readOnly && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={handleSave} disabled={isSaving} className="button button-primary" style={{ padding: '12px 40px', fontSize: '16px' }}>
            <Save size={18} style={{ marginLeft: '8px' }} /> {isSaving ? 'در حال ذخیره...' : 'ذخیره نهایی تغییرات'}
          </button>
        </div>
      )}
    </div>
  );
}