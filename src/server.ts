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

// Initialize authentication database
const authDb = new Database("./db/auth.db")

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
    "/api/auth/register": {
      POST: async (req: Request) => {
        try {
          const { username, email } = await req.json() as { username: string, email: string }
          if (!username || !email) {
            return new Response("Missing username or email", { status: 400 })
          }
          const id = crypto.randomUUID()
          const created_at = new Date().toISOString()
          try {
            authDb.query("INSERT INTO users (id, username, email, created_at) VALUES (?, ?, ?, ?)").run(id, username, email, created_at)
          } catch (e) {
            return new Response("Username or email already exists", { status: 409 })
          }
          return new Response(JSON.stringify({ id, username, email, created_at }), { status: 201, headers: { "Content-Type": "application/json" } })
        } catch (e) {
          return new Response("Invalid request", { status: 400 })
        }
      },
    },
    "/api/auth/session": {
      POST: async (req: Request) => {
        try {
          const { username } = await req.json() as { username: string }
          if (!username) {
            return new Response("Missing username", { status: 400 })
          }
          const userRow = authDb
            .query<{ id: string }, { $username: string }>(
              "SELECT id FROM users WHERE username = $username"
            ).get({ $username: username })
          if (!userRow || !userRow.id) {
            return new Response("User not found", { status: 404 })
          }
          const userId = userRow.id
          const sessionId = crypto.randomUUID()
          const created_at = new Date().toISOString()
          const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24h
          authDb.query("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(sessionId, userId, created_at, expires_at)
          return new Response(JSON.stringify({ sessionId, userId, expires_at }), { status: 201, headers: { "Content-Type": "application/json" } })
        } catch (e) {
          return new Response("Invalid request", { status: 400 })
        }
      },
    },
    "/*": index,
  },
})

console.log(`Vizier API running on http://localhost:${PORT}`)
