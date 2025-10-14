// Speech parsing utilities for server-side processing

import { FormStructure } from '../forms/types'

export interface SpeechParserConfig {
  openaiApiKey?: string
  anthropicApiKey?: string
  togetherApiKey?: string
  defaultProvider?: 'openai' | 'anthropic' | 'together'
  maxRetries?: number
  timeout?: number
}

export interface SpeechParseResult {
  success: boolean
  data: Record<string, any>
  error?: string
}

/**
 * Parse speech text using LLM with dynamic form structure
 */
export async function parseSpeechToFormData(
  text: string,
  config: SpeechParserConfig,
  formStructure?: FormStructure
): Promise<Record<string, any>> {
  if (!formStructure || !formStructure.fields || formStructure.fields.length === 0) {
    throw new Error('Form structure is required for speech parsing')
  }

  try {
    const result = await parseWithLLM(text, config, formStructure)
    return result
  } catch (error) {
    console.error('LLM parsing failed:', error)
    throw new Error(`Failed to parse speech: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parse speech using LLM
 */
async function parseWithLLM(
  text: string, 
  config: SpeechParserConfig, 
  formStructure: FormStructure
): Promise<Record<string, any>> {
  const provider = config.defaultProvider || 'openai'
  
  if (provider === 'openai' && config.openaiApiKey) {
    return await parseWithOpenAI(text, config.openaiApiKey, formStructure)
  } else if (provider === 'anthropic' && config.anthropicApiKey) {
    return await parseWithAnthropic(text, config.anthropicApiKey, formStructure)
  } else if (provider === 'together' && config.togetherApiKey) {
    return await parseWithTogether(text, config.togetherApiKey, formStructure)
  } else {
    throw new Error('No valid LLM provider configured')
  }
}

/**
 * Parse with OpenAI
 */
async function parseWithOpenAI(
  text: string, 
  apiKey: string, 
  formStructure: FormStructure
): Promise<Record<string, any>> {
  const systemPrompt = generateSystemPrompt(formStructure)
  const clientPrompt = generateClientPrompt(text)
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: clientPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }
  
  const result = await response.json()
  const content = result.choices[0]?.message?.content
  
  if (!content) {
    throw new Error('No content returned from OpenAI')
  }
  
  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`)
  }
}

/**
 * Parse with Anthropic
 */
async function parseWithAnthropic(
  text: string, 
  apiKey: string, 
  formStructure: FormStructure
): Promise<Record<string, any>> {
  const systemPrompt = generateSystemPrompt(formStructure)
  const clientPrompt = generateClientPrompt(text)
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: clientPrompt }
      ]
    })
  })
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
  }
  
  const result = await response.json()
  const content = result.content[0]?.text
  
  if (!content) {
    throw new Error('No content returned from Anthropic')
  }
  
  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error(`Failed to parse Anthropic response as JSON: ${parseError}`)
  }
}

/**
 * Parse with Together.ai
 */
async function parseWithTogether(
  text: string, 
  apiKey: string, 
  formStructure: FormStructure
): Promise<Record<string, any>> {
  const systemPrompt = generateSystemPrompt(formStructure)
  const clientPrompt = generateClientPrompt(text)
  
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: clientPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })
  })
  
  if (!response.ok) {
    throw new Error(`Together.ai API error: ${response.status} ${response.statusText}`)
  }
  
  const result = await response.json()
  const content = result.choices[0]?.message?.content
  
  if (!content) {
    throw new Error('No content returned from Together.ai')
  }
  
  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error(`Failed to parse Together.ai response as JSON: ${parseError}`)
  }
}

/**
 * Generate system prompt based on form structure
 */
