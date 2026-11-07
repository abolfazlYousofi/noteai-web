// lib/ai/openai-provider.ts
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { AIProvider, TranscribeOptions, TranscribeResult } from './provider';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model = 'whisper-1';

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });
  }

  async transcribe(options: TranscribeOptions): Promise<TranscribeResult> {
    const file = await toFile(options.file, options.filename, { type: 'audio/webm' });
    
    const response = await this.client.audio.transcriptions.create({
      file,
      model: this.model,
      prompt: options.prompt,
      response_format: options.responseFormat || 'json',
      language: options.language,
    });

    return {
      text: response.text,
      segments: (response as any).segments || undefined,
    };
  }
}