import { Hono } from 'hono'
import { streamText } from 'ai'
import { createOpenAIProvider } from '../../config'
import { sessionAuth } from '../auth/middleware'

const chatRoutes = new Hono()

// Apply sessionAuth middleware to all chat routes
chatRoutes.use('*', sessionAuth)

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

    c.header('Content-Type', 'text/event-stream')
    c.header('Cache-Control', 'no-cache')
    c.header('Connection', 'keep-alive')

    return c.body(result.toDataStream())
  } catch (error: any) {
    console.error('Chat API error:', error)
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
