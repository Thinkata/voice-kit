// Speech-to-text provider implementations

export interface SpeechToTextConfig {
  elevenLabsApiKey?: string
  togetherApiKey?: string
  openaiApiKey?: string
  speechProvider?: 'elevenlabs' | 'together' | 'openai'
}

export interface SpeechToTextResult {
  text: string
}

/**
 * Process audio with ElevenLabs Speech-to-Text
 */
export async function processWithElevenLabs(audioFile: any, config: SpeechToTextConfig): Promise<SpeechToTextResult> {
  if (!config.elevenLabsApiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const elevenLabsFormData = new FormData()
  elevenLabsFormData.append('file', new Blob([audioFile.data], { type: audioFile.type || 'audio/webm' }), audioFile.filename || 'recording.webm')
  elevenLabsFormData.append('model_id', 'scribe_v1')

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': config.elevenLabsApiKey
    },
    body: elevenLabsFormData
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('ElevenLabs STT API Error:', errorText)
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  
  // Filter out results that are likely background noise
  const text = result.text || ''
  const languageCode = result.language_code || ''
  const languageProbability = result.language_probability || 0
  
  // Skip if language probability is too low (likely noise)
  if (languageProbability < 0.3) {
    return { text: '' }
  }
  
  // Skip very short responses that are likely noise
  if (text.length < 3) {
    return { text: '' }
  }
  
  // Skip text that's mostly punctuation or parentheses (common in noise detection)
  const cleanText = text.replace(/[^\w\s]/g, '').trim()
  if (cleanText.length < 2) {
    return { text: '' }
  }
  
  return { text }
}

/**
 * Process audio with Together.AI Speech-to-Text (using their multimodal models)
 */
export async function processWithTogether(audioFile: any, config: SpeechToTextConfig): Promise<SpeechToTextResult> {
  if (!config.togetherApiKey) {
    throw new Error('Together.AI API key not configured')
  }

  // Convert audio to base64
  const base64Audio = Buffer.from(audioFile.data).toString('base64')
  const mimeType = audioFile.type || 'audio/webm'

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.togetherApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
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
              audio: `data:${mimeType};base64,${base64Audio}`
            }
          ]
        }
      ],
      max_tokens: 500
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Together.AI STT API Error:', errorText)
    throw new Error(`Together.AI API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  const text = result.choices[0]?.message?.content || ''
  
  return { text: text.trim() }
}

/**
 * Process audio with OpenAI Whisper Speech-to-Text
 */
export async function processWithOpenAI(audioFile: any, config: SpeechToTextConfig): Promise<SpeechToTextResult> {
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const formData = new FormData()
  formData.append('file', new Blob([audioFile.data], { type: audioFile.type || 'audio/webm' }), audioFile.filename || 'recording.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', 'en')
  formData.append('response_format', 'json')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openaiApiKey}`
    },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI Whisper API Error:', errorText)
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  const text = result.text || ''
  
  return { text: text.trim() }
}

/**
 * Process audio with the configured speech provider
 */
export async function processSpeechToText(
  audioFile: any, 
  config: SpeechToTextConfig
): Promise<SpeechToTextResult> {
  const provider = config.speechProvider || 'elevenlabs'
  
  switch (provider) {
    case 'elevenlabs':
      return await processWithElevenLabs(audioFile, config)
    case 'together':
      return await processWithTogether(audioFile, config)
    case 'openai':
      return await processWithOpenAI(audioFile, config)
    default:
      throw new Error(`Unsupported speech provider: ${provider}`)
  }
}
