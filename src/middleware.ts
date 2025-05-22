import { createMiddleware } from 'hono/factory'
import { userService } from './services'

export type UserContext = { userId: string }

export const requireAuth = createMiddleware<{ Variables: UserContext }>(async (c, next) => {
  const cookie = c.req.header('cookie') || ''
  const sessionId = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('sessionId='))?.split('=')[1] || ''
  if (!sessionId) return c.text('Missing session', 401)
  const sessionRow = userService.getSessionById(sessionId)
  if (!sessionRow) return c.text('Invalid session', 401)
  if (new Date(sessionRow.expires_at) < new Date()) return c.text('Session expired', 401)
  c.set('userId', sessionRow.user_id)
  await next()
})
