import { Hono } from 'hono'
import { userService } from '../services'

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
  const cookie = `sessionId=${sessionId}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
  c.header('Set-Cookie', cookie)
  return c.json({ sessionId, userId, expires_at }, 201)
})

// Get session
authRoutes.get('/session', async c => {
  const cookie = c.req.header('cookie') || ''
  const sessionId = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith('sessionId='))?.split('=')[1] || ''
  if (!sessionId) return c.text('Missing session', 401)
  const sessionRow = userService.getSessionById(sessionId)
  if (!sessionRow) return c.text('Invalid session', 401)
  if (new Date(sessionRow.expires_at) < new Date()) return c.text('Session expired', 401)
  return c.json({ userId: sessionRow.user_id, expires_at: sessionRow.expires_at }, 200)
})

export default authRoutes
