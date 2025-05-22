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
  chatId: z.string().uuid(),
  messages: coreMessageSchema.array().min(1)
})

// Create chat
chatRoutes.post('/', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { name } = await c.req.json()
  const chatId = crypto.randomUUID()
  const now = new Date().toISOString()
  chatService.createChat(chatId, userId, name || null, now)
  return c.json({ chatId, name, created_at: now }, 201)
})

// List chats
chatRoutes.get('/', requireAuth, async c => {
  const userId = c.get('userId') as string
  const chats = chatService.getChatsForUser(userId)
  return c.json(chats)
})

// Delete chat
chatRoutes.delete('/', requireAuth, async c => {
  const userId = c.get('userId') as string
  const { chatId } = await c.req.json()
  chatService.deleteChat(chatId, userId)
  return c.body(null, 204)
})

// Fetch chat message history
chatRoutes.get('/messages', requireAuth, async c => {
  const userId = c.get('userId') as string
  const chatId = c.req.query('chatId')
  if (!chatId) return c.text('Missing chatId', 400)
  const chat = chatService.getChatById(chatId, userId)
  if (!chat) return c.text('Invalid chatId', 403)
  const messages = chatService.getChatMessages(chatId)
  return c.json(messages)
})

// Chat (send message)
chatRoutes.post('/message', requireAuth, zValidator('json', chatInputSchema), async c => {
  const userId = c.get('userId') as string
  const { chatId, messages } = c.req.valid('json')
  if (!chatId) return c.text('Missing chatId', 400)
  const chat = chatService.getChatById(chatId, userId)
  if (!chat) return c.text('Invalid chatId', 403)
  const chatMessageHistory = chatService.getChatMessages(chatId).map((m: { role: string, content: string }) => ({ role: m.role as any, content: m.content }))
  const allMessages = [...chatMessageHistory, ...messages] as CoreMessage[]
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
        chatId,
        'assistant',
        assistantContent,
        new Date().toISOString()
      )
      chatService.updateChatLastActive(chatId, new Date().toISOString())
    }
  })
  const now = new Date().toISOString()
  for (const msg of messages) {
    chatService.insertChatMessage(
      crypto.randomUUID(),
      userId,
      chatId,
      msg.role,
      typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      now
    )
  }
  chatService.updateChatLastActive(chatId, now)
  return result.toDataStreamResponse({ sendReasoning: true })
})

export default chatRoutes
