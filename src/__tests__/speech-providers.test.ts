import { createSpeechProvider } from '../core/speech-providers'

// Mock fetch globally
global.fetch = jest.fn()

describe('speech-providers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('createSpeechProvider', () => {
    it('should create provider for elevenlabs', () => {
      const provider = createSpeechProvider({
        provider: 'elevenlabs',
        apiKey: 'test-key'
      })

      expect(provider).toBeDefined()
      expect(provider.process).toBeDefined()
    })

    it('should create provider for openai', () => {
      const provider = createSpeechProvider({
        provider: 'openai',
        apiKey: 'test-key'
      })

      expect(provider).toBeDefined()
      expect(provider.process).toBeDefined()
    })

    it('should create provider for together', () => {
      const provider = createSpeechProvider({
        provider: 'together',
        apiKey: 'test-key'
      })

      expect(provider).toBeDefined()
      expect(provider.process).toBeDefined()
    })
  })

  describe('provider processing', () => {
    it('should process audio with elevenlabs', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'test transcript' })
      })

      const provider = createSpeechProvider({
        provider: 'elevenlabs',
        apiKey: 'test-key'
      })

      const result = await provider.process(new Blob())
      expect(result).toBe('test transcript')
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const provider = createSpeechProvider({
        provider: 'elevenlabs',
        apiKey: 'test-key'
      })

      await expect(provider.process(new Blob())).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const provider = createSpeechProvider({
        provider: 'elevenlabs',
        apiKey: 'test-key'
      })

      await expect(provider.process(new Blob())).rejects.toThrow('Network error')
    })
  })
})

