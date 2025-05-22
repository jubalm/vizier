import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { serve } from 'bun'
import { Database } from "bun:sqlite"
import { createOpenAI } from "@ai-sdk/openai"
import { CoreMessage, coreMessageSchema, streamText } from 'ai'
import { z } from 'zod'
import index from "./index.html"

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

type UserContext = { userId: string }

const app = new Hono<{ Variables: UserContext }>().basePath('/api')

// --- Auth middleware ---
const requireAuth = async (c: Context<{ Variables: UserContext }>, next: Next) => {
  const cookie = c.req.header('cookie') || ''
  const sessionId = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('sessionId='))?.split('=')[1] || ''
  if (!sessionId) return c.text('Missing session', 401)
  const sessionRow = authDb
    .query<{ user_id: string; expires_at: string }, { $sessionId: string }>(
      "SELECT user_id, expires_at FROM sessions WHERE id = $sessionId"
    ).get({ $sessionId: sessionId })
  if (!sessionRow) return c.text('Invalid session', 401)
  if (new Date(sessionRow.expires_at) < new Date()) return c.text('Session expired', 401)
  c.set('userId', sessionRow.user_id)
  return next()
}

// --- Chat API ---
app.post('/chat', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { chat_session_id, messages } = await c.req.json()
  if (!chat_session_id) return c.text('Missing chat_session_id', 400)
  const chatSession = chatDb.query<{ id: string }, { $id: string, $user_id: string }>(
    "SELECT id FROM chat_sessions WHERE id = $id AND user_id = $user_id"
  ).get({ $id: chat_session_id, $user_id: userId })
  if (!chatSession) return c.text('Invalid chat_session_id', 403)
  const previousMessages = (chatDb
    .query<CoreMessage, { $chat_session_id: string }>(
      "SELECT role, content FROM chat_messages WHERE chat_session_id = $chat_session_id ORDER BY created_at ASC"
    )
    .all({ $chat_session_id: chat_session_id }))
    .map((row: CoreMessage) => ({ role: row.role, content: row.content }))
  const parsedInput = chatInputSchema.safeParse({ messages })
  if (!parsedInput.success) return c.text('Invalid input', 400)
  const allMessages = [...previousMessages, ...parsedInput.data.messages]
  const result = streamText({
    model: customOpenAI('meta-llama/Meta-Llama-3.1-8B-Instruct'),
    messages: allMessages as any,
    abortSignal: c.req.raw.signal,
    onFinish: (finalMessage) => {
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
        "INSERT INTO chat_messages (id, user_id, chat_session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      ).run(
        crypto.randomUUID(),
        userId,
        chat_session_id,
        'assistant',
        assistantContent,
        new Date().toISOString()
      )
      chatDb.query("UPDATE chat_sessions SET last_active = ? WHERE id = ?").run(new Date().toISOString(), chat_session_id)
    }
  })
  const now = new Date().toISOString()
  for (const msg of parsedInput.data.messages) {
    chatDb.query(
      "INSERT INTO chat_messages (id, user_id, chat_session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      crypto.randomUUID(),
      userId,
      chat_session_id,
      msg.role,
      typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      now
    )
  }
  chatDb.query("UPDATE chat_sessions SET last_active = ? WHERE id = ?").run(now, chat_session_id)
  return result.toDataStreamResponse({ sendReasoning: true })
})

// --- Auth API ---
app.post('/auth/register', async c => {
  console.log('Registering user')
  const { username, email } = await c.req.json()
  if (!username || !email) return c.text('Missing username or email', 400)
  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()
  try {
    authDb.query("INSERT INTO users (id, username, email, created_at) VALUES (?, ?, ?, ?)").run(id, username, email, created_at)
  } catch (e) {
    return c.text('Username or email already exists', 409)
  }
  return c.json({ id, username, email, created_at }, 201)
})

app.post('/auth/session', async c => {
  const { username } = await c.req.json()
  if (!username) return c.text('Missing username', 400)
  const userRow = authDb
    .query<{ id: string }, { $username: string }>(
      "SELECT id FROM users WHERE username = $username"
    ).get({ $username: username })
  if (!userRow || !userRow.id) return c.text('User not found', 404)
  const userId = userRow.id
  const sessionId = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  authDb.query("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(sessionId, userId, created_at, expires_at)
  const cookie = `sessionId=${sessionId}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
  c.header('Set-Cookie', cookie)
  return c.json({ sessionId, userId, expires_at }, 201)
})

// --- Chat session API ---
app.post('/chat/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { name } = await c.req.json()
  const chatSessionId = crypto.randomUUID()
  const now = new Date().toISOString()
  chatDb.query("INSERT INTO chat_sessions (id, user_id, name, created_at, last_active) VALUES (?, ?, ?, ?, ?)")
    .run(chatSessionId, userId, name || null, now, now)
  return c.json({ chatSessionId, name, created_at: now }, 201)
})

app.get('/chat/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const sessions = chatDb.query<{ id: string, name: string | null, created_at: string, last_active: string }, { $user_id: string }>(
    "SELECT id, name, created_at, last_active FROM chat_sessions WHERE user_id = $user_id ORDER BY last_active DESC"
  ).all({ $user_id: userId })
  return c.json(sessions)
})

app.delete('/chat/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { chatSessionId } = await c.req.json()
  chatDb.query("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?").run(chatSessionId, userId)
  return c.body(null, 204)
})

serve({
  routes: { '/api/*': app.fetch, '/*': index },
  port: PORT
})

console.log(`Vizier API running on http://localhost:${PORT}`)
