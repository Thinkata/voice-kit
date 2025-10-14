// Input validation utilities for server-side APIs

/**
 * Sanitize text input to prevent injection attacks
 */
export function sanitizeTextInput(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .substring(0, 10000) // Limit length
}

/**
 * Validate text input for speech parsing
 */
export function validateTextInput(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Valid text input is required' }
  }

  const sanitized = sanitizeTextInput(text)
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Text input is empty after sanitization' }
  }

  if (sanitized.length > 10000) {
    return { valid: false, error: 'Text input too long (max 10,000 characters)' }
  }

  return { valid: true }
}

/**
 * Validate audio file for speech-to-text processing
 */
export function validateAudioFile(file: { data: Buffer; name?: string; type?: string }): { valid: boolean; error?: string } {
  if (!file || !file.data) {
    return { valid: false, error: 'Audio file is required' }
  }

  // Check file size (max 25MB)
  if (file.data.length > 25 * 1024 * 1024) {
    return { valid: false, error: 'Audio file too large (max 25MB)' }
  }

  // Check file type
  const allowedTypes = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/mp4',
    'audio/webm',
    'audio/ogg',
    'audio/flac'
  ]

  if (file.type && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `Unsupported audio format. Allowed: ${allowedTypes.join(', ')}` }
  }

  return { valid: true }
}

/**
 * Validate form structure
 */
export function validateFormStructure(formStructure: any): { valid: boolean; error?: string } {
  if (!formStructure) {
    return { valid: false, error: 'Form structure is required' }
  }

  if (!formStructure.fields || !Array.isArray(formStructure.fields)) {
    return { valid: false, error: 'Form structure must have a fields array' }
  }

  if (formStructure.fields.length === 0) {
    return { valid: false, error: 'Form structure must have at least one field' }
  }

  // Validate each field
  for (const field of formStructure.fields) {
    if (!field.name || typeof field.name !== 'string') {
      return { valid: false, error: 'Each field must have a valid name' }
    }
  }

  return { valid: true }
}

/**
 * Create error response
 */
export function createErrorResponse(statusCode: number, message: string) {
  return {
    statusCode,
    statusMessage: message
  }
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any) {
  return {
    success: true,
    data
  }
}

