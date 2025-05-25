import { serve } from "bun"
import index from "./index.html"
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Validate environment variables
function validateOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  
  if (!apiKey || apiKey === 'your-api-key') {
    throw new Error('OPENAI_API_KEY is required and must be set to a valid API key')
  }
  
  return { apiKey, model }
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
    // Handle specific error types
    if (error.name === 'AI_APICallError') {
      return 'Failed to communicate with AI provider. Please check your API configuration.'
    }
    if (error.name === 'AI_InvalidResponseDataError') {
      return 'Received invalid response from AI provider. Please try again.'
    }
    if (error.message.includes('API key')) {
      return 'Invalid API key. Please check your OpenAI configuration.'
    }
    if (error.message.includes('quota')) {
      return 'API quota exceeded. Please check your OpenAI usage limits.'
    }
    if (error.message.includes('rate limit')) {
      return 'Rate limit exceeded. Please wait a moment and try again.'
    }
    
    return error.message
  }

  return JSON.stringify(error)
}

// Configure OpenAI provider with custom baseURL support
function createOpenAIProvider() {
  const { apiKey } = validateOpenAIConfig()
  
  return createOpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL, // Optional: for custom OpenAI-compatible endpoints
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

          const { model } = validateOpenAIConfig()
          
          const result = await streamText({
            model: openaiProvider(model),
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
