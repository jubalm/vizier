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
    // Specific logging for AI_APICallError, as it's often the one users encounter
    if (error.name === 'AI_APICallError') {
      console.error('[getErrorMessage] Handling AI_APICallError. Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    }

    const errorMap: Record<string, string | ((e: Error) => string)> = {
      'AI_APICallError': 'Failed to communicate with AI provider. Please check your API configuration and network. (Server logs have more details)',
      'AI_InvalidResponseDataError': 'Received invalid response from AI provider. Please try again.',
      // Keywords to check in error.message
      'API key': 'Invalid API key. Please check your OpenAI configuration.',
      'authentication token': 'Authentication token error. Please verify your API key and ensure it is valid for the configured API base URL.',
      'valid issuer': 'Authentication token issuer error. Please verify your API key and ensure it is compatible with the configured API base URL.',
      'quota': 'API quota exceeded. Please check your OpenAI usage limits.',
      'rate limit': 'Rate limit exceeded. Please wait a moment and try again.',
    }

    // Check for specific error names first
    if (error.name in errorMap) {
      const messageOrFn = errorMap[error.name]
      return typeof messageOrFn === 'function' ? messageOrFn(error) : messageOrFn
    }

    // Then check for keywords in the message
    for (const keyword in errorMap) {
      if (error.message.includes(keyword)) {
        const messageOrFn = errorMap[keyword]
        // Ensure we don't re-match on error.name keys if they happen to be substrings
        if (!Object.prototype.hasOwnProperty.call(errorMap, error.name) || !error.name.includes(keyword)) {
          return typeof messageOrFn === 'function' ? messageOrFn(error) : messageOrFn
        }
      }
    }
    // Default to the original error message if no specific mapping is found
    return error.message
  }

  return JSON.stringify(error)
}
