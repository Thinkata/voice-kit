// Form field detection utilities for dynamic parsing

import { FormField, FormStructure } from './types'

/**
 * Extract form field information from a form element, detecting nested structures
 */
export function extractFormFields(formElement: HTMLFormElement): FormField[] {
  const fields: FormField[] = []
  const processedFields = new Set<string>()
  
  // Get all input, select, and textarea elements
  const inputs = formElement.querySelectorAll('input, select, textarea')
  
  inputs.forEach((element) => {
    const input = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const fieldName = input.name || input.id || ''
    
    // Skip if already processed (for radio/checkbox groups)
    if (processedFields.has(fieldName)) {
      return
    }
    
    const field: FormField = {
      name: fieldName,
      type: input.type || input.tagName.toLowerCase(),
      required: input.hasAttribute('required'),
      minLength: input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength')!) : undefined,
      maxLength: input.getAttribute('maxlength') ? parseInt(input.getAttribute('maxlength')!) : undefined,
      pattern: input.getAttribute('pattern') || undefined
    }
    
    // Get label text
    const label = formElement.querySelector(`label[for="${input.id}"]`) || 
                 input.closest('label')
    if (label) {
      field.label = label.textContent?.trim() || ''
    }
    
    // Get placeholder
    if ('placeholder' in input && input.placeholder) {
      field.placeholder = input.placeholder
    }
    
    // Handle select options
    if (input.tagName.toLowerCase() === 'select') {
      const select = input as HTMLSelectElement
      field.options = Array.from(select.options).map(option => option.textContent?.trim() || '')
    }
    
    // Handle radio/checkbox groups
    if (input.type === 'radio' || input.type === 'checkbox') {
      const groupName = input.name
      const groupInputs = formElement.querySelectorAll(`input[name="${groupName}"]`)
      if (groupInputs.length > 1) {
        field.options = Array.from(groupInputs).map(input => 
          (input as HTMLInputElement).value || input.nextElementSibling?.textContent?.trim() || ''
        )
        processedFields.add(groupName)
      }
    }
    
    // Check for nested structures by looking for fieldset or div containers
    const container = input.closest('fieldset, div[class*="field"], div[class*="group"], section')
    if (container && container !== formElement) {
      const nestedFields = extractNestedFields(container, fieldName)
      if (nestedFields.length > 0) {
        field.nested = nestedFields
        field.isNested = true
        field.type = 'nested'
      }
    }
    
    // Only add fields with meaningful names
    if (field.name) {
      fields.push(field)
      processedFields.add(fieldName)
    }
  })
  
  return fields
}

/**
 * Extract nested fields from a container element
 */
function extractNestedFields(container: Element, parentName: string): FormField[] {
  const nestedFields: FormField[] = []
  const processedFields = new Set<string>()
  
  const inputs = container.querySelectorAll('input, select, textarea')
  
  inputs.forEach((element) => {
    const input = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const fieldName = input.name || input.id || ''
    
    // Skip if already processed or if it's the parent field itself
    if (processedFields.has(fieldName) || fieldName === parentName) {
      return
    }
    
    const field: FormField = {
      name: fieldName,
      type: input.type || input.tagName.toLowerCase(),
      required: input.hasAttribute('required'),
      minLength: input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength')!) : undefined,
      maxLength: input.getAttribute('maxlength') ? parseInt(input.getAttribute('maxlength')!) : undefined,
      pattern: input.getAttribute('pattern') || undefined
    }
    
    // Get label text
    const label = container.querySelector(`label[for="${input.id}"]`) || 
                 input.closest('label')
    if (label) {
      field.label = label.textContent?.trim() || ''
    }
    
    // Get placeholder
    if ('placeholder' in input && input.placeholder) {
      field.placeholder = input.placeholder
    }
    
    // Handle select options
    if (input.tagName.toLowerCase() === 'select') {
      const select = input as HTMLSelectElement
      field.options = Array.from(select.options).map(option => option.textContent?.trim() || '')
    }
    
    // Handle radio/checkbox groups
    if (input.type === 'radio' || input.type === 'checkbox') {
      const groupName = input.name
      const groupInputs = container.querySelectorAll(`input[name="${groupName}"]`)
      if (groupInputs.length > 1) {
        field.options = Array.from(groupInputs).map(input => 
          (input as HTMLInputElement).value || input.nextElementSibling?.textContent?.trim() || ''
        )
        processedFields.add(groupName)
      }
    }
    
    // Recursively check for deeper nesting
    const deeperContainer = input.closest('fieldset, div[class*="field"], div[class*="group"], section')
    if (deeperContainer && deeperContainer !== container) {
      const deeperNestedFields = extractNestedFields(deeperContainer, fieldName)
      if (deeperNestedFields.length > 0) {
        field.nested = deeperNestedFields
        field.isNested = true
        field.type = 'nested'
      }
    }
    
    if (field.name) {
      nestedFields.push(field)
      processedFields.add(fieldName)
    }
  })
  
  return nestedFields
}

