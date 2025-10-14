export type SpeechProvider = 'elevenlabs' | 'together' | 'openai' | 'browser'

export interface VoiceConfig {
  provider: SpeechProvider
  apiKey: string
  model?: string
  language?: string
  temperature?: number
  maxTokens?: number
  noiseReduction?: boolean
  languageDetection?: boolean
}

export interface VoiceState {
  isRecording: boolean
  isProcessing: boolean
  isActive: boolean
  transcript: string
  error: string | null
  debugInfo: string
}

export interface VoiceEvents {
  onStart?: () => void
  onStop?: () => void
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  onStateChange?: (state: VoiceState) => void
}

export interface VoiceOptions {
  config: VoiceConfig
  events?: VoiceEvents
  recordingDuration?: number // in milliseconds
  retryAttempts?: number
  retryDelay?: number // in milliseconds
}

export interface AudioRecorder {
  start(): Promise<void>
  stop(): Promise<Blob>
  isRecording(): boolean
  cleanup(): void
}

export interface SpeechToTextProvider {
  process(audioBlob: Blob): Promise<string>
}

export interface VoiceKit {
  start(): Promise<void>
  stop(): void
  pause(): void
  resume(): void
  getState(): VoiceState
  updateConfig(config: Partial<VoiceConfig>): void
  cleanup(): void
}
