import { Hono } from 'hono'
import { streamText } from 'ai'
import { createOpenAIProvider } from '../config'

const chatRoutes = new Hono()

chatRoutes.post('/', async (c) => {
  try {
    // Validate provider configuration
    let openaiProvider
    try {
      openaiProvider = createOpenAIProvider()
    } catch (configError: any) {
      console.error('OpenAI configuration error:', configError)
      return c.json(
        {
          error: 'OpenAI configuration error',
          message: configError.message
        },
        400
      )
    }

    const { messages } = await c.req.json()

    if (!messages || !Array.isArray(messages)) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'Messages array is required'
        },
        400
      )
    }

    const result = await streamText({
      model: openaiProvider('meta-llama/Meta-Llama-3.1-8B-Instruct'),
      messages,
      maxTokens: 1000
    })

    // Correctly stream the response using Hono
    c.header('Content-Type', 'text/event-stream')
    c.header('Cache-Control', 'no-cache')
    c.header('Connection', 'keep-alive')

    // Directly return the ReadableStream from the AI SDK
    // Hono can handle ReadableStream directly in the body
    return c.body(result.toDataStream())
  } catch (error: any) {
    console.error('Chat API error:', error)

    // Handle specific AI SDK errors
    if (error.name === 'AI_APICallError') {
      return c.json(
        {
          error: 'API call failed',
          message: 'Failed to communicate with AI provider. Please check your configuration.'
        },
        502
      )
    }

    return c.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      },
      500
    )
  }
})

export default chatRoutes
