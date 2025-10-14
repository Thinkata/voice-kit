import { WebAudioRecorder } from '../core/audio-recorder'

// Mock MediaRecorder properly
class MockMediaRecorder {
  static isTypeSupported = jest.fn(() => true)
  state = 'inactive'
  ondataavailable: ((event: any) => void) | null = null
  onstop: ((event: any) => void) | null = null
  
  start() {
    this.state = 'recording'
  }
  
  stop() {
    this.state = 'inactive'
    if (this.onstop) {
      this.onstop({ data: new Blob() })
    }
  }
}

global.MediaRecorder = MockMediaRecorder as any

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [{
    stop: jest.fn()
  }]
})

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true,
  configurable: true
})

describe('WebAudioRecorder', () => {
  let recorder: WebAudioRecorder

  beforeEach(() => {
    recorder = new WebAudioRecorder()
    jest.clearAllMocks()
    mockGetUserMedia.mockClear()
  })

  afterEach(() => {
    if (recorder) {
      recorder.cleanup()
    }
  })

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(recorder).toBeDefined()
      expect(recorder).toBeInstanceOf(WebAudioRecorder)
    })

    it('should not be recording initially', () => {
      expect(recorder.isRecording()).toBe(false)
    })
  })

  describe('recording lifecycle', () => {
    it('should start recording', async () => {
      await recorder.start()
      expect(recorder.isRecording()).toBe(true)
    })

    it('should stop recording and return audio blob', async () => {
      await recorder.start()
      const blob = await recorder.stop()
      
      expect(blob).toBeDefined()
      expect(blob).toBeInstanceOf(Blob)
      expect(recorder.isRecording()).toBe(false)
    })

    it('should handle stop without start', async () => {
      const blob = await recorder.stop()
      expect(blob).toBeDefined()
      expect(blob.size).toBe(0)
    })
  })

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      expect(() => recorder.cleanup()).not.toThrow()
    })

    it('should cleanup while recording', async () => {
      await recorder.start()
      expect(() => recorder.cleanup()).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle getUserMedia errors gracefully', async () => {
      // Mock getUserMedia to reject
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

      await expect(recorder.start()).rejects.toThrow()
    })
  })
})

