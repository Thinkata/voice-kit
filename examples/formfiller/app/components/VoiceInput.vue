<template>
  <div class="voice-card">
    <h2>🎤 Voice Input</h2>
    <div class="voice-controls">
      <button 
        @click="toggleRecording" 
        :disabled="isProcessing"
        :class="['voice-btn', { 'recording': isRecording, 'processing': isProcessing }]"
      >
        <span v-if="!isRecording && !isProcessing">Start Speaking</span>
        <span v-else-if="isRecording">Stop Recording</span>
        <span v-else>Processing...</span>
      </button>
      
      <div v-if="transcript" class="transcript-display">
        <div class="transcript-header">
          <h3>Transcript:</h3>
          <div class="processing-status">
            <div v-if="isProcessing" class="processing-indicator">
              <span class="spinner"></span>
              Processing...
            </div>
          </div>
        </div>
        <p class="transcript-text">{{ transcript }}</p>
      </div>

      <!-- Error Display -->
      <div v-if="voiceError" class="error-message">
        <h3>Error:</h3>
        <p>{{ voiceError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimpleVoiceKit } from '@thinkata/voice-kit'

// Props
interface Props {
  apiEndpoint?: string
}

const props = withDefaults(defineProps<Props>(), {
  apiEndpoint: '/api/speech-to-text'
})

// Emits
const emit = defineEmits<{
  (e: 'transcript', value: string): void
  (e: 'error', value: string): void
}>()

// Voice Kit setup
const { 
  isRecording, 
  isProcessing,
  toggleRecording,
  transcript, 
  error: voiceError
} = useSimpleVoiceKit({
  apiEndpoint: props.apiEndpoint
})

// Watch for transcript changes and emit to parent
watch(transcript, (newTranscript) => {
  if (newTranscript?.trim()) {
    emit('transcript', newTranscript)
  }
})

// Watch for errors and emit to parent
watch(voiceError, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})
</script>

<style scoped>
.voice-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.voice-card h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.voice-controls {
  text-align: center;
}

.voice-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  font-weight: 600;
}

.voice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.voice-btn.recording {
  background: linear-gradient(45deg, #f44336, #d32f2f);
  animation: pulse 1.5s infinite;
}

.voice-btn.processing {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  cursor: not-allowed;
}

.voice-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.transcript-display {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.transcript-display h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.transcript-text {
  margin: 0;
  color: #666;
  font-style: italic;
  line-height: 1.5;
}

.processing-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #007bff;
  font-size: 0.9rem;
  font-weight: 500;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.error-message h3 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
}

.error-message p {
  margin: 0;
}
</style>

