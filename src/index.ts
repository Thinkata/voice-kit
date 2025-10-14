// Core exports
export * from './core/types'
export * from './core/audio-recorder'
export * from './core/speech-providers'
export * from './core/voice-kit'

// Forms exports
export * from './forms/form-detector'
export * from './forms/form-filler'
export * from './forms/form-parser'
export * from './forms/composables'
export type { FormField, FormStructure, FormFillConfig, FieldMapping, FormFillResult } from './forms/types'

// Note: Vue components are NOT exported from main entry
// Copy them from dist/components/ to your project instead
// See COMPONENTS.md for details

// Server exports
export * from './server/handlers'
export * from './server/llm-status'
export * from './server/rate-limiter'
export * from './server/speech-parser'
export * from './server/speech-providers'
export * from './server/validation'

