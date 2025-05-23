import { test, expect, describe, beforeAll, afterAll } from "bun:test"
import { app } from "./server"

let server: any
let API: string

beforeAll(async () => {
  // Stop any running server on 3000 (if needed)
  try {
    const res = await fetch("http://localhost:3000/__healthcheck__")
    if (res.ok) {
      // Try to stop it if you have a way, or just warn
      console.warn("A server is already running on port 3000. Tests may fail if ports conflict.")
    }
  } catch {}
  server = Bun.serve({ fetch: app.fetch, port: 0 }) // 0 = random available port
  API = `http://localhost:${server.port}`
})

afterAll(() => {
  if (server) server.stop()
})

const randomUser = () => ({
  username: `testuser_${Math.floor(Math.random() * 100000)}`,
  email: `test_${Math.floor(Math.random() * 100000)}@example.com`,
  password: 'testpassword123',
})

describe("Auth API", () => {
  test("registers a new user", async () => {
    const user = randomUser()
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.username).toBe(user.username)
    expect(data.email).toBe(user.email)
  })

  test("creates a session for a user (sets cookie)", async () => {
    const user = randomUser()
    // Register first
    await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
    // Login
    const res = await fetch(`${API}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, password: user.password }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.sessionId).toBeDefined()
    expect(data.userId).toBeDefined()
    expect(data.expires_at).toBeDefined()
    const setCookie = res.headers.get("set-cookie")
    expect(setCookie).toBeTruthy()
  })
})

describe("Chat API", () => {
  let cookie: string
  let user: { username: string; email: string; password: string }

  test("setup user and session", async () => {
    user = randomUser()
    await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
    const res = await fetch(`${API}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, password: user.password }),
    })
    cookie = res.headers.get("set-cookie") || ""
    expect(cookie).toContain("sessionId=")
  })

  let chatId: string

  test("creates a chat", async () => {
    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie,
      },
      body: JSON.stringify({ topic: "Test Chat" }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.chatId).toBeDefined()
    chatId = data.chatId
  })

  test("lists chats", async () => {
    const res = await fetch(`${API}/api/chat`, {
      method: "GET",
      headers: { "Cookie": cookie },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.some((c: any) => c.id === chatId)).toBe(true)
  })

  test("sends a message to chat", async () => {
    const res = await fetch(`${API}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie,
      },
      body: JSON.stringify({
        chatId,
        messages: [
          { role: "user", content: "Hello, Vizier!" },
        ],
      }),
    })
    // Accept 200 or 206 (streaming)
    expect([200, 206]).toContain(res.status)
  })

  test("deletes a chat", async () => {
    const res = await fetch(`${API}/api/chat`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie,
      },
      body: JSON.stringify({ chatId }),
    })
    expect(res.status).toBe(204)
    // Confirm it's gone
    const listRes = await fetch(`${API}/api/chat`, {
      method: "GET",
      headers: { "Cookie": cookie },
    })
    const chats = await listRes.json()
    expect(chats.some((c: any) => c.id === chatId)).toBe(false)
  })
})
