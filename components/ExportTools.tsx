'use client';

import { useState } from 'react';
import { Printer, Copy, Check } from 'lucide-react';
import { NoteDocument } from '@/lib/ai/note-schema';

export default function ExportTools({ noteData, fallbackText }: { noteData: NoteDocument | null, fallbackText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    let md = '';

    if (noteData) {
      // ساختار JSON به Markdown
      md += `# ${noteData.title}\n\n`;
      md += `## خلاصه اجرایی\n${noteData.summary}\n\n`;
      
      if (noteData.keyTerms && noteData.keyTerms.length > 0) {
        md += `## واژه‌های کلیدی\n`;
        noteData.keyTerms.forEach(term => {
          md += `- **${term.term}**: ${term.definition}\n`;
        });
        md += '\n';
      }

      noteData.sections.forEach(section => {
        md += `## ${section.heading}\n`;
        section.blocks.forEach(block => {
          if (block.type === 'paragraph' && block.content) md += `${block.content}\n\n`;
          else if (block.type === 'equation' && block.content) md += `$$${block.content}$$\n\n`;
          else if (block.type === 'code' && block.content) md += `\`\`\`${block.language || ''}\n${block.content}\n\`\`\`\n\n`;
          else if (block.type === 'list' && block.items) {
            block.items.forEach(item => md += `- ${item}\n`);
            md += '\n';
          }
          else if (block.type === 'heading' && block.content) md += `### ${block.content}\n\n`;
        });
      });
    } else {
      // اگر جزوه JSON نبود (جزوات قدیمی)
      md = fallbackText;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button 
        onClick={handleCopyMarkdown} 
        className="button button-secondary button-small"
        title="کپی به عنوان Markdown برای Obsidian یا Notion"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        {copied ? <Check size={14} style={{ color: 'var(--green)' }} /> : <Copy size={14} />}
        {copied ? 'کپی شد!' : 'کپی Markdown'}
      </button>

      <button 
        onClick={() => window.print()} 
        className="button button-primary button-small"
        title="خروجی گرفتن به صورت PDF (در پنجره باز شده Save as PDF را بزنید)"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Printer size={14} /> خروجی PDF
      </button>
    </div>
  );
}