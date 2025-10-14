// Main exports for the @thinkata/forms package

export { FormFiller } from './form-filler'
export { 
  extractFormFields, 
  detectFormStructure, 
  generateSystemPrompt, 
  generateClientPrompt 
} from './form-detector'
export { 
  parseSpeechToForm, 
  validateFormData 
} from './form-parser'

export type {
  FormField,
  FormStructure,
  FormFillConfig,
  FieldMapping,
  FormFillResult,
  FormFillOptions,
  FormFillError
} from './types'

// Re-export voice-kit core types for convenience
export type { 
  VoiceConfig, 
  VoiceEvents, 
  SpeechProvider 
} from '../core/types'

// Vue composables
export { 
  useSimpleVoiceKit, 
  useVoiceKitWithForms,
  type UseVoiceKitOptions 
} from './composables'
