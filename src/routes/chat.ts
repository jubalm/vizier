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

// Add a zod schema for the assistant response
const assistantResponseSchema = z.object({
  message: z.object({ content: z.string() }).optional(),
  text: z.string().optional(),
  content: z.string().optional(),
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
  // Get chat message history and append new messages
  const chatMessageHistory = chatService.getChatMessages(chatId).map((m: { role: string, content: string }) => ({ role: m.role as any, content: m.content }))
  const allMessages = [...chatMessageHistory, ...messages] as CoreMessage[]
  const result = streamText({
    model: customOpenAI('meta-llama/Meta-Llama-3.1-8B-Instruct'),
    messages: allMessages,
    abortSignal: c.req.raw.signal,
    onFinish: (finalMessage) => {
      let assistantContent = ""
      const parsed = assistantResponseSchema.safeParse(finalMessage)
      if (parsed.success) {
        if (parsed.data.message && parsed.data.message.content) {
          assistantContent = parsed.data.message.content
        } else if (parsed.data.text) {
          assistantContent = parsed.data.text
        } else if (parsed.data.content) {
          assistantContent = parsed.data.content
        } else {
          assistantContent = JSON.stringify(parsed.data)
        }
      } else {
        assistantContent = typeof finalMessage === 'string' ? finalMessage : JSON.stringify(finalMessage)
      }
      // Store assistant response as a chat message
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
  // Store user messages in chat
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
