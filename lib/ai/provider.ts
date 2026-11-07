// lib/ai/provider.ts
import { NoteDocument } from './note-schema';

export interface TranscribeOptions {
  file: Buffer;
  filename: string;
  prompt?: string;
  responseFormat?: 'text' | 'verbose_json';
  language?: string;
}

export interface TranscribeResult {
  text: string;
  segments?: { start: number; end: number; text: string }[];
}

export interface AIProvider {
  transcribe(options: TranscribeOptions): Promise<TranscribeResult>;
  // در آینده می‌توانیم متدهای analyzeImage و generateNote را هم اینجا اضافه کنیم
}