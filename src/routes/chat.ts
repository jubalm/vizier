import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { CoreMessage, coreMessageSchema, streamText } from 'ai'
import { requireAuth } from '@/middleware'
import { chatService } from '@/services'
import { createOpenAI } from '@ai-sdk/openai'

const customOpenAI = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
})

const chatRoutes = new Hono<{ Variables: { userId: string } }>()

const chatInputSchema = z.object({
  chat_session_id: z.string().uuid(),
  messages: coreMessageSchema.array().min(1)
})

// Create chat session
chatRoutes.post('/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { name } = await c.req.json()
  const chatSessionId = crypto.randomUUID()
  const now = new Date().toISOString()
  chatService.createChatSession(chatSessionId, userId, name || null, now)
  return c.json({ chatSessionId, name, created_at: now }, 201)
})

// List chat sessions
chatRoutes.get('/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const sessions = chatService.getChatSessionsForUser(userId)
  return c.json(sessions)
})

// Delete chat session
chatRoutes.delete('/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { chatSessionId } = await c.req.json()
  chatService.deleteChatSession(chatSessionId, userId)
  return c.body(null, 204)
})

// Fetch chat message history
chatRoutes.get('/messages', requireAuth, async c => {
  const userId = c.get('userId') as string
  const chatSessionId = c.req.query('chat_session_id')
  if (!chatSessionId) return c.text('Missing chat_session_id', 400)
  const chatSession = chatService.getChatSessionById(chatSessionId, userId)
  if (!chatSession) return c.text('Invalid chat_session_id', 403)
  const messages = chatService.getChatMessages(chatSessionId)
  return c.json(messages)
})

// Chat (send message)
chatRoutes.post('/', requireAuth, zValidator('json', chatInputSchema), async c => {
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

export default chatRoutes
