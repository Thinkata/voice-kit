// LLM status checking and provider management

export interface LLMStatusConfig {
  openaiApiKey?: string
  anthropicApiKey?: string
  togetherApiKey?: string
  llmProvider?: 'openai' | 'anthropic' | 'together' | 'auto'
  llmModel?: string
}

export interface LLMStatusResult {
  status: string
  hasApiKey: boolean
  selectedProvider: string
  selectedModel: string
  configuration: {
    provider: string
    model: string
  }
  providers: {
    openai: boolean
    anthropic: boolean
    together: boolean
  }
}

/**
 * Check LLM provider status and configuration
 */
export async function checkLLMStatus(config: LLMStatusConfig): Promise<LLMStatusResult> {
  const hasOpenAI = !!config.openaiApiKey
  const hasAnthropic = !!config.anthropicApiKey
  const hasTogether = !!config.togetherApiKey
  const hasApiKey = hasOpenAI || hasAnthropic || hasTogether
  
  // Determine which provider will be used
  let selectedProvider = 'none'
  let selectedModel = 'none'
  
  if (hasApiKey) {
    if (config.llmProvider && config.llmProvider !== 'auto') {
      // Specific provider configured
      if (config.llmProvider === 'openai' && hasOpenAI) {
        selectedProvider = 'openai'
        selectedModel = config.llmModel && config.llmModel !== 'auto' ? config.llmModel : 'gpt-3.5-turbo'
      } else if (config.llmProvider === 'anthropic' && hasAnthropic) {
        selectedProvider = 'anthropic'
        selectedModel = config.llmModel && config.llmModel !== 'auto' ? config.llmModel : 'claude-3-haiku-20240307'
      } else if (config.llmProvider === 'together' && hasTogether) {
        selectedProvider = 'together'
        selectedModel = config.llmModel && config.llmModel !== 'auto' ? config.llmModel : 'meta-llama/Llama-2-7b-chat-hf'
      }
    } else {
      // Auto-select: prefer Anthropic, then OpenAI, then Together.ai
      if (hasAnthropic) {
        selectedProvider = 'anthropic'
        selectedModel = config.llmModel && config.llmModel !== 'auto' ? config.llmModel : 'claude-3-haiku-20240307'
      } else if (hasOpenAI) {
        selectedProvider = 'openai'
        selectedModel = config.llmModel && config.llmModel !== 'auto' ? config.llmModel : 'gpt-3.5-turbo'
      } else if (hasTogether) {
        selectedProvider = 'together'
        selectedModel = config.llmModel && config.llmModel !== 'auto' ? config.llmModel : 'meta-llama/Llama-2-7b-chat-hf'
      }
    }
  }
  
  let status = 'Not configured'
  const configuredProviders = []
  if (hasOpenAI) configuredProviders.push('OpenAI')
  if (hasAnthropic) configuredProviders.push('Anthropic')
  if (hasTogether) configuredProviders.push('Together.ai')
  
  if (configuredProviders.length > 1) {
    status = `${configuredProviders.join(' & ')} configured (using ${selectedProvider})`
  } else if (configuredProviders.length === 1) {
    status = `${configuredProviders[0]} configured`
  }
  
  return {
    status,
    hasApiKey,
    selectedProvider,
    selectedModel,
    configuration: {
      provider: config.llmProvider || 'auto',
      model: config.llmModel || 'auto'
    },
    providers: {
      openai: hasOpenAI,
      anthropic: hasAnthropic,
      together: hasTogether
    }
  }
}

/**
 * Test if a specific LLM provider is available
 */
export async function testProviderAvailability(
  provider: 'openai' | 'anthropic' | 'together',
  apiKey: string
): Promise<boolean> {
  try {
    switch (provider) {
      case 'openai':
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        })
        return openaiResponse.ok
        
      case 'anthropic':
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        })
        return anthropicResponse.ok
        
      case 'together':
        const togetherResponse = await fetch('https://api.together.xyz/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        })
        return togetherResponse.ok
        
      default:
        return false
    }
  } catch (error) {
    console.error(`${provider} availability check failed:`, error)
    return false
  }
}
