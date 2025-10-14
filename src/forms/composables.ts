// Vue composables for voice-kit-forms
import { ref, computed, onUnmounted } from 'vue'

export interface UseVoiceKitOptions {
  /**
   * API endpoint for speech-to-text processing
   * This should point to your @thinkata/voice-kit-server endpoint
   * which proxies to the actual provider (ElevenLabs, OpenAI, Together.AI)
   * 
   * Supports both relative paths (same domain) and full URLs (different domains):
   * - Relative: '/api/speech-to-text' → Uses current domain
   * - Full URL: 'https://api.yoursite.com/api/speech-to-text' → Different domain
   * - With port: 'http://localhost:3003/api/speech-to-text' → Different port
   * 
   * @default '/api/speech-to-text'
   * @example '/api/speech-to-text' // Same domain (Nuxt monolith)
   * @example 'http://localhost:3003/api/speech-to-text' // Dev with different port
   * @example 'https://api.yoursite.com/api/speech-to-text' // Separate API server
   * @example `${config.public.apiBaseUrl}/api/speech-to-text` // Environment-based
   */
  apiEndpoint?: string
  
  /**
   * Auto-start recording on mount
   * @default false
   */
  autoStart?: boolean
}

/**
 * Simple Vue composable for voice recording and transcription
 * 
 * Records audio using MediaRecorder API and sends to your voice-kit-server endpoint.
 * The server endpoint (@thinkata/voice-kit-server) handles provider logic and API keys.
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useSimpleVoiceKit } from '@thinkata/voice-kit-forms'
 * 
 * // Points to your voice-kit-server endpoint
 * const { isRecording, startRecording, stopRecording, transcript, error } = useSimpleVoiceKit({
 *   apiEndpoint: '/api/speech-to-text'  // Your server route
 * })
 * </script>
 * ```
 */
export function useSimpleVoiceKit(options: UseVoiceKitOptions = {}) {
  const {
    apiEndpoint = '/api/speech-to-text',
    autoStart = false
  } = options

  // Reactive state
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const transcript = ref('')
  const error = ref<string | null>(null)
  const debugInfo = ref('')

  let audioChunks: Blob[] = []
  let mediaRecorder: MediaRecorder | null = null

  // Start recording using MediaRecorder API
  const startRecording = async () => {
    try {
      error.value = null
      audioChunks = []
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await processAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      isRecording.value = true
      debugInfo.value = 'Recording started...'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start recording'
      console.error('Recording error:', err)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      isRecording.value = false
      isProcessing.value = true
      debugInfo.value = 'Processing audio...'
    }
  }

  // Process audio by sending to API endpoint
  const processAudio = async (audioBlob: Blob) => {
    try {
      isProcessing.value = true
      
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')  // Must be 'file' to match server
      
      console.log('[Voice Kit] Sending audio to:', apiEndpoint)
      console.log('[Voice Kit] Audio blob size:', audioBlob.size, 'bytes')
      console.log('[Voice Kit] Audio blob type:', audioBlob.type)
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      })
      
      console.log('[Voice Kit] Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Voice Kit] Server error:', errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[Voice Kit] Response data:', data)
      
      if (data.text) {
        transcript.value = data.text
        debugInfo.value = 'Transcription complete'
        console.log('[Voice Kit] Transcript received:', data.text.substring(0, 50) + '...')
      } else {
        throw new Error('No transcript in response')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to process audio'
      console.error('[Voice Kit] Audio processing error:', err)
    } finally {
      isProcessing.value = false
    }
  }

  // Toggle recording
  const toggleRecording = async () => {
    if (isRecording.value) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  // Clear transcript
  const clearTranscript = () => {
    transcript.value = ''
    error.value = null
    debugInfo.value = ''
  }

  // Computed states
  const isActive = computed(() => isRecording.value || isProcessing.value)
  const hasTranscript = computed(() => transcript.value.length > 0)
  const hasError = computed(() => error.value !== null)

  // Cleanup on unmount
  onUnmounted(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  })

  // Auto-start if enabled
  if (autoStart) {
    startRecording()
  }

  return {
    // State
    isRecording,
    isProcessing,
    isActive,
    transcript,
    error,
    debugInfo,
    hasTranscript,
    hasError,
    
    // Actions
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript,
    
    // Config
    apiEndpoint: ref(apiEndpoint)
  }
}

/**
 * Advanced Vue composable with form filling capabilities
 */
export function useVoiceKitWithForms(options: UseVoiceKitOptions & {
  parseEndpoint?: string
  formStructure?: any
} = {}) {
  const {
    parseEndpoint = '/api/parse-speech',
    formStructure = null,
    ...voiceOptions
  } = options

  const voice = useSimpleVoiceKit(voiceOptions)
  const parsedData = ref<Record<string, any> | null>(null)
  const isParsing = ref(false)

  // Parse transcript into form data
  const parseTranscript = async (text: string) => {
    try {
      isParsing.value = true
      
      const response = await fetch(parseEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          formStructure
        })
      })
      
      if (!response.ok) {
        throw new Error(`Parse API error: ${response.status}`)
      }
      
      const data = await response.json()
      parsedData.value = data.data || data
      
      return data
    } catch (err) {
      voice.error.value = err instanceof Error ? err.message : 'Failed to parse transcript'
      throw err
    } finally {
      isParsing.value = false
    }
  }

  return {
    ...voice,
    parsedData,
    isParsing,
    parseTranscript
  }
}