function generateSystemPrompt(formStructure: FormStructure): string {
  const { fields, formName } = formStructure
  
  let prompt = `You are an AI assistant that extracts structured data from speech input to fill out a form. `
  
  if (formName) {
    prompt += `The form is titled "${formName}". `
  }
  
  prompt += `\n\nYour task is to extract information from natural speech and return it as a valid JSON object with fields that match the form structure.`

  prompt += `\n\nCRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no explanations, no markdown, no additional text
2. Use null for missing fields - never omit fields
3. Follow the exact field structure specified below
4. Be conservative - only extract information that is explicitly mentioned
5. Handle various speech patterns, pauses, and natural language variations
6. Normalize data formats appropriately for each field type
7. For nested structures, create objects with the specified sub-fields
8. For arrays, return arrays of values
9. For select/radio fields, match the exact option text or value

FORM FIELDS TO EXTRACT:`

  // Generate field descriptions
  fields.forEach((field, index) => {
    prompt += `\n${index + 1}. **${field.name}**`
    
    if (field.label) {
      prompt += ` (Label: "${field.label}")`
    }
    
    if (field.placeholder) {
      prompt += ` (Placeholder: "${field.placeholder}")`
    }
    
    prompt += ` - Type: ${field.type}`
    
    if (field.required) {
      prompt += ` [REQUIRED]`
    }
    
    if (field.options && field.options.length > 0) {
      prompt += ` (Options: ${field.options.join(', ')})`
    }
    
    if (field.pattern) {
      prompt += ` (Pattern: ${field.pattern})`
    }
    
    if (field.minLength || field.maxLength) {
      prompt += ` (Length: ${field.minLength || 0}-${field.maxLength || 'unlimited'})`
    }
  })

  prompt += `\n\nPARSING RULES:
- Extract information that matches the field names and types above
- For nested objects, use the exact sub-field names specified
- For date fields, use YYYY-MM-DD format when possible
- For phone numbers, normalize to digits only
- For email addresses, validate the format
- For select/radio fields, match the exact option text or value
- For arrays, collect all mentioned values
- Be conservative - only extract information you're confident about

NUMBER CONSOLIDATION RULES:
- CRITICAL: When you hear multiple digits spoken individually, ALWAYS consolidate them into a single number
- Examples: "seven five two four one" → "75241", "one two three" → "123", "two one four" → "214"
- This applies to ALL number fields: zip codes, phone numbers, house numbers, years, dates, etc.
- For phone numbers: consolidate all digits and remove formatting (dashes, spaces, parentheses)
- For dates: convert to YYYY-MM-DD format after consolidation
- For years: "nineteen sixty eight" → "1968", "twenty twenty four" → "2024"
- For addresses: "one two three Main Street" → "123 Main Street"
- For zip codes: "seven five two four one" → "75241"
- Always prioritize the consolidated numeric form over the spoken form

Remember: Return ONLY the JSON object, nothing else.`
  
  return prompt
}

/**
 * Generate client prompt for specific speech input
 */
function generateClientPrompt(speechText: string): string {
  // Preprocess the speech text to consolidate numbers
  const preprocessedText = preprocessSpeechText(speechText)
  
  // Additional sanitization for LLM prompts
  const sanitizedText = preprocessedText
    .replace(/[{}[\]\\]/g, '') // Remove JSON control characters
    .replace(/"/g, "'") // Replace quotes to prevent JSON injection
    .substring(0, 5000) // Limit prompt length
  
  return `Extract personal information from this speech transcript and return it as a JSON object following the exact structure specified in the system prompt.

IMPORTANT: Consolidate all spoken numbers into their numeric form (e.g., "seven five two four one" → "75241").

Speech transcript: "${sanitizedText}"

Return only the JSON object with the extracted information.`
}

/**
 * Preprocess speech text for better LLM parsing
 */
function preprocessSpeechText(text: string): string {
  let processedText = text.trim()
  
  // Normalize common spoken number patterns
  const basicNumberMap = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  }
  
  Object.entries(basicNumberMap).forEach(([word, digit]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    processedText = processedText.replace(regex, digit)
  })
  
  return processedText
}

