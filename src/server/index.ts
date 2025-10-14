// Main exports for the @thinkata/server package

// Nitro/h3 Handler Creators (primary export for Nuxt/Nitro users)
export {
  createParseSpeechHandler,
  createSpeechToTextHandler,
  createLLMStatusHandler
} from './handlers'

// Core utilities (for custom implementations or non-Nitro servers)
export {
  checkRateLimit,
  getClientIdentifier,
  clearRateLimit,
  getRateLimitStatus,
  getAllRateLimitEntries
} from './rate-limiter'

export {
  parseSpeechToFormData
} from './speech-parser'

export type {
  SpeechParserConfig,
  SpeechParseResult
} from './speech-parser'

export {
  validateTextInput,
  validateAudioFile,
  validateFormStructure,
  createErrorResponse,
  createSuccessResponse
} from './validation'

export {
  processWithElevenLabs,
  processWithTogether,
  processWithOpenAI,
  processSpeechToText
} from './speech-providers'

export type {
  SpeechToTextConfig,
  SpeechToTextResult
} from './speech-providers'

export {
  checkLLMStatus
} from './llm-status'

export type {
  LLMStatusConfig,
  LLMStatusResult
} from './llm-status'

// Re-export types from forms package
export type {
  FormField,
  FormStructure,
  FormFillConfig,
  FieldMapping,
  FormFillResult
} from '../forms/types'

