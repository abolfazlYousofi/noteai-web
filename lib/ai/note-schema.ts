// lib/ai/note-schema.ts
import { z } from 'zod';

// ساختار ارجاع به منبع (صدا یا عکس)
export const SourceRefSchema = z.object({
  type: z.enum(['audio', 'image']),
  timestampStart: z.number().nullable(),
  timestampEnd: z.number().nullable(),
  imageId: z.string().nullable(),
});

// ساختار هر بلوک محتوایی
export const ContentBlockSchema = z.object({
  type: z.enum(['paragraph', 'equation', 'list', 'code', 'heading']),
  content: z.string().nullable(),
  items: z.array(z.string()).nullable(),
  language: z.string().nullable(),
  sourceRefs: z.array(SourceRefSchema).nullable(),
});

// ساختار نهایی جزوه
export const NoteDocumentSchema = z.object({
  title: z.string(),
  language: z.string(),
  summary: z.string(),
  keyTerms: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })),
  sections: z.array(z.object({
    heading: z.string(),
    blocks: z.array(ContentBlockSchema),
  })),
  uncertainties: z.array(z.string()).describe('مواردی که هوش مصنوعی مطمئن نبوده'),
});

export type NoteDocument = z.infer<typeof NoteDocumentSchema>;