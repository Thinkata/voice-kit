# Voice Kit

> **Complete voice-powered application toolkit** - Speech-to-text, AI form filling, and serverless API handlers all in one package.

[![npm version](https://badge.fury.io/js/%40thinkata%2Fvoice-kit.svg)](https://www.npmjs.com/package/@thinkata/voice-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Version**: 0.0.3

## Overview

Voice Kit is an all-in-one solution for building voice-powered web applications. It combines:

- **Core** - Framework-agnostic speech-to-text primitives
- **Forms** - Vue 3 composables for voice-powered form filling
- **Server** - Nitro/h3 API handlers for serverless deployments
- **Components** - Ready-to-use Vue components for voice input

All in a single, easy-to-install package!

## Features

- 🎤 **Multiple Speech Providers** - ElevenLabs, OpenAI, Together AI
- 🤖 **AI-Powered Form Filling** - Intelligent form parsing with LLM integration
- ⚡ **Serverless Ready** - Works with Nuxt, Nitro, Cloudflare Workers, Vercel
- 🔒 **Built-in Rate Limiting** - Protect your API endpoints
- 📱 **Vue 3 Composables** - Reactive hooks for easy integration
- 🎨 **Ready-to-Use Components** - Beautiful voice input UI components
- 🎯 **TypeScript First** - Full type safety out of the box
- 🌐 **Framework Agnostic Core** - Use anywhere JavaScript runs

## Installation

```bash
npm install @thinkata/voice-kit
```

## Quick Start

### Option 1: Use Pre-built Components (Easiest)

```vue
<script setup>
import VoiceInput from '@thinkata/voice-kit/components/VoiceInput.vue'
import { reactive } from 'vue'

const formData = reactive({
  name: '',
  email: '',
  message: ''
})

const handleTranscript = async (transcript) => {
  // Call your parse API
  const response = await fetch('/api/parse-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text: transcript,
      formStructure: { fields: ['name', 'email', 'message'] }
    })
  })
  
  const result = await response.json()
  Object.assign(formData, result.data)
}
</script>

<template>
  <div>
    <VoiceInput 
      @transcript="handleTranscript" 
      apiEndpoint="/api/speech-to-text"
    />
    
    <form>
      <input v-model="formData.name" placeholder="Name" />
      <input v-model="formData.email" placeholder="Email" />
      <textarea v-model="formData.message" placeholder="Message" />
      <button>Submit</button>
    </form>
  </div>
</template>
```

### Option 2: Use Composables (More Control)

```vue
<template>
  <div>
    <button @click="toggleRecording">
      {{ isRecording ? 'Stop' : 'Start' }} Recording
    </button>
    <p v-if="transcript">{{ transcript }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { useSimpleVoiceKit } from '@thinkata/voice-kit'

const {
  isRecording,
  transcript,
  error,
  toggleRecording
} = useSimpleVoiceKit({
  apiEndpoint: '/api/speech-to-text'
})
</script>
```

### Server-Side Setup (Required)

Create API endpoints in your Nuxt/Nitro app:

#### `/server/api/speech-to-text.post.ts`

```typescript
import { createSpeechToTextHandler } from '@thinkata/voice-kit'

export default createSpeechToTextHandler({
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  speechProvider: (process.env.SPEECH_PROVIDER || 'elevenlabs') as any
})
```

#### `/server/api/parse-speech.post.ts` (Optional, for form filling)

```typescript
import { createParseSpeechHandler } from '@thinkata/voice-kit'

export default createParseSpeechHandler({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  togetherApiKey: process.env.TOGETHER_API_KEY,
  defaultProvider: (process.env.LLM_PROVIDER || 'together') as any
})
```

### Environment Variables

Create `.env` file:

```env
# Speech-to-Text Provider (choose one)
ELEVENLABS_API_KEY=your_elevenlabs_key
SPEECH_PROVIDER=elevenlabs

# LLM Provider for form parsing (optional)
TOGETHER_API_KEY=your_together_key
LLM_PROVIDER=together
```

## API Reference

### Vue Components

See [COMPONENTS.md](./COMPONENTS.md) for detailed component documentation.

#### `VoiceInput.vue`

Ready-to-use voice input component with recording UI.

**Import:**
```vue
import VoiceInput from '@thinkata/voice-kit/components/VoiceInput.vue'
```

**Props:**
- `apiEndpoint?: string` - Speech-to-text API endpoint (default: `/api/speech-to-text`)

**Events:**
- `@transcript(text: string)` - Emitted when speech is transcribed
- `@error(error: string)` - Emitted on error

### Client-Side Composables

#### `useSimpleVoiceKit(options)`

Basic voice recording and transcription.

**Options:**
- `apiEndpoint?: string` - Server endpoint (default: '/api/speech-to-text')
- `autoStart?: boolean` - Auto-start recording (default: false)

**Returns:**
- `isRecording: Ref<boolean>` - Recording state
- `isProcessing: Ref<boolean>` - Processing state
- `transcript: Ref<string>` - Transcribed text
- `error: Ref<string | null>` - Error message
- `startRecording()` - Start recording
- `stopRecording()` - Stop and transcribe
- `toggleRecording()` - Toggle state

#### `useVoiceKitWithForms(options)`

Voice-powered form filling with AI parsing.

**Options:**
- `formStructure: FormStructure` - Form field definitions
- `apiEndpoint?: string` - Speech-to-text endpoint
- `parseEndpoint?: string` - Form parsing endpoint (default: '/api/parse-speech')

**Returns:** Same as `useSimpleVoiceKit` plus:
- `formData: Ref<Record<string, any>>` - Parsed form data
- `fillForm()` - Fill form with parsed data

### Server-Side Handlers

#### `createSpeechToTextHandler(config)`

Creates h3 handler for speech-to-text.

**Config:**
- `elevenLabsApiKey?: string` - ElevenLabs API key
- `togetherApiKey?: string` - Together AI API key
- `openaiApiKey?: string` - OpenAI API key
- `speechProvider: 'elevenlabs' | 'together' | 'openai'` - Provider to use

#### `createParseSpeechHandler(config)`

Creates h3 handler for parsing speech into form data.

**Config:**
- `openaiApiKey?: string` - OpenAI API key
- `anthropicApiKey?: string` - Anthropic API key
- `togetherApiKey?: string` - Together AI API key
- `defaultProvider: 'openai' | 'anthropic' | 'together'` - LLM provider
- `maxRetries?: number` - Max retry attempts (default: 3)
- `timeout?: number` - Request timeout ms (default: 30000)

#### `createLLMStatusHandler(config)`

Creates h3 handler for checking LLM availability.

**Config:**
- `openaiApiKey?: string`
- `anthropicApiKey?: string`
- `togetherApiKey?: string`
- `llmProvider: 'openai' | 'anthropic' | 'together' | 'auto'`
- `llmModel?: string` - Model name (default: 'auto')

## Supported Platforms

- ✅ **Nuxt 3** - Full support with server API routes
- ✅ **Nitro** - Standalone server applications
- ✅ **Cloudflare Workers** - Serverless edge deployment
- ✅ **Vercel** - Serverless functions
- ✅ **Node.js** - Standard HTTP servers
- ✅ **Vue 3** - Client-side composables

## Speech Providers

### ElevenLabs (Recommended)
- High accuracy
- Low latency
- Supports multiple languages
- Get API key: https://elevenlabs.io

### OpenAI Whisper
- Excellent accuracy
- Supports 100+ languages
- Get API key: https://platform.openai.com

### Together AI
- Cost-effective
- Good performance
- Get API key: https://together.ai

## Security Best Practices

1. **Never expose API keys** - Always use environment variables on server
2. **Use rate limiting** - Protect against abuse (built-in)
3. **Validate inputs** - Use built-in validation utilities
4. **HTTPS only** - Never use HTTP in production
5. **CORS configuration** - Restrict origins in production

## Troubleshooting

### "No audio recorded"
- Check microphone permissions in browser
- Verify browser supports MediaRecorder API
- Test on different browser (Chrome recommended)

### "API key invalid"
- Verify `.env` file is loaded correctly
- Check API key format and validity
- Ensure keys are set on server-side only

### "Package not found" errors
- Run `npm install` to ensure dependencies installed
- Clear cache: `npm cache clean --force`
- Check package version: `npm list @thinkata/voice-kit`

### Component import errors
- Ensure you're using the correct import path:
  - `@thinkata/voice-kit/components/VoiceInput.vue`
- Check that Vue is installed: `npm install vue@^3.0.0`

## Examples

See the [examples/formfiller](./examples/formfiller) directory for a complete working example.

## Contributing

Contributions are welcome! Please see our [GitHub repository](https://github.com/Thinkata/voice-kit) for guidelines.

## License

MIT © Mark Williams

## Links

- [GitHub Repository](https://github.com/Thinkata/voice-kit)
- [Component Documentation](./COMPONENTS.md)
- [Issue Tracker](https://github.com/Thinkata/voice-kit/issues)
- [NPM Package](https://www.npmjs.com/package/@thinkata/voice-kit)
