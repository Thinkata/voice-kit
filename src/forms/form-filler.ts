// Main form filler class that orchestrates the form filling process

import { FormStructure, FormFillConfig, FormFillResult, FormFillError } from './types'
import { detectFormStructure, generateSystemPrompt } from './form-detector'
import { parseSpeechToForm, validateFormData } from './form-parser'

export class FormFiller {
  private config: FormFillConfig
  private formStructure: FormStructure | null = null
  private highlightTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: FormFillConfig = {}) {
    this.config = {
      parseEndpoint: '/api/parse-speech',
      enableHighlights: true,
      highlightDuration: 3000,
      autoProcess: true,
      ...config
    }
  }

  /**
   * Initialize the form filler by detecting the current form structure
   */
  async initialize(): Promise<FormStructure | null> {
    this.formStructure = detectFormStructure()
    return this.formStructure
  }

  /**
   * Set a custom form structure
   */
  setFormStructure(structure: FormStructure): void {
    this.formStructure = structure
  }

  /**
   * Get the current form structure
   */
  getFormStructure(): FormStructure | null {
    return this.formStructure
  }

  /**
   * Process a speech transcript and fill the form
   */
  async processTranscript(transcript: string): Promise<FormFillResult> {
    if (!this.formStructure) {
      throw new Error('Form structure not initialized. Call initialize() first.')
    }

    try {
      const result = await parseSpeechToForm({
        transcript,
        formStructure: this.formStructure,
        config: this.config
      })

      if (result.success) {
        // Apply the data to the form
        await this.applyDataToForm(result.data)
        
        // Highlight updated fields
        if (this.config.enableHighlights) {
          this.highlightFields(result.updatedFields)
        }
      }

      return result
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
   * Apply parsed data to form fields
   */
  private async applyDataToForm(data: Record<string, any>): Promise<void> {
    if (!this.formStructure) return

    this.formStructure.fields.forEach(field => {
      const value = data[field.name]
      if (value !== null && value !== undefined) {
        this.setFieldValue(field.name, value)
      }
    })
  }

  /**
   * Set a field value in the form
   */
  private setFieldValue(fieldName: string, value: any): void {
    // Try to find the field by name first
    let field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    
    // If not found by name, try by ID
    if (!field) {
      field = document.getElementById(fieldName) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    }

    if (field) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        // Handle checkbox/radio inputs
        if (field.type === 'checkbox') {
          (field as HTMLInputElement).checked = Boolean(value)
        } else {
          // For radio buttons, find the one with matching value
          const radioGroup = document.querySelectorAll(`input[name="${fieldName}"]`) as NodeListOf<HTMLInputElement>
          radioGroup.forEach(radio => {
            radio.checked = radio.value === value
          })
        }
      } else {
        // Handle text inputs, selects, textareas
        field.value = String(value)
      }

      // Trigger change event
      field.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  /**
   * Highlight fields that were updated
   */
  private highlightFields(fieldNames: string[]): void {
    fieldNames.forEach(fieldName => {
      // Clear existing timeout for this field
      const existingTimeout = this.highlightTimeouts.get(fieldName)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Find the field element
      let field = document.querySelector(`[name="${fieldName}"]`) as HTMLElement
      if (!field) {
        field = document.getElementById(fieldName) as HTMLElement
      }

      if (field) {
        // Add highlight class
        field.classList.add('form-field-highlighted')
        
        // Set timeout to remove highlight
        const timeout = setTimeout(() => {
          field.classList.remove('form-field-highlighted')
          this.highlightTimeouts.delete(fieldName)
        }, this.config.highlightDuration)

        this.highlightTimeouts.set(fieldName, timeout)
      }
    })
  }

  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    this.highlightTimeouts.forEach(timeout => clearTimeout(timeout))
    this.highlightTimeouts.clear()
    
    // Remove all highlight classes
    const highlightedFields = document.querySelectorAll('.form-field-highlighted')
    highlightedFields.forEach(field => {
      field.classList.remove('form-field-highlighted')
    })
  }

  /**
   * Validate the current form data
   */
  validateForm(): Record<string, string> {
    if (!this.formStructure) {
      return { general: 'Form structure not initialized' }
    }

    const formData = this.getFormData()
    return validateFormData(formData, this.formStructure)
  }

  /**
   * Get current form data
   */
  getFormData(): Record<string, any> {
    if (!this.formStructure) return {}

    const formData: Record<string, any> = {}

    this.formStructure.fields.forEach(field => {
      let fieldElement = document.querySelector(`[name="${field.name}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      if (!fieldElement) {
        fieldElement = document.getElementById(field.name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      }

      if (fieldElement) {
        if (fieldElement.type === 'checkbox') {
          formData[field.name] = (fieldElement as HTMLInputElement).checked
        } else if (fieldElement.type === 'radio') {
          const radioGroup = document.querySelectorAll(`input[name="${field.name}"]:checked`) as NodeListOf<HTMLInputElement>
          formData[field.name] = radioGroup.length > 0 ? radioGroup[0].value : null
        } else {
          formData[field.name] = fieldElement.value
        }
      }
    })

    return formData
  }

  /**
   * Clear the form
   */
  clearForm(): void {
    if (!this.formStructure) return

    this.formStructure.fields.forEach(field => {
      let fieldElement = document.querySelector(`[name="${field.name}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      if (!fieldElement) {
        fieldElement = document.getElementById(field.name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      }

      if (fieldElement) {
        if (fieldElement.type === 'checkbox' || fieldElement.type === 'radio') {
          (fieldElement as HTMLInputElement).checked = false
        } else {
          fieldElement.value = ''
        }
        
        // Trigger change event
        fieldElement.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    this.clearHighlights()
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FormFillConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): FormFillConfig {
    return { ...this.config }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearHighlights()
    this.formStructure = null
  }
}
