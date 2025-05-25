import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'

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
export function validateConfig() {
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

// Configure OpenAI provider with custom baseURL support
export function createOpenAIProvider() {
  console.log('[createOpenAIProvider] Attempting to configure OpenAI provider...')
  const config = validateConfig() // validateConfig already throws detailed errors if validation fails

  // Log the validated configuration (being mindful of sensitive data)
  console.log(`[createOpenAIProvider] Validated configuration - Base URL: ${config.OPENAI_BASE_URL}, API Key is set (length: ${config.OPENAI_API_KEY ? config.OPENAI_API_KEY.length : 'NOT SET'})`)

  try {
    const provider = createOpenAI({
      apiKey: config.OPENAI_API_KEY,
      baseURL: config.OPENAI_BASE_URL,
    })
    console.log('[createOpenAIProvider] OpenAI provider instance created successfully.')
    return provider
  } catch (initError) {
    // This catch block handles errors specifically from the createOpenAI() call itself
    console.error('[createOpenAIProvider] Failed to create OpenAI provider instance during createOpenAI call:', JSON.stringify(initError, Object.getOwnPropertyNames(initError), 2))
    // Re-throw to be caught by the route handler, which will return a 400
    // The message from initError should be preserved.
    throw new Error(`Failed to initialize OpenAI provider SDK: ${initError.message}`)
  }
}
