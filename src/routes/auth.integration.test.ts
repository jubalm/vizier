// filepath: src/routes/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test'

const BASE_URL = 'http://localhost:4001'
let server: any

beforeAll(async () => {
  // Start the server on a test port (4001)
  // Assumes your main server file exports a function to start the server on a custom port
  // If not, you may need to run the dev server manually before running tests
  server = Bun.spawn(['bun', 'src/index.tsx'], {
    env: { ...process.env, PORT: '4001' },
    stdout: 'ignore',
    stderr: 'ignore',
  })
  // Wait for server to be ready
  await new Promise(res => setTimeout(res, 1000))
})

afterAll(() => {
  server.kill()
})

describe('Auth integration', () => {
  const username = `testuser_${Math.random().toString(36).slice(2, 8)}`
  const password = 'testpassword123'
  let sessionCookie: string | undefined

  it('should sign up a new user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('userId')
  })

  it('should log in and set a session cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    expect(res.status).toBe(200)
    const cookies = res.headers.get('set-cookie')
    expect(cookies).toBeTruthy()
    sessionCookie = cookies?.split(';')[0]
    const data = await res.json()
    expect(data).toHaveProperty('userId')
  })

  it('should access /api/auth/session with a valid session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { 'cookie': sessionCookie! }
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('username', username)
  })

  it('should logout and invalidate the session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'cookie': sessionCookie! }
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('success', true)
  })

  it('should not access /api/auth/session after logout', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { 'cookie': sessionCookie! }
    })
    expect(res.status).toBe(401)
  })
})
