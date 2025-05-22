import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { serve } from 'bun'
import { createOpenAI } from "@ai-sdk/openai"
import { CoreMessage, coreMessageSchema, streamText } from 'ai'
import { z } from 'zod'
import index from "./index.html"
import { zValidator } from '@hono/zod-validator'
import { userService, chatService } from './services'

// --- OpenAI API ---
const customOpenAI = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
})

// --- Auth middleware ---
const requireAuth = async (c: Context<{ Variables: UserContext }>, next: Next) => {
  const cookie = c.req.header('cookie') || ''
  const sessionId = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('sessionId='))?.split('=')[1] || ''
  if (!sessionId) return c.text('Missing session', 401)
  const sessionRow = userService.getSessionById(sessionId)
  if (!sessionRow) return c.text('Invalid session', 401)
  if (new Date(sessionRow.expires_at) < new Date()) return c.text('Session expired', 401)
  c.set('userId', sessionRow.user_id)
  return next()
}

// --- Chat API ---
const chatInputSchema = z.object({
  chat_session_id: z.string().uuid(),
  messages: coreMessageSchema.array().min(1)
})

// Restore UserContext type and PORT constant
const PORT = process.env.PORT || 3000

type UserContext = { userId: string }

const app = new Hono<{ Variables: UserContext }>().basePath('/api')

// --- Auth API ---
app.post('/auth/register', async c => {
  console.log('Registering user')
  const { username, email } = await c.req.json()
  if (!username || !email) return c.text('Missing username or email', 400)
  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()
  try {
    userService.createUser(id, username, email, created_at)
  } catch (e) {
    return c.text('Username or email already exists', 409)
  }
  return c.json({ id, username, email, created_at }, 201)
})

app.post('/auth/session', async c => {
  const { username } = await c.req.json()
  if (!username) return c.text('Missing username', 400)
  const userRow = userService.getUserByUsername(username)
  if (!userRow || !userRow.id) return c.text('User not found', 404)
  const userId = userRow.id
  const sessionId = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  userService.createSession(sessionId, userId, created_at, expires_at)
  const cookie = `sessionId=${sessionId}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
  c.header('Set-Cookie', cookie)
  return c.json({ sessionId, userId, expires_at }, 201)
})

app.get('/auth/session', async c => {
  // Check if session cookie is present and valid
  const cookie = c.req.header('cookie') || ''
  const sessionId = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith('sessionId='))?.split('=')[1] || ''
  if (!sessionId) return c.text('Missing session', 401)
  const sessionRow = userService.getSessionById(sessionId)
  if (!sessionRow) return c.text('Invalid session', 401)
  if (new Date(sessionRow.expires_at) < new Date()) return c.text('Session expired', 401)
  return c.json({ userId: sessionRow.user_id, expires_at: sessionRow.expires_at }, 200)
})

// --- Chat session API ---
app.post('/chat/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { name } = await c.req.json()
  const chatSessionId = crypto.randomUUID()
  const now = new Date().toISOString()
  chatService.createChatSession(chatSessionId, userId, name || null, now)
  return c.json({ chatSessionId, name, created_at: now }, 201)
})

app.get('/chat/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const sessions = chatService.getChatSessionsForUser(userId)
  return c.json(sessions)
})

app.delete('/chat/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { chatSessionId } = await c.req.json()
  chatService.deleteChatSession(chatSessionId, userId)
  return c.body(null, 204)
})

app.post('/chat', requireAuth, zValidator('json', chatInputSchema), async c => {
  const userId = c.get('userId') as string
  const { chat_session_id, messages } = c.req.valid('json')
  if (!chat_session_id) return c.text('Missing chat_session_id', 400)

  const chatSession = chatService.getChatSessionById(chat_session_id, userId)
  if (!chatSession) return c.text('Invalid chat_session_id', 403)

  const chatSessionMessageHistory = chatService.getChatMessages(chat_session_id).map((m: { role: string, content: string }) => ({ role: m.role as any, content: m.content }))

  const allMessages = [...chatSessionMessageHistory, ...messages] as CoreMessage[]
  const result = streamText({
    model: customOpenAI('meta-llama/Meta-Llama-3.1-8B-Instruct'),
    messages: allMessages,
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
      chatService.insertChatMessage(
        crypto.randomUUID(),
        userId,
        chat_session_id,
        'assistant',
        assistantContent,
        new Date().toISOString()
      )
      chatService.updateChatSessionLastActive(chat_session_id, new Date().toISOString())
    }
  })
  const now = new Date().toISOString()
  for (const msg of messages) {
    chatService.insertChatMessage(
      crypto.randomUUID(),
      userId,
      chat_session_id,
      msg.role,
      typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      now
    )
  }
  chatService.updateChatSessionLastActive(chat_session_id, now)
  return result.toDataStreamResponse({ sendReasoning: true })
})

serve({
  routes: { '/api/*': app.fetch, '/*': index },
  port: PORT
})

console.log(`Vizier API running on http://localhost:${PORT}`)
