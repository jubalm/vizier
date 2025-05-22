import { Hono } from 'hono'
import { userService } from '../services'
import { requireAuth } from '../middleware'
import { getCookie, setCookie } from 'hono/cookie'

const authRoutes = new Hono()

// Register
authRoutes.post('/register', async c => {
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

// Login (create session)
authRoutes.post('/session', async c => {
  const { username } = await c.req.json()
  if (!username) return c.text('Missing username', 400)
  const userRow = userService.getUserByUsername(username)
  if (!userRow || !userRow.id) return c.text('User not found', 404)
  const userId = userRow.id
  const sessionId = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  userService.createSession(sessionId, userId, created_at, expires_at)
  setCookie(c, 'sessionId', sessionId, {
    path: '/',
    maxAge: 86400,
    httpOnly: true,
    sameSite: 'lax',
  })
  return c.json({ sessionId, userId, expires_at }, 201)
})

// Get session
authRoutes.get('/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  return c.json({ userId }, 200)
})

export default authRoutes
