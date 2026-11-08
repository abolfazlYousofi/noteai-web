// lib/ai/provider.ts
import { NoteDocument } from './note-schema';

export interface TranscribeOptions {
  file: Buffer;
  filename: string;
  prompt?: string;
  language?: string;
  responseFormat?: 'json' | 'verbose_json';
}

export interface TranscribeResult {
  text: string;
  segments?: { start: number; end: number; text: string }[];
}

export interface AIProvider {
  transcribe(options: TranscribeOptions): Promise<TranscribeResult>;
}