import { Hono } from 'hono'
import { userService } from '../services'
import { requireAuth } from '../middleware'
import { setCookie } from 'hono/cookie'
import { generateSessionToken } from '../lib/sessionUtil'

const authRoutes = new Hono()

// Register
authRoutes.post('/register', async c => {
  const { username, email, password } = await c.req.json()
  if (!username || !email || !password) return c.text('Missing username, email, or password', 400)
  try {
    const user = await userService.createUserWithPassword(username, password, email)
    if (!user) return c.text('Username already exists or DB error', 409)
    return c.json({ id: user.id, username, email, created_at: user.created_at }, 201)
  } catch (e: any) {
    return c.text('Registration error: ' + (e?.message || String(e)), 500)
  }
})

// Login (create session)
authRoutes.post('/session', async c => {
  const { username, password } = await c.req.json()
  if (!username || !password) return c.text('Missing username or password', 400)
  const valid = await userService.verifyUserPassword(username, password)
  if (!valid) return c.text('Invalid username or password', 401)
  const userRow = userService.getUserByUsername(username)
  if (!userRow || !userRow.id) return c.text('User not found', 404)
  const userId = userRow.id
  const token = generateSessionToken()
  const created_at = new Date().toISOString()
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  userService.createSession(token, userId, created_at, expires_at)
  setCookie(c, 'sessionId', token, {
    path: '/',
    maxAge: 86400,
    httpOnly: true,
    sameSite: 'lax',
  })
  return c.json({ sessionId: token, userId, expires_at }, 201)
})

// Get session
authRoutes.get('/session', requireAuth, async c => {
  const userId = c.get('userId') as string
  return c.json({ userId }, 200)
})

export default authRoutes
