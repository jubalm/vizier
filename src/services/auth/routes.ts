import { Hono } from "hono"
import { z } from "zod"
import { setCookie, getCookie, deleteCookie } from "hono/cookie"
import {
  createUserWithEmail,
  verifyPassword,
  createSession,
  getSessionAndRenew,
  deleteSession,
  getUserByEmail,
  getUserById,
  generateClientSessionToken,
} from "./logic"
import { getErrorMessage } from "../../utils/errors"

const authRoutes = new Hono()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

authRoutes.post("/signup", async (c) => {
  try {
    const body = await c.req.json()
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      return c.json({ error: "Invalid input", details: validationResult.error.flatten() }, 400)
    }
    const { email, password } = validationResult.data
    const userId = await createUserWithEmail(email, password)
    return c.json({ userId }, 201)
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 400)
  }
})

authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json()
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return c.json({ error: "Invalid input", details: validationResult.error.flatten() }, 400)
    }
    const { email, password } = validationResult.data
    const user = getUserByEmail(email)
    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }
    const valid = await verifyPassword(user.hashed_password, password)
    if (!valid) {
      return c.json({ error: "Invalid password" }, 401)
    }
    const clientToken = generateClientSessionToken()
    const session = createSession(user.id, clientToken)
    setCookie(c, "session", clientToken, {
      httpOnly: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })
    return c.json({ userId: user.id, expiresAt: session.expiresAt }, 200)
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 400)
  }
})

authRoutes.get("/logout", async (c) => {
  try {
    const sessionToken = getCookie(c, "session")
    if (sessionToken) {
      deleteSession(sessionToken)
      deleteCookie(c, "session")
    }
    return c.json({ message: "Logged out" }, 200)
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 400)
  }
})

authRoutes.get("/session", async (c) => {
  try {
    const sessionToken = getCookie(c, "session")
    if (!sessionToken) throw new Error("No session found")
    const session = getSessionAndRenew(sessionToken)
    if (!session) return c.json({ error: "No session found" }, 400)
    return c.json(session, 200)
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 400)
  }
})

authRoutes.get("/user", async (c) => {
  try {
    const sessionToken = getCookie(c, "session")
    if (!sessionToken) throw new Error("No session found")
    const session = getSessionAndRenew(sessionToken)
    if (!session) throw new Error("Invalid session")
    const user = getUserById(session.userId)
    return c.json(user, 200)
  } catch (error) {
    return c.json({ error: getErrorMessage(error) }, 400)
  }
})

export default authRoutes
