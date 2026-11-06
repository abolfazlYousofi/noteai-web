// lib/ai/extract-text.ts
// Extract plain text from Note.contentJson (or fallback to content).

export function extractTextFromNoteJson(note: any): string {
  let text = '';
  if (note.summary) text += `خلاصه جلسه: ${note.summary}\n\n`;

  if (note.keyTerms && note.keyTerms.length > 0) {
    text += 'واژه‌های کلیدی:\n';
    note.keyTerms.forEach((term: any) => {
      text += `- ${term.term}: ${term.definition}\n`;
    });
    text += '\n';
  }

  if (note.sections && note.sections.length > 0) {
    note.sections.forEach((section: any) => {
      text += `## ${section.heading}\n`;
      if (section.blocks) {
        section.blocks.forEach((block: any) => {
          if (block.type === 'paragraph' && block.content) {
            text += `${block.content}\n`;
          } else if (block.type === 'list' && block.items) {
            block.items.forEach((item: string) => {
              text += `- ${item}\n`;
            });
          } else if (block.type === 'equation' && block.content) {
            text += `فرمول: ${block.content}\n`;
          } else if (block.type === 'code' && block.content) {
            text += `کد:\n${block.content}\n`;
          } else if (block.type === 'heading' && block.content) {
            text += `### ${block.content}\n`;
          }
        });
      }
      text += '\n';
    });
  }

  return text;
}

export function extractTextFromNote(note: { content: string; contentJson: string | null }): string {
  if (note.contentJson) {
    try {
      return extractTextFromNoteJson(JSON.parse(note.contentJson));
    } catch {
      // fall through to content
    }
  }
  return note.content;
}