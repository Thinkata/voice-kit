# Vue Components for @thinkata/voice-kit

The package provides **example Vue components** that you can copy into your project for quick integration.

> **Note**: Due to Vue SFC limitations in npm packages, components are provided as **copyable source files** rather than direct imports. This approach gives you full control to customize the UI to match your app's design.

## Available Components

### VoiceInput.vue

A complete, self-contained voice input component with recording UI, transcript display, and error handling.

**Features:**
- ✅ Voice recording with start/stop button
- ✅ Real-time recording status (recording, processing, idle)
- ✅ Transcript display
- ✅ Error handling and display
- ✅ Beautiful, responsive UI
- ✅ Fully styled and ready to use

**How to Use:**

1. **Copy the component** from `node_modules/@thinkata/voice-kit/dist/components/VoiceInput.vue` to your `components/` directory

2. **Import and use** in your page:

```vue
<script setup>
import VoiceInput from '~/components/VoiceInput.vue'

const handleTranscript = async (transcript) => {
  console.log('User said:', transcript)
  // Parse and fill your form
}

const handleError = (error) => {
  console.error('Voice error:', error)
}
</script>

<template>
  <VoiceInput 
    @transcript="handleTranscript" 
    @error="handleError"
    apiEndpoint="/api/speech-to-text"
  />
</template>
```

**Props:**
- `apiEndpoint` (optional): Speech-to-text API endpoint (default: `/api/speech-to-text`)

**Events:**
- `@transcript(text: string)`: Emitted when speech is successfully converted to text
- `@error(error: string)`: Emitted when an error occurs

---

### SimpleFormExample.vue

A complete example showing how to integrate VoiceInput with a form.

**Usage:**

```vue
<script setup>
import SimpleFormExample from '@thinkata/voice-kit/components/SimpleFormExample.vue'
</script>

<template>
  <SimpleFormExample />
</template>
```

This component demonstrates:
- Voice input integration
- Form data mapping
- Field highlighting
- Error handling
- Complete workflow

---

## Installation & Setup

### 1. Install the Package

```bash
npm install @thinkata/voice-kit
```

### 2. Import Components

```vue
<script setup>
// Import the component you need
import VoiceInput from '@thinkata/voice-kit/components/VoiceInput.vue'
</script>
```

### 3. Set Up Server Endpoints

You need two server endpoints:

```typescript
// server/routes/api/speech-to-text.post.ts
import { createSpeechToTextHandler } from '@thinkata/voice-kit'

export default createSpeechToTextHandler({
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  speechProvider: 'elevenlabs'
})

// server/routes/api/parse-speech.post.ts
import { createParseSpeechHandler } from '@thinkata/voice-kit'

export default createParseSpeechHandler({
  openaiApiKey: process.env.OPENAI_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  defaultProvider: 'together'
})
```

### 4. Use in Your Form

```vue
<script setup lang="ts">
import VoiceInput from '@thinkata/voice-kit/components/VoiceInput.vue'
import { reactive } from 'vue'

const formData = reactive({
  name: '',
  email: '',
  message: ''
})

const handleTranscript = async (transcript: string) => {
  // Call your parse API
  const response = await fetch('/api/parse-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: transcript })
  })
  
  const result = await response.json()
  
  // Fill form with parsed data
  if (result.name) formData.name = result.name
  if (result.email) formData.email = result.email
  if (result.message) formData.message = result.message
}
</script>

<template>
  <div>
    <VoiceInput @transcript="handleTranscript" />
    
    <form @submit.prevent="handleSubmit">
      <input v-model="formData.name" placeholder="Name" />
      <input v-model="formData.email" placeholder="Email" />
      <textarea v-model="formData.message" placeholder="Message"></textarea>
      <button>Submit</button>
    </form>
  </div>
</template>
```

---

## Package Structure

```
@thinkata/voice-kit/
├── dist/
│   ├── index.js              # Main bundle
│   ├── index.esm.js          # ES module bundle
│   ├── index.d.ts            # TypeScript definitions
│   └── components/
│       ├── VoiceInput.vue           # Ready-to-use voice component
│       └── SimpleFormExample.vue    # Example integration
│
├── composables               # Exported from main bundle
├── server handlers           # Exported from main bundle
└── types                     # Exported from main bundle
```

## Benefits

✅ **No boilerplate**: Component is ready to use out of the box  
✅ **Consistent UI**: All apps get the same polished interface  
✅ **Easy maintenance**: Updates come with package updates  
✅ **Full customization**: Emit events let you control the behavior  
✅ **TypeScript support**: Full type safety  
✅ **Framework agnostic**: Works with Nuxt, Vue 3, or any Vue setup  

## License

MIT - Mark Williams

