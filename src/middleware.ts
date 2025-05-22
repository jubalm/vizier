import { createMiddleware } from 'hono/factory'
import { userService } from './services'
import { getCookie, setCookie } from 'hono/cookie'

export type UserContext = { userId: string }

export const requireAuth = createMiddleware<{ Variables: UserContext }>(async (c, next) => {
  // Use Hono's getCookie utility
  const token = getCookie(c, 'sessionId') || ''
  if (!token) return c.text('Missing session', 401)
  const sessionRow = userService.getSessionByToken(token)
  if (!sessionRow) return c.text('Invalid session', 401)
  const now = new Date()
  const expiresAt = new Date(sessionRow.expires_at)
  if (expiresAt < now) return c.text('Session expired', 401)

  // Extend session if less than 12h left
  const THRESHOLD_MS = 1000 * 60 * 60 * 12 // 12 hours
  if (expiresAt.getTime() - now.getTime() < THRESHOLD_MS) {
    const newExpiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24) // 24h from now
    userService.updateSessionExpiryByToken(token, newExpiresAt.toISOString())
    setCookie(c, 'sessionId', token, {
      path: '/',
      maxAge: 86400,
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  c.set('userId', sessionRow.user_id)
  await next()
})
