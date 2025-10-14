// Tests for FormFiller class

import { FormFiller } from '../forms/form-filler'
import { FormStructure } from '../forms/types'

// Mock DOM
const mockForm = document.createElement('form')
const mockInput = document.createElement('input')
mockInput.name = 'testField'
mockInput.type = 'text'
mockForm.appendChild(mockInput)

// Mock document methods
Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn(() => [mockForm])
})

Object.defineProperty(document, 'querySelector', {
  value: jest.fn(() => mockInput)
})

Object.defineProperty(document, 'getElementById', {
  value: jest.fn(() => mockInput)
})

describe('FormFiller', () => {
  let formFiller: FormFiller

  beforeEach(() => {
    formFiller = new FormFiller()
    jest.clearAllMocks()
  })

  afterEach(() => {
    formFiller.destroy()
  })

  describe('initialization', () => {
    it('should initialize with default config', () => {
      expect(formFiller.getConfig()).toEqual({
        parseEndpoint: '/api/parse-speech',
        enableHighlights: true,
        highlightDuration: 3000,
        autoProcess: true
      })
    })

    it('should initialize with custom config', () => {
      const customConfig = {
        parseEndpoint: '/custom-endpoint',
        enableHighlights: false,
        highlightDuration: 5000
      }
      const customFormFiller = new FormFiller(customConfig)
      expect(customFormFiller.getConfig()).toEqual({
        ...customConfig,
        autoProcess: true
      })
    })
  })

  describe('form structure detection', () => {
    it('should detect form structure', async () => {
      const structure = await formFiller.initialize()
      expect(structure).toBeDefined()
      expect(structure?.fields).toHaveLength(1)
      expect(structure?.fields[0].name).toBe('testField')
    })

    it('should set custom form structure', () => {
      const customStructure: FormStructure = {
        fields: [
          { name: 'customField', type: 'text', label: 'Custom Field' }
        ],
        formName: 'Custom Form',
        totalFields: 1
      }
      
      formFiller.setFormStructure(customStructure)
      expect(formFiller.getFormStructure()).toEqual(customStructure)
    })
  })

  describe('form data management', () => {
    beforeEach(async () => {
      await formFiller.initialize()
    })

    it('should get form data', () => {
      mockInput.value = 'test value'
      const formData = formFiller.getFormData()
      expect(formData).toEqual({ testField: 'test value' })
    })

    it('should clear form', () => {
      mockInput.value = 'test value'
      formFiller.clearForm()
      expect(mockInput.value).toBe('')
    })
  })

  describe('configuration updates', () => {
    it('should update configuration', () => {
      const newConfig = { enableHighlights: false }
      formFiller.updateConfig(newConfig)
      expect(formFiller.getConfig().enableHighlights).toBe(false)
    })
  })
})
