<template>
  <div class="simple-example">
    <h1>Simple Voice-to-Form Example</h1>
    <p class="subtitle">This demonstrates how easy it is to add voice input to ANY form using @thinkata/voice-kit</p>

    <!-- Step 1: Add the VoiceInput component -->
    <VoiceInput @transcript="handleTranscript" />

    <!-- Step 2: Your existing form (any form works!) -->
    <form @submit.prevent="handleSubmit" class="my-form">
      <div class="form-group">
        <label>Name:</label>
        <input v-model="formData.name" :class="{ highlighted: highlights.name }" />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input v-model="formData.email" type="email" :class="{ highlighted: highlights.email }" />
      </div>

      <div class="form-group">
        <label>Message:</label>
        <textarea v-model="formData.message" :class="{ highlighted: highlights.message }"></textarea>
      </div>

      <button type="submit">Submit</button>
    </form>

    <pre v-if="formData.name || formData.email || formData.message">{{ formData }}</pre>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

// Step 3: Define your form data
const formData = reactive({
  name: '',
  email: '',
  message: ''
})

const highlights = reactive({
  name: false,
  email: false,
  message: false
})

// Step 4: Handle the transcript and parse it
const handleTranscript = async (transcript: string) => {
  console.log('Got transcript:', transcript)
  
  try {
    // Call your API to parse the speech into structured data
    const response = await fetch('/api/parse-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcript })
    })
    
    const result = await response.json()
    const data = result.data || result
    
    // Step 5: Map the parsed data to your form
    if (data.name) {
      formData.name = data.name
      highlights.name = true
      setTimeout(() => highlights.name = false, 2000)
    }
    if (data.email) {
      formData.email = data.email
      highlights.email = true
      setTimeout(() => highlights.email = false, 2000)
    }
    if (data.message) {
      formData.message = data.message
      highlights.message = true
      setTimeout(() => highlights.message = false, 2000)
    }
  } catch (error) {
    console.error('Parse error:', error)
  }
}

const handleSubmit = () => {
  console.log('Form submitted:', formData)
  alert('Form submitted! Check console.')
}
</script>

<style scoped>
.simple-example {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.my-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

input.highlighted, textarea.highlighted {
  border-color: #4CAF50;
  background-color: #f8fff8;
  animation: highlight 0.5s;
}

@keyframes highlight {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #5568d3;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  overflow-x: auto;
}
</style>

