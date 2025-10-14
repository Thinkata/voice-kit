import { createVoiceKit } from '../core/voice-kit';
import { VoiceKit } from '../core/types';

// Mock the speech provider
jest.mock('../core/speech-providers', () => ({
  createSpeechProvider: jest.fn().mockReturnValue({
    process: jest.fn().mockResolvedValue('mocked transcript')
  })
}));

// Mock the audio recorder
jest.mock('../core/audio-recorder', () => ({
  WebAudioRecorder: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(new Blob()),
    isRecording: jest.fn().mockReturnValue(false),
    cleanup: jest.fn()
  }))
}));

describe('VoiceKit', () => {
  let voiceKit: VoiceKit;

  beforeEach(() => {
    voiceKit = createVoiceKit({
      config: {
        provider: 'elevenlabs',
        apiKey: 'test-key'
      }
    });
  });

  afterEach(() => {
    // Clean up any running instances
    if (voiceKit) {
      voiceKit.cleanup();
    }
  });

  describe('initialization', () => {
    test('should create VoiceKit instance', () => {
      expect(voiceKit).toBeDefined();
    });

    test('should not be recording initially', () => {
      const state = voiceKit.getState();
      expect(state.isRecording).toBe(false);
    });

    test('should have correct initial state', () => {
      const state = voiceKit.getState();
      expect(state).toEqual({
        isRecording: false,
        isProcessing: false,
        isActive: false,
        transcript: '',
        error: null,
        debugInfo: ''
      });
    });
  });

  describe('configuration', () => {
    test('should update configuration', () => {
      voiceKit.updateConfig({ language: 'es' });
      // Configuration update doesn't change state immediately
      const state = voiceKit.getState();
      expect(state).toBeDefined();
    });
  });

  describe('cleanup', () => {
    test('should cleanup without errors', () => {
      expect(() => voiceKit.cleanup()).not.toThrow();
    });
  });
});
