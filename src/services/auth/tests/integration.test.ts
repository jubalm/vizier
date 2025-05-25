import { describe, it, expect, beforeAll, afterAll } from 'bun:test'

const BASE_URL = 'http://localhost:4001'
let server: any

beforeAll(async () => {
  server = Bun.spawn(['bun', 'src/index.tsx'], {
    env: { ...process.env, PORT: '4001' },
    stdout: 'ignore',
    stderr: 'ignore',
  })
  await new Promise(res => setTimeout(res, 1000))
})

afterAll(() => {
  server.kill()
})

describe('Auth integration', () => {
  const email = `testuser_${Math.random().toString(36).slice(2, 8)}@test.com`
  const password = 'testpassword123'
  let sessionCookie: string | undefined

  it('should sign up a new user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('userId')
  })

  it('should log in and set a session cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
    expect(data).toHaveProperty('userId')
  })

  it('should logout and invalidate the session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'GET',
      headers: { 'cookie': sessionCookie! }
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('message', 'Logged out')
  })

  it('should not access /api/auth/session after logout', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { 'cookie': sessionCookie! }
    })
    expect(res.status).toBe(400)
  })
})