/**
 * Detect form structure from the current page
 */
export function detectFormStructure(): FormStructure | null {
  // Look for forms on the page
  const forms = document.querySelectorAll('form')
  
  if (forms.length === 0) {
    return null
  }
  
  // Use the first form found (or the one with the most fields)
  let targetForm = forms[0]
  let maxFields = 0
  
  forms.forEach(form => {
    const fieldCount = form.querySelectorAll('input, select, textarea').length
    if (fieldCount > maxFields) {
      maxFields = fieldCount
      targetForm = form
    }
  })
  
  const fields = extractFormFields(targetForm as HTMLFormElement)
  const formName = targetForm.getAttribute('name') || 
                  targetForm.querySelector('h1, h2, h3, legend')?.textContent?.trim() ||
                  'Form'
  
  return {
    fields,
    formName,
    formId: targetForm.id || undefined,
    totalFields: fields.length
  }
}

/**
 * Generate a system prompt based on detected form fields with arbitrary nested structures
 */
export function generateSystemPrompt(formStructure: FormStructure): string {
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

  // Generate field descriptions recursively
  const fieldDescriptions = generateFieldDescriptions(fields, 1)
  prompt += `\n${fieldDescriptions}`

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
 * Generate field descriptions recursively for nested structures
 */
function generateFieldDescriptions(fields: FormField[], level: number = 1): string {
  let descriptions = ''
  const indent = '  '.repeat(level - 1)
  
  fields.forEach((field, index) => {
    const fieldNumber = level === 1 ? `${index + 1}.` : `${level}.${index + 1}.`
    descriptions += `\n${indent}${fieldNumber} **${field.name}**`
    
    if (field.label) {
      descriptions += ` (Label: "${field.label}")`
    }
    
    if (field.placeholder) {
      descriptions += ` (Placeholder: "${field.placeholder}")`
    }
    
    descriptions += ` - Type: ${field.type}`
    
    if (field.required) {
      descriptions += ` [REQUIRED]`
    }
    
    if (field.options && field.options.length > 0) {
      descriptions += ` (Options: ${field.options.join(', ')})`
    }
    
    if (field.pattern) {
      descriptions += ` (Pattern: ${field.pattern})`
    }
    
    if (field.minLength || field.maxLength) {
      descriptions += ` (Length: ${field.minLength || 0}-${field.maxLength || 'unlimited'})`
    }
    
    // Handle nested fields
    if (field.nested && field.nested.length > 0) {
      descriptions += `\n${indent}   Contains nested fields:`
      descriptions += generateFieldDescriptions(field.nested, level + 1)
    }
  })
  
  return descriptions
}

/**
 * Generate a client prompt for the specific speech input
 */
export function generateClientPrompt(speechText: string): string {
  return `Please extract form data from this speech input: "${speechText}"`
}
