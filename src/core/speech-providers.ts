import { SpeechToTextProvider, SpeechProvider, VoiceConfig } from './types'

export class ElevenLabsProvider implements SpeechToTextProvider {
  constructor(private config: VoiceConfig) {}

  async process(audioBlob: Blob): Promise<string> {
    const formData = new FormData()
    
    let fileExtension = 'webm'
    if (audioBlob.type.includes('mp4')) {
      fileExtension = 'mp4'
    } else if (audioBlob.type.includes('wav')) {
      fileExtension = 'wav'
    }
    
    formData.append('file', audioBlob, `recording.${fileExtension}`)

    const response = await fetch('/api/speech-to-text', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return result.text || ''
  }
}

export class TogetherAIProvider implements SpeechToTextProvider {
  constructor(private config: VoiceConfig) {}

  async process(audioBlob: Blob): Promise<string> {
    // Convert audio to base64
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(audioBlob)
    })

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please transcribe the following audio. Return only the spoken text, no additional commentary or formatting.'
              },
              {
                type: 'audio',
                audio: `data:${audioBlob.type};base64,${base64Audio}`
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Together.AI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return result.choices[0]?.message?.content || ''
  }
}

export class OpenAIProvider implements SpeechToTextProvider {
  constructor(private config: VoiceConfig) {}

  async process(audioBlob: Blob): Promise<string> {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', this.config.model || 'whisper-1')
    formData.append('language', this.config.language || 'en')
    formData.append('response_format', 'json')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    return result.text || ''
  }
}

export function createSpeechProvider(config: VoiceConfig): SpeechToTextProvider {
  switch (config.provider) {
    case 'elevenlabs':
      return new ElevenLabsProvider(config)
    case 'together':
      return new TogetherAIProvider(config)
    case 'openai':
      return new OpenAIProvider(config)
    default:
      throw new Error(`Unsupported speech provider: ${config.provider}`)
  }
}
