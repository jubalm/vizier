import { test, expect, describe } from "bun:test"

const API = "http://localhost:3000"

const randomUser = () => ({
  username: `testuser_${Math.floor(Math.random() * 100000)}`,
  email: `test_${Math.floor(Math.random() * 100000)}@example.com`,
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

  test("creates a session for a user", async () => {
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
      body: JSON.stringify({ username: user.username }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.sessionId).toBeDefined()
    expect(data.userId).toBeDefined()
    expect(data.expires_at).toBeDefined()
  })
})

describe("Chat Session API", () => {
  let sessionId: string
  let user: { username: string; email: string }

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
      body: JSON.stringify({ username: user.username }),
    })
    const data = await res.json()
    sessionId = data.sessionId
    expect(sessionId).toBeDefined()
  })

  let chatSessionId: string

  test("creates a chat session", async () => {
    const res = await fetch(`${API}/api/chat/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ name: "Test Conversation" }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.chatSessionId).toBeDefined()
    chatSessionId = data.chatSessionId
  })

  test("lists chat sessions", async () => {
    const res = await fetch(`${API}/api/chat/session`, {
      method: "GET",
      headers: { "x-session-id": sessionId },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.some((s: any) => s.id === chatSessionId)).toBe(true)
  })

  test("sends a message to chat", async () => {
    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({
        chat_session_id: chatSessionId,
        messages: [
          { role: "user", content: "Hello, Vizier!" },
        ],
      }),
    })
    // Accept 200 or 206 (streaming)
    expect([200, 206]).toContain(res.status)
    // Optionally check for stream or partial response
  })

  test("deletes a chat session", async () => {
    const res = await fetch(`${API}/api/chat/session`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify({ chatSessionId }),
    })
    expect(res.status).toBe(204)
    // Confirm it's gone
    const listRes = await fetch(`${API}/api/chat/session`, {
      method: "GET",
      headers: { "x-session-id": sessionId },
    })
    const sessions = await listRes.json()
    expect(sessions.some((s: any) => s.id === chatSessionId)).toBe(false)
  })
})
