// Core types for form filling functionality

export interface FormField {
  name: string
  type: string
  label?: string
  placeholder?: string
  required?: boolean
  options?: string[] // for select/radio/checkbox groups
  pattern?: string // for input patterns
  minLength?: number
  maxLength?: number
  nested?: FormField[] // for nested structures
  isNested?: boolean // indicates if this field contains nested fields
}

export interface FormStructure {
  fields: FormField[]
  formName?: string
  formId?: string
  totalFields: number
}

export interface FormFillConfig {
  /** API endpoint for speech parsing */
  parseEndpoint?: string
  /** Custom field mappings */
  fieldMappings?: Record<string, FieldMapping>
  /** Whether to highlight filled fields */
  enableHighlights?: boolean
  /** Highlight duration in milliseconds */
  highlightDuration?: number
  /** Whether to auto-process transcripts */
  autoProcess?: boolean
  /** Custom validation function */
  validateField?: (fieldName: string, value: any) => string | null
}

export interface FieldMapping {
  /** Target field name in form data */
  targetField: string
  /** Transform function for the value */
  transform?: (value: any) => any
  /** Validation function */
  validate?: (value: any) => string | null
  /** Whether this field is nested */
  isNested?: boolean
  /** Parent field for nested fields */
  parentField?: string
}

export interface FormFillResult {
  /** Success status */
  success: boolean
  /** Parsed form data */
  data: Record<string, any>
  /** Any validation errors */
  errors: Record<string, string>
  /** Fields that were updated */
  updatedFields: string[]
}

export interface FormFillOptions {
  /** Speech transcript to parse */
  transcript: string
  /** Form structure for parsing */
  formStructure: FormStructure
  /** Custom configuration */
  config?: FormFillConfig
}

export interface FormFillError extends Error {
  code: string
  field?: string
}
