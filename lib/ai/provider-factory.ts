// lib/ai/provider-factory.ts
import { AIProvider } from './provider';
import { OpenAIProvider } from './openai-provider';
import { HFProvider } from './hf-provider';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'openai'; // پیش‌فرض openai

  if (providerType === 'huggingface') {
    console.log('🧠 Using Hugging Face provider');
    return new HFProvider();
  }

  console.log('🧠 Using OpenAI provider');
  return new OpenAIProvider();
}