import { createParseSpeechHandler } from '@thinkata/voice-kit'

export default createParseSpeechHandler({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  defaultProvider: (process.env.LLM_PROVIDER || 'together') as 'openai' | 'anthropic' | 'together',
  maxRetries: 3,
  timeout: 30000
})

