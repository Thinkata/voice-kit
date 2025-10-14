// Form parsing and data mapping utilities

import { FormStructure, FormFillConfig, FormFillResult, FieldMapping, FormFillError } from './types'

/**
 * Parse speech transcript and map to form data
 */
export async function parseSpeechToForm(options: {
  transcript: string
  formStructure: FormStructure
  config?: FormFillConfig
}): Promise<FormFillResult> {
  const { transcript, formStructure, config = {} } = options
  
  try {
    // Parse the speech using LLM
    const parsedData = await parseWithLLM(transcript, formStructure, config)
    
    // Map the parsed data to form structure
    const { data, errors, updatedFields } = mapDataToForm(parsedData, formStructure, config)
    
    return {
      success: true,
      data,
      errors,
      updatedFields
    }
  } catch (error) {
    const formError = error as FormFillError
    return {
      success: false,
      data: {},
      errors: { general: formError.message },
      updatedFields: []
    }
  }
}

/**
 * Parse speech using LLM API
 */
async function parseWithLLM(transcript: string, formStructure: FormStructure, config: FormFillConfig): Promise<Record<string, any>> {
  const endpoint = config.parseEndpoint || '/api/parse-speech'
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      text: transcript,
      formStructure: formStructure
    })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to parse speech: ${response.status} ${response.statusText}`)
  }
  
  const result = await response.json()
  return result.data || result
}

/**
 * Map parsed data to form structure
 */
function mapDataToForm(
  parsedData: Record<string, any>, 
  formStructure: FormStructure, 
  config: FormFillConfig
): { data: Record<string, any>, errors: Record<string, string>, updatedFields: string[] } {
  const data: Record<string, any> = {}
  const errors: Record<string, string> = {}
  const updatedFields: string[] = []
  
  // Process each field in the form structure
  formStructure.fields.forEach(field => {
    const fieldValue = getFieldValue(parsedData, field)
    
    if (fieldValue !== null && fieldValue !== undefined) {
      // Apply field mapping if configured
      const mapping = config.fieldMappings?.[field.name]
      if (mapping) {
        try {
          const transformedValue = mapping.transform ? mapping.transform(fieldValue) : fieldValue
          const validationError = mapping.validate ? mapping.validate(transformedValue) : null
          
          if (validationError) {
            errors[field.name] = validationError
          } else {
            data[field.name] = transformedValue
            updatedFields.push(field.name)
          }
        } catch (error) {
          errors[field.name] = `Transform error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      } else {
        // Use custom validation if provided
        const validationError = config.validateField ? config.validateField(field.name, fieldValue) : null
        
        if (validationError) {
          errors[field.name] = validationError
        } else {
          data[field.name] = fieldValue
          updatedFields.push(field.name)
        }
      }
    }
  })
  
  return { data, errors, updatedFields }
}

/**
 * Get field value from parsed data, handling nested structures
 */
function getFieldValue(parsedData: Record<string, any>, field: any): any {
  // Check for direct field match
  if (parsedData[field.name] !== undefined) {
    return parsedData[field.name]
  }
  
  // Check for nested structure
  if (field.isNested && field.nested) {
    const nestedData: Record<string, any> = {}
    let hasNestedData = false
    
    field.nested.forEach((nestedField: any) => {
      const nestedValue = getFieldValue(parsedData, nestedField)
      if (nestedValue !== null && nestedValue !== undefined) {
        nestedData[nestedField.name] = nestedValue
        hasNestedData = true
      }
    })
    
    return hasNestedData ? nestedData : null
  }
  
  // Check for common field name variations
  const variations = getFieldVariations(field.name)
  for (const variation of variations) {
    if (parsedData[variation] !== undefined) {
      return parsedData[variation]
    }
  }
  
  return null
}

/**
 * Get common field name variations for better matching
 */
function getFieldVariations(fieldName: string): string[] {
  const variations: string[] = []
  const lowerName = fieldName.toLowerCase()
  
  // Common variations
  const commonMappings: Record<string, string[]> = {
    'firstname': ['firstName', 'first_name', 'fname'],
    'lastname': ['lastName', 'last_name', 'lname'],
    'email': ['emailAddress', 'email_address'],
    'phone': ['phoneNumber', 'phone_number', 'telephone', 'tel'],
    'dateofbirth': ['dob', 'birthDate', 'birth_date'],
    'street': ['streetAddress', 'street_address', 'address1'],
    'city': ['cityName', 'city_name'],
    'state': ['stateName', 'state_name', 'province'],
    'zipcode': ['zip', 'postalCode', 'postal_code', 'zipCode']
  }
  
  if (commonMappings[lowerName]) {
    variations.push(...commonMappings[lowerName])
  }
  
  // Add camelCase and snake_case variations
  variations.push(
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
    fieldName.replace(/([A-Z])/g, '_$1').toLowerCase(),
    fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  )
  
  return variations
}

/**
 * Validate form data against form structure
 */
export function validateFormData(data: Record<string, any>, formStructure: FormStructure): Record<string, string> {
  const errors: Record<string, string> = {}
  
  formStructure.fields.forEach(field => {
    const value = data[field.name]
    
    // Check required fields
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field.name] = `${field.label || field.name} is required`
      return
    }
    
    if (value !== null && value !== undefined) {
      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors[field.name] = 'Invalid email format'
          }
          break
        case 'tel':
          if (!isValidPhone(value)) {
            errors[field.name] = 'Invalid phone number format'
          }
          break
        case 'date':
          if (!isValidDate(value)) {
            errors[field.name] = 'Invalid date format'
          }
          break
        case 'number':
          if (isNaN(Number(value))) {
            errors[field.name] = 'Must be a valid number'
          }
          break
      }
      
      // Length validation
      if (typeof value === 'string') {
        if (field.minLength && value.length < field.minLength) {
          errors[field.name] = `Must be at least ${field.minLength} characters`
        }
        if (field.maxLength && value.length > field.maxLength) {
          errors[field.name] = `Must be no more than ${field.maxLength} characters`
        }
      }
      
      // Pattern validation
      if (field.pattern && typeof value === 'string') {
        const regex = new RegExp(field.pattern)
        if (!regex.test(value)) {
          errors[field.name] = 'Invalid format'
        }
      }
    }
  })
  
  return errors
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Phone validation
 */
function isValidPhone(phone: string): boolean {
  if (!phone) return true
  const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
  return phoneRegex.test(phone)
}

/**
 * Date validation
 */
function isValidDate(date: string): boolean {
  if (!date) return true
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime()) && dateObj <= new Date()
}
