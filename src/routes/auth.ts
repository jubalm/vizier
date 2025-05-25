import { Hono } from "hono"
import { z } from "zod"
import { setCookie, getCookie, deleteCookie } from "hono/cookie"
import {
  createUser,
  verifyPassword,
  createSession,
  getSessionAndRenew, // Changed from getDbSession
  deleteSession,      // Changed from deleteDbSession
  getUserByUsername,
  getUserById,
  generateClientSessionToken, // Added import
} from "../lib/auth"
import { getErrorMessage } from "../lib/errors"

const authApp = new Hono()

// Zod schemas for validation
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

// Signup route
authApp.post("/signup", async (c) => {
  try {
    const body = await c.req.json()
    const validationResult = signupSchema.safeParse(body)

    if (!validationResult.success) {
      return c.json({ error: "Invalid input", details: validationResult.error.flatten() }, 400)
    }

    const { username, password } = validationResult.data

    const existingUser = getUserByUsername(username)
    if (existingUser) {
      return c.json({ error: "Username already taken" }, 409)
    }

    const userId = await createUser(username, password)
    const clientToken = generateClientSessionToken()
    const { clientSessionToken, expiresAt } = createSession(userId, clientToken)

    setCookie(c, "session_id", clientSessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "Lax",
      expires: expiresAt,
      // domain: 'localhost', // Required for localhost unless path is also specific
    })

    const user = getUserById(userId)
    return c.json({ id: user?.id, username: user?.username })
  } catch (error) {
    console.error("[Auth Signup Error]", error)
    return c.json({ error: getErrorMessage(error) }, 500)
  }
})

// Login route
authApp.post("/login", async (c) => {
  try {
    const body = await c.req.json()
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      return c.json({ error: "Invalid input", details: validationResult.error.flatten() }, 400)
    }

    const { username, password } = validationResult.data
    const user = getUserByUsername(username)

    if (!user) {
      return c.json({ error: "Invalid username or password" }, 401)
    }

    const isValidPassword = await verifyPassword(user.hashed_password, password)
    if (!isValidPassword) {
      return c.json({ error: "Invalid username or password" }, 401)
    }

    const clientToken = generateClientSessionToken()
    const { clientSessionToken, expiresAt } = createSession(user.id, clientToken)
    setCookie(c, "session_id", clientSessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "Lax",
      expires: expiresAt,
      // domain: 'localhost', // Required for localhost unless path is also specific
    })

    return c.json({ id: user.id, username: username })
  } catch (error) {
    console.error("[Auth Login Error]", error)
    return c.json({ error: getErrorMessage(error) }, 500)
  }
})

// Logout route
authApp.post("/logout", async (c) => {
  try {
    const clientSessionToken = getCookie(c, "session_id")
    if (clientSessionToken) {
      deleteSession(clientSessionToken)
      deleteCookie(c, "session_id", { path: "/", /* domain: 'localhost' */ })
    }
    return c.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("[Auth Logout Error]", error)
    return c.json({ error: getErrorMessage(error) }, 500)
  }
})

// Session check route
authApp.get("/session", async (c) => {
  try {
    const clientSessionTokenFromCookie = getCookie(c, "session_id")
    if (!clientSessionTokenFromCookie) {
      return c.json({ user: null }, 200)
    }

    const session = getSessionAndRenew(clientSessionTokenFromCookie)
    if (!session) {
      deleteCookie(c, "session_id", { path: "/", /* domain: 'localhost' */ })
      return c.json({ user: null }, 200)
    }

    // Session is valid and potentially renewed, session object contains { userId, expiresAt, clientSessionToken }
    const user = getUserById(session.userId)
    if (!user) {
      // This case should ideally not happen if session.userId is valid
      deleteCookie(c, "session_id", { path: "/", /* domain: 'localhost' */ })
      return c.json({ user: null, error: "User not found for valid session" }, 200)
    }

    // Set/Refresh the cookie with the token from getSessionAndRenew (might be the same or a new one if renewal involved re-tokening, though current lib doesn't re-token)
    // and the potentially updated expiresAt.
    setCookie(c, "session_id", session.clientSessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      expires: session.expiresAt, // Use the expiresAt from the (potentially renewed) session
      // domain: 'localhost',
    })

    return c.json({ user: { id: user.id, username: user.username } })
  } catch (error) {
    console.error("[Auth Session Error]", error)
    deleteCookie(c, "session_id", { path: "/", /* domain: 'localhost' */ })
    return c.json({ error: getErrorMessage(error), user: null }, 500)
  }
})

export default authApp
