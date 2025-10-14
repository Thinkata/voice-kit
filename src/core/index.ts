// Core exports
export { createVoiceKit, VoiceKitImpl } from './voice-kit'
export { WebAudioRecorder } from './audio-recorder'
export { createSpeechProvider, ElevenLabsProvider, TogetherAIProvider, OpenAIProvider } from './speech-providers'

// Type exports
export type {
  VoiceKit,
  VoiceState,
  VoiceConfig,
  VoiceEvents,
  VoiceOptions,
  AudioRecorder,
  SpeechToTextProvider,
  SpeechProvider
} from './types'

// Utility functions
export { createVoiceKit as createVoice } from './voice-kit'
