import { serve } from "bun"
import index from "./index.html"
import { createOpenAI, openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { z } from 'zod'

// Environment configuration schema
const envSchema = z.object({
  OPENAI_API_KEY: z
    .string()
    .min(1, 'OPENAI_API_KEY is required')
    .refine(
      (key) => key !== 'your-api-key' && key !== 'your-openai-api-key-here',
      'OPENAI_API_KEY must be set to a valid API key, not the placeholder value'
    )
    .refine(
      (key) => key.startsWith('sk-') || key.includes('hf_') || key.length > 20,
      'OPENAI_API_KEY appears to be invalid format'
    ),
  OPENAI_BASE_URL: z
    .string()
    .url('OPENAI_BASE_URL must be a valid URL')
    .optional()
    .default('https://api.openai.com/v1'),
})

// Validate environment variables with Zod
function validateConfig() {
  try {
    const config = envSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    })

    return config
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('; ')
      throw new Error(`Configuration validation failed: ${errorMessages}`)
    }
    throw error
  }
}

// Error handler for streamText
function getErrorMessage(error: unknown): string {
  if (error == null) {
    return 'An unknown error occurred'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    const errorMap: Record<string, string | ((e: Error) => string)> = {
      'AI_APICallError': 'Failed to communicate with AI provider. Please check your API configuration.',
      'AI_InvalidResponseDataError': 'Received invalid response from AI provider. Please try again.',
      // Keywords to check in error.message
      'API key': 'Invalid API key. Please check your OpenAI configuration.',
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

// Configure OpenAI provider with custom baseURL support
function createOpenAIProvider() {
  const config = validateConfig()

  return createOpenAI({
    apiKey: config.OPENAI_API_KEY,
    baseURL: config.OPENAI_BASE_URL,
  })
}

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/chat": {
      async POST(req) {
        try {
          // Validate provider configuration
          let openaiProvider
          try {
            openaiProvider = createOpenAIProvider()
          } catch (configError) {
            console.error('OpenAI configuration error:', configError)
            return new Response(
              JSON.stringify({
                error: 'OpenAI configuration error',
                message: configError.message
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          const { messages } = await req.json()

          if (!messages || !Array.isArray(messages)) {
            return new Response(
              JSON.stringify({
                error: 'Invalid request',
                message: 'Messages array is required'
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          const result = await streamText({
            model: openaiProvider('meta-llama/Meta-Llama-3.1-8B-Instruct'),
            messages,
            maxTokens: 1000,
          })

          return result.toDataStreamResponse({
            getErrorMessage,
          })
        } catch (error) {
          console.error('Chat API error:', error)

          // Handle specific AI SDK errors
          if (error.name === 'AI_APICallError') {
            return new Response(
              JSON.stringify({
                error: 'API call failed',
                message: 'Failed to communicate with AI provider. Please check your configuration.'
              }),
              {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          return new Response(
            JSON.stringify({
              error: 'Internal server error',
              message: 'An unexpected error occurred'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        })
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        })
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name
      return Response.json({
        message: `Hello, ${name}!`,
      })
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
