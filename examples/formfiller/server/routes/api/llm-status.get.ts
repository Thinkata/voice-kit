import { createLLMStatusHandler } from '@thinkata/voice-kit'

export default createLLMStatusHandler({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  llmProvider: (process.env.LLM_PROVIDER || 'auto') as 'openai' | 'anthropic' | 'together' | 'auto',
  llmModel: process.env.LLM_MODEL || 'auto'
})

