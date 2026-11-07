// lib/ai/hf-provider.ts
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { AIProvider, TranscribeOptions, TranscribeResult } from './provider';

export class HFProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.HF_TOKEN,
      baseURL: process.env.HF_BASE_URL || 'https://router.huggingface.co/v1',
    });
    // پیشنهاد من برای مدل فارسی، تا زمانی که تست کنیم:
    this.model = process.env.HF_ASR_MODEL || 'openai/whisper-large-v3';
  }

  async transcribe(options: TranscribeOptions): Promise<TranscribeResult> {
    const file = await toFile(options.file, options.filename, { type: 'audio/webm' });
    
    // @ts-ignore (چون تایپ‌های OpenAI هنوز مدل‌های HF را نمی‌شناسند)
    const response = await this.client.audio.transcriptions.create({
      file,
      model: this.model,
      prompt: options.prompt,
      response_format: options.responseFormat || 'json',
      language: options.language || 'fa',
    });

    return {
      text: response.text,
      // اگر ورک‌فرمت verbose_json بود، سگمنت‌ها را هم برمی‌گردانیم
      segments: (response as any).segments || undefined,
    };
  }
}
