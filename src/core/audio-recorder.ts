import { AudioRecorder } from './types'

export class WebAudioRecorder implements AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private isRecordingState = false

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      this.audioChunks = []
      
      // Check available MIME types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ]
      
      let selectedMimeType = 'audio/webm'
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: selectedMimeType })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.isRecordingState = false
        this.cleanup()
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        this.isRecordingState = false
        throw new Error('Recording error occurred')
      }

      this.mediaRecorder.start(1000) // Collect data every second
      this.isRecordingState = true
      
    } catch (error) {
      console.error('Recording setup error:', error)
      let errorMessage = 'Failed to start recording'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone permission denied. Please allow microphone access and try again.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is being used by another application. Please close other apps and try again.'
        } else {
          errorMessage = `Recording error: ${error.message}`
        }
      }
      
      throw new Error(errorMessage)
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.onstop = () => {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
          const audioBlob = new Blob(this.audioChunks, { type: mimeType })
          this.audioChunks = []
          this.isRecordingState = false
          resolve(audioBlob)
        }
        
        this.mediaRecorder.stop()
      } else {
        resolve(new Blob())
      }
    })
  }

  isRecording(): boolean {
    return this.isRecordingState
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecordingState = false
  }
}
