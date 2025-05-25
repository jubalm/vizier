import { streamText } from 'ai'
import { createOpenAIProvider } from '../config'
import { getErrorMessage } from '../lib/errors'

export async function POST(req: Request): Promise<Response> {
  try {
    // Validate provider configuration
    let openaiProvider
    try {
      openaiProvider = createOpenAIProvider()
    } catch (configError: any) {
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
  } catch (error: any) {
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
}
