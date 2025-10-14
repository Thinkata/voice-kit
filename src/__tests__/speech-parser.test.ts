import { parseSpeechToFormData } from '../server/speech-parser'
import { FormStructure } from '../forms/types'

// Mock fetch globally
global.fetch = jest.fn()

describe('speech-parser', () => {
  const mockFormStructure: FormStructure = {
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', required: true },
      { name: 'lastName', type: 'text', label: 'Last Name', required: true },
      { name: 'email', type: 'email', label: 'Email' },
      { name: 'zipCode', type: 'text', label: 'Zip Code' }
    ],
    formName: 'Contact Form',
    totalFields: 4
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('parseSpeechToFormData', () => {
    it('should throw error without form structure', async () => {
      await expect(
        parseSpeechToFormData('test', { openaiApiKey: 'key' }, undefined)
      ).rejects.toThrow('Form structure is required')
    })

    it('should throw error with empty form structure', async () => {
      await expect(
        parseSpeechToFormData('test', { openaiApiKey: 'key' }, { fields: [], formName: '', totalFields: 0 })
      ).rejects.toThrow('Form structure is required')
    })

    it('should parse speech with OpenAI provider', async () => {
      const mockResponse = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        zipCode: '75241'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse)
              }
            }
          ]
        })
      })

      const config = {
        openaiApiKey: 'test-key',
        defaultProvider: 'openai' as const
      }

      const result = await parseSpeechToFormData(
        'My name is John Doe, email john@example.com, zip code seven five two four one',
        config,
        mockFormStructure
      )

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      )
    })

    it('should parse speech with Together provider', async () => {
      const mockResponse = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: null,
        zipCode: null
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse)
              }
            }
          ]
        })
      })

      const config = {
        togetherApiKey: 'test-key',
        defaultProvider: 'together' as const
      }

      const result = await parseSpeechToFormData(
        'My name is Jane Smith',
        config,
        mockFormStructure
      )

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.together.xyz/v1/chat/completions',
        expect.any(Object)
      )
    })

    it('should parse speech with Anthropic provider', async () => {
      const mockResponse = {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@test.com',
        zipCode: '12345'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify(mockResponse)
            }
          ]
        })
      })

      const config = {
        anthropicApiKey: 'test-key',
        defaultProvider: 'anthropic' as const
      }

      const result = await parseSpeechToFormData(
        'Bob Johnson, email bob@test.com, zip one two three four five',
        config,
        mockFormStructure
      )

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-key'
          })
        })
      )
    })

    it('should throw error when no provider is configured', async () => {
      await expect(
        parseSpeechToFormData('test', {}, mockFormStructure)
      ).rejects.toThrow('No valid LLM provider configured')
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const config = {
        openaiApiKey: 'test-key',
        defaultProvider: 'openai' as const
      }

      await expect(
        parseSpeechToFormData('test', config, mockFormStructure)
      ).rejects.toThrow('Failed to parse speech')
    })

    it('should handle invalid JSON responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'not valid json'
              }
            }
          ]
        })
      })

      const config = {
        openaiApiKey: 'test-key',
        defaultProvider: 'openai' as const
      }

      await expect(
        parseSpeechToFormData('test', config, mockFormStructure)
      ).rejects.toThrow('Failed to parse speech')
    })

    it('should handle missing content in response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: []
        })
      })

      const config = {
        openaiApiKey: 'test-key',
        defaultProvider: 'openai' as const
      }

      await expect(
        parseSpeechToFormData('test', config, mockFormStructure)
      ).rejects.toThrow('Failed to parse speech')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const config = {
        openaiApiKey: 'test-key',
        defaultProvider: 'openai' as const
      }

      await expect(
        parseSpeechToFormData('test', config, mockFormStructure)
      ).rejects.toThrow('Failed to parse speech')
    })

    it('should preprocess spoken numbers', async () => {
      const mockResponse = {
        firstName: 'Test',
        lastName: 'User',
        email: null,
        zipCode: '75241'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse)
              }
            }
          ]
        })
      })

      const config = {
        openaiApiKey: 'test-key',
        defaultProvider: 'openai' as const
      }

      await parseSpeechToFormData(
        'Name: Test User, zip code seven five two four one',
        config,
        mockFormStructure
      )

      // Verify fetch was called with preprocessed text
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)
      const userMessage = body.messages[1].content

      // Should contain consolidated numbers
      expect(userMessage).toContain('7 5 2 4 1')
    })
  })
})

