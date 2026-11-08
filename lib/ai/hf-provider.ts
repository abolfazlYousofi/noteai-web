import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { AIProvider, TranscribeOptions, TranscribeResult } from './provider';

export class HFProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    // HF از استاندارد OpenAI پشتیبانی می‌کند
    this.client = new OpenAI({
      apiKey: process.env.HF_TOKEN,
      baseURL: process.env.HF_BASE_URL || 'https://router.huggingface.co/v1',
    });
    // پیش‌فرض: Whisper Large v3 که روی HF میزبانی می‌شود
    this.model = process.env.HF_ASR_MODEL || 'openai/whisper-large-v3';
  }

  async transcribe(options: TranscribeOptions): Promise<TranscribeResult> {
    const file = await toFile(options.file, options.filename, { type: 'audio/mpeg' });
    
    // @ts-ignore (چون تایپ‌های OpenAI مدل‌های HF را نمی‌شناسند)
    const response = await this.client.audio.transcriptions.create({
      file,
      model: this.model,
      prompt: options.prompt,
      response_format: options.responseFormat || 'json',
      language: options.language || 'fa',
    });

    return {
      text: response.text,
      segments: (response as any).segments || undefined,
    };
  }
}