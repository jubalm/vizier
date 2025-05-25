import { createMiddleware } from 'hono/factory'
import { getSessionAndRenew } from '../lib/auth'
import { getCookie, setCookie } from 'hono/cookie'

export const sessionAuth = createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, 'session')
  if (!sessionToken) {
    return c.json({ error: 'Unauthorized', message: 'No session cookie' }, 401)
  }
  const session = await getSessionAndRenew(sessionToken)
  if (!session) {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired session' }, 401)
  }
  if (session.renewed && session.newToken) {
    setCookie(c, 'session', session.newToken, {
      httpOnly: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })
  }
  c.set('user', session.user)
  await next()
})
