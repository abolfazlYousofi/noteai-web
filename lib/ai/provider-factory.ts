import { AIProvider } from './provider';
import { OpenAIProvider } from './openai-provider';
import { HFProvider } from './hf-provider';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'openai'; // پیش‌فرض

  if (providerType === 'huggingface') {
    console.log('🧠 Using Hugging Face Provider');
    return new HFProvider();
  }

  console.log('🧠 Using OpenAI Provider');
  return new OpenAIProvider();
}