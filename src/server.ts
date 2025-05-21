import { serve } from "bun"
import { Database } from "bun:sqlite"
import { createOpenAI } from "@ai-sdk/openai"
import { CoreMessage, coreMessageSchema, streamText } from 'ai'
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
// Initialize chat database for chat memory
const chatDb = new Database("./db/chat.db")

const PORT = process.env.PORT || 3000

serve({
  port: PORT,
  routes: {
    "/api/chat": {
      POST: async (req: Request) => {
        try {
          // --- Session validation ---
          const sessionId = req.headers.get("x-session-id") || ""
          if (!sessionId) {
            return new Response("Missing session", { status: 401 })
          }
          // Validate session
          const sessionRow = authDb
            .query<{ user_id: string; expires_at: string }, { $sessionId: string }>(
              "SELECT user_id, expires_at FROM sessions WHERE id = $sessionId"
            ).get({ $sessionId: sessionId }) as { user_id: string; expires_at: string } | undefined
          if (!sessionRow) {
            return new Response("Invalid session", { status: 401 })
          }
          if (new Date(sessionRow.expires_at) < new Date()) {
            return new Response("Session expired", { status: 401 })
          }
          const userId = sessionRow.user_id

          // --- Chat memory: load previous messages ---
          const previousMessages = (chatDb
            .query<CoreMessage, { $user_id: string; $session_id: string }>(
              "SELECT role, content FROM chat_messages WHERE user_id = $user_id AND session_id = $session_id ORDER BY created_at ASC"
            )
            .all({ $user_id: userId, $session_id: sessionId }))
            .map(row => ({ role: row.role, content: row.content }))

          // --- Parse and append new message ---
          const input = await req.json() as { messages: any }
          const parsedInput = chatInputSchema.safeParse(input)
          if (!parsedInput.success) {
            return new Response("Invalid input", { status: 400 })
          }
          // Only allow valid roles for chat memory
          const allMessages = [
            ...previousMessages,
            ...parsedInput.data.messages
          ]

          // --- AI response ---
          let assistantMessageContent = ""
          const result = streamText({
            model: customOpenAI('meta-llama/Meta-Llama-3.1-8B-Instruct'),
            messages: allMessages as any, // Let the SDK validate
            abortSignal: req.signal,
            onFinish: (finalMessage) => {
              // Persist assistant response to chat memory with type assertions
              let assistantContent = ""
              if (finalMessage && typeof finalMessage === 'object') {
                if ('message' in finalMessage && finalMessage.message && typeof finalMessage.message === 'object' && 'content' in finalMessage.message) {
                  assistantContent = (finalMessage.message.content as string)
                } else if ('text' in finalMessage) {
                  assistantContent = (finalMessage.text as string)
                } else if ('content' in finalMessage) {
                  assistantContent = (finalMessage as any).content as string
                } else {
                  assistantContent = JSON.stringify(finalMessage)
                }
              } else {
                assistantContent = String(finalMessage)
              }
              chatDb.query(
                "INSERT INTO chat_messages (id, user_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              ).run(
                crypto.randomUUID(),
                userId,
                sessionId,
                'assistant',
                assistantContent,
                new Date().toISOString()
              )
            }
          })

          // --- Save user messages to chat memory ---
          const now = new Date().toISOString()
          for (const msg of parsedInput.data.messages) {
            chatDb.query(
              "INSERT INTO chat_messages (id, user_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)"
            ).run(
              crypto.randomUUID(),
              userId,
              sessionId,
              msg.role,
              typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
              now
            )
          }
          // Save assistant response after streaming (not implemented here, see onFinish for full persistence)

          return result.toDataStreamResponse({ sendReasoning: true })
        } catch (e) {
          console.error("/api/chat error", e)
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
