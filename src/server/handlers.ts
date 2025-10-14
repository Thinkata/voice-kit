// Nitro/h3-based request handlers for Voice Kit server API

import { 
  parseSpeechToFormData, 
  SpeechParserConfig 
} from './speech-parser'
import { 
  checkRateLimit, 
  getClientIdentifier 
} from './rate-limiter'
import { 
  validateTextInput, 
  validateAudioFile, 
  validateFormStructure 
} from './validation'
import {
  processSpeechToText,
  SpeechToTextConfig
} from './speech-providers'
import {
  checkLLMStatus,
  LLMStatusConfig
} from './llm-status'

// Import h3 utilities
import { defineEventHandler, createError, readBody, readMultipartFormData } from 'h3'

/**
 * Create a parse speech handler for Nitro
 * @param config Speech parser configuration
 * @returns Event handler function
 */
export function createParseSpeechHandler(config: SpeechParserConfig) {
  return defineEventHandler(async (event: any) => {
    try {
      // Rate limiting
      const clientId = getClientIdentifier(event)
      const rateLimit = checkRateLimit(clientId, 20, 60000) // 20 requests per minute
      
      if (!rateLimit.allowed) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Too many requests. Please try again later.'
        })
      }

      const body = await readBody(event)
      const { text, formStructure } = body

      // Validate text input
      const textValidation = validateTextInput(text)
      if (!textValidation.valid) {
        throw createError({
          statusCode: 400,
          statusMessage: textValidation.error
        })
      }

      // Validate form structure
      const formValidation = validateFormStructure(formStructure)
      if (!formValidation.valid) {
        throw createError({
          statusCode: 400,
          statusMessage: formValidation.error
        })
      }

      // Parse the speech text using LLM with dynamic form structure
      const parsedData = await parseSpeechToFormData(text, config, formStructure)
      
      console.log('Parsing speech text (length):', text.length)
      console.log('Form structure fields:', formStructure?.fields?.length || 'none')
      console.log('Parsed data keys:', Object.keys(parsedData))

      return {
        success: true,
        data: parsedData
      }
    } catch (error: any) {
      console.error('Error parsing speech:', error)
      
      // Don't expose internal error details to client
      if (error.statusCode) {
        throw error
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to parse speech'
      })
    }
  })
}

/**
 * Create a speech-to-text handler for Nitro
 * @param config Speech-to-text configuration
 * @returns Event handler function
 */
export function createSpeechToTextHandler(config: SpeechToTextConfig) {
  return defineEventHandler(async (event: any) => {
    try {
      // Rate limiting for audio processing (more restrictive)
      const clientId = getClientIdentifier(event)
      const rateLimit = checkRateLimit(clientId, 10, 60000) // 10 requests per minute
      
      if (!rateLimit.allowed) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Too many requests. Please try again later.'
        })
      }

      const formData = await readMultipartFormData(event)
      
      if (!formData || formData.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No audio file provided'
        })
      }

      const audioFile = formData.find((field: any) => field.name === 'file')
      if (!audioFile || !audioFile.data) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Audio file is required'
        })
      }

      // Validate file size (max 25MB)
      if (audioFile.data.length > 25 * 1024 * 1024) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Audio file too large (max 25MB)'
        })
      }

      // Validate audio file
      const audioValidation = validateAudioFile(audioFile)
      if (!audioValidation.valid) {
        throw createError({
          statusCode: 400,
          statusMessage: audioValidation.error
        })
      }

      // Process with configured provider using the unified function
      const result = await processSpeechToText(audioFile, config)
      
      return result
      
    } catch (error: any) {
      console.error('Speech-to-text Server Error:', error)
      
      if (error.statusCode) {
        throw error
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: `Internal server error: ${error.message}`
      })
    }
  })
}

/**
 * Create an LLM status handler for Nitro
 * @param config LLM status configuration
 * @returns Event handler function
 */
export function createLLMStatusHandler(config: LLMStatusConfig) {
  return defineEventHandler(async (event: any) => {
    try {
      const status = await checkLLMStatus(config)
      return status
    } catch (error) {
      console.error('Error checking LLM status:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check LLM status'
      })
    }
  })
}

