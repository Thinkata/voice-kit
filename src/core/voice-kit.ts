import { VoiceKit, VoiceState, VoiceConfig, VoiceEvents, VoiceOptions, AudioRecorder, SpeechToTextProvider } from './types'
import { WebAudioRecorder } from './audio-recorder'
import { createSpeechProvider } from './speech-providers'

export class VoiceKitImpl implements VoiceKit {
  private state: VoiceState = {
    isRecording: false,
    isProcessing: false,
    isActive: false,
    transcript: '',
    error: null,
    debugInfo: ''
  }

  private config: VoiceConfig
  private events: VoiceEvents
  private audioRecorder: AudioRecorder
  private speechProvider: SpeechToTextProvider
  private isActive = false
  private interruptSignal = { shouldInterrupt: false }
  private recordingDuration: number
  private retryAttempts: number
  private retryDelay: number

  constructor(options: VoiceOptions) {
    this.config = options.config
    this.events = options.events || {}
    this.recordingDuration = options.recordingDuration || 5000
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 2000
    
    this.audioRecorder = new WebAudioRecorder()
    this.speechProvider = createSpeechProvider(this.config)
  }

  async start(): Promise<void> {
    if (this.isActive) return

    this.isActive = true
    this.interruptSignal.shouldInterrupt = false
    this.updateState({ isActive: true, debugInfo: 'Starting voice conversation...' })
    this.events.onStart?.()

    try {
      while (this.isActive && !this.interruptSignal.shouldInterrupt) {
        await this.recordAndProcess()
      }
    } catch (error) {
      console.error('Voice conversation error:', error)
      this.updateState({ 
        error: `Conversation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
      this.events.onError?.(this.state.error!)
    } finally {
      this.isActive = false
      this.updateState({ isActive: false, debugInfo: 'Voice conversation stopped' })
      this.events.onStop?.()
    }
  }

  stop(): void {
    this.isActive = false
    this.interruptSignal.shouldInterrupt = true
    this.updateState({ debugInfo: 'Stopping voice conversation...' })
    
    if (this.audioRecorder.isRecording()) {
      this.audioRecorder.stop()
    }
    
    this.updateState({ isRecording: false, isProcessing: false })
  }

  pause(): void {
    this.interruptSignal.shouldInterrupt = true
    this.updateState({ debugInfo: 'Voice conversation paused' })
  }

  resume(): void {
    this.interruptSignal.shouldInterrupt = false
    if (!this.isActive) {
      this.start()
    }
  }

  getState(): VoiceState {
    return { ...this.state }
  }

  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config }
    this.speechProvider = createSpeechProvider(this.config)
  }

  cleanup(): void {
    this.stop()
    this.audioRecorder.cleanup()
  }

  private async recordAndProcess(): Promise<void> {
    try {
      // Start recording
      this.updateState({ debugInfo: 'Starting recording...' })
      await this.audioRecorder.start()
      this.updateState({ isRecording: true, debugInfo: 'Recording started - speak now!' })

      // Wait for recording duration with interrupt checks
      await this.waitWithInterrupt(this.recordingDuration)

      if (this.interruptSignal.shouldInterrupt) return

      // Stop recording
      this.updateState({ debugInfo: 'Stopping recording...' })
      const audioBlob = await this.audioRecorder.stop()
      this.updateState({ isRecording: false })

      if (audioBlob.size === 0) {
        this.updateState({ debugInfo: 'No audio recorded, continuing...' })
        return
      }

      this.updateState({ debugInfo: `Audio recorded (${audioBlob.size} bytes), processing...` })

      if (this.interruptSignal.shouldInterrupt) return

      // Process with speech-to-text
      const transcript = await this.processAudio(audioBlob)
      
      if (this.interruptSignal.shouldInterrupt) return

      if (transcript.trim()) {
        this.updateState({ transcript, debugInfo: `Speech recognized: "${transcript}"` })
        this.events.onTranscript?.(transcript)
      } else {
        this.updateState({ debugInfo: 'No speech detected, continuing...' })
      }

      // Wait before next recording
      this.updateState({ debugInfo: 'Waiting before next recording...' })
      await this.waitWithInterrupt(2000)

    } catch (error) {
      console.error('Recording/processing error:', error)
      this.updateState({ 
        error: `Recording error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
      this.events.onError?.(this.state.error!)
    }
  }

  private async processAudio(audioBlob: Blob): Promise<string> {
    this.updateState({ isProcessing: true, debugInfo: 'Converting speech to text...' })

    try {
      // Check for interrupt before processing
      if (this.interruptSignal.shouldInterrupt) {
        return ''
      }

      // Check if audio blob is too small
      if (audioBlob.size < 10000) {
        this.updateState({ debugInfo: 'Audio too short, likely just noise' })
        return ''
      }

      const transcript = await this.speechProvider.process(audioBlob)
      
      if (transcript.trim()) {
        this.updateState({ debugInfo: `Speech recognized: "${transcript}"` })
      } else {
        this.updateState({ debugInfo: 'No speech detected in audio' })
      }

      return transcript

    } catch (error) {
      console.error('Speech-to-text error:', error)
      this.updateState({ 
        error: `Failed to convert speech to text: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
      this.events.onError?.(this.state.error!)
      return ''
    } finally {
      this.updateState({ isProcessing: false })
    }
  }

  private async waitWithInterrupt(duration: number): Promise<void> {
    const interval = 100
    const steps = Math.ceil(duration / interval)
    
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, interval))
      if (this.interruptSignal.shouldInterrupt) {
        console.log('Wait interrupted by user')
        break
      }
    }
  }

  private updateState(updates: Partial<VoiceState>): void {
    this.state = { ...this.state, ...updates }
    this.events.onStateChange?.(this.state)
  }
}

export function createVoiceKit(options: VoiceOptions): VoiceKit {
  return new VoiceKitImpl(options)
}
