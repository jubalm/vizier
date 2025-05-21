import { serve } from "bun"
import { Database } from "bun:sqlite"
import { createOpenAI } from "@ai-sdk/openai"
import { coreMessageSchema, streamText } from 'ai'
import index from "./index.html"
import { z } from 'zod'

// Initialize SQLite database
const db = new Database("./src/vizier.db")

const customOpenAI = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
})

const chatInputSchema = z.object({
  messages: coreMessageSchema.array(),
})

const PORT = process.env.PORT || 3000

serve({
  port: PORT,
  routes: {
    "/api/chat": {
      POST: async (req: Request) => {
        try {
          const input = await req.json() as { messages: any }
          const parsedInput = chatInputSchema.safeParse(input)
          if (!parsedInput.success) {
            return new Response("Invalid input", { status: 400 })
          }
          const result = streamText({
            model: customOpenAI('meta-llama/Meta-Llama-3.1-8B-Instruct'),
            messages: parsedInput.data.messages,
            abortSignal: req.signal
          })

          return result.toDataStreamResponse({ sendReasoning: true })
        } catch (e) {
          return new Response("Invalid request", { status: 400 })
        }
      },
    },
    "/*": index,
  },
})

console.log(`Vizier API running on http://localhost:${PORT}`)
