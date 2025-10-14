import { createSpeechToTextHandler } from '@thinkata/voice-kit'

export default createSpeechToTextHandler({
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  speechProvider: (process.env.SPEECH_PROVIDER || 'elevenlabs') as 'elevenlabs' | 'openai'
})

