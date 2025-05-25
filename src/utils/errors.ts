// Error handler for streamText
export function getErrorMessage(error: unknown): string {
  // Log the raw error as soon as it enters the function for server-side diagnostics
  console.error('[getErrorMessage] Received error. Full details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

  if (error == null) {
    return 'An unknown error occurred'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    if (error.name === 'AI_APICallError') {
      console.error('[getErrorMessage] Handling AI_APICallError. Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    }
    const errorMap: Record<string, string | ((e: Error) => string)> = {
      'AI_APICallError': 'Failed to communicate with AI provider. Please check your API configuration and network. (Server logs have more details)',
      'AI_InvalidResponseDataError': 'Received invalid response from AI provider. Please try again.',
      'API key': 'Invalid API key. Please check your OpenAI configuration.',
      'authentication token': 'Authentication token error. Please verify your API key and ensure it is valid for the configured API base URL.',
      'valid issuer': 'Authentication token issuer error. Please verify your API key and ensure it is compatible with the configured API base URL.',
      'quota': 'API quota exceeded. Please check your OpenAI usage limits.',
      'rate limit': 'Rate limit exceeded. Please wait a moment and try again.',
    }
    if (error.name in errorMap) {
      const messageOrFn = errorMap[error.name]
      return typeof messageOrFn === 'function' ? messageOrFn(error) : messageOrFn
    }
    for (const keyword in errorMap) {
      if (error.message.includes(keyword)) {
        const messageOrFn = errorMap[keyword]
        return typeof messageOrFn === 'function' ? messageOrFn(error) : messageOrFn
      }
    }
    return error.message || 'An unknown error occurred'
  }
  return 'An unknown error occurred'
}
