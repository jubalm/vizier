import db from "./db"
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { Buffer } from "buffer"
import { customAlphabet } from 'nanoid'

const EXPIRES_IN_MS = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
const SESSION_RENEWAL_THRESHOLD_MS = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const nanoid = customAlphabet(ALPHABET, 12)
const sessionNanoid = customAlphabet(ALPHABET, 32)

function generateUserId() {
  return nanoid()
}

export async function createUserWithEmail(email: string, password_plaintext: string): Promise<string> {
  const hashedPassword = await Bun.password.hash(password_plaintext)
  const userId = generateUserId()
  try {
    db.run("INSERT INTO user (id, email, hashed_password) VALUES (?, ?, ?)", [
      userId,
      email,
      hashedPassword
    ])
    return userId
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed: user.email")) {
      throw new Error("Email already registered")
    }
    console.error("Error creating user:", e)
    throw new Error("Failed to create user")
  }
}

export async function verifyPassword(hashedPassword: string, password_plaintext: string): Promise<boolean> {
  return await Bun.password.verify(password_plaintext, hashedPassword)
}

export function generateClientSessionToken(): string {
  return sessionNanoid()
}

function hashSessionToken(sessionToken: string): string {
  const hash = sha256(new TextEncoder().encode(sessionToken))
  return Buffer.from(hash).toString('hex')
}

export function createSession(userId: string, clientToken: string): { clientSessionToken: string; expiresAt: Date } {
  const sessionIdHashed = hashSessionToken(clientToken)
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MS)
  db.run("INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)", [
    sessionIdHashed,
    userId,
    expiresAt.getTime()
  ])
  console.log(`[AuthLib] Session created: ${sessionIdHashed} for user ${userId}`)
  return { clientSessionToken: clientToken, expiresAt }
}

export function getSessionAndRenew(clientToken: string):
  | { userId: string; expiresAt: Date; clientSessionToken: string; renewed?: boolean; newToken?: string; user: { id: string; email: string } }
  | null {
  const sessionIdHashed = hashSessionToken(clientToken)
  const result = db.query("SELECT user_id, expires_at FROM session WHERE id = ?").get(sessionIdHashed) as { user_id: string; expires_at: number } | null
  if (!result) {
    console.log(`[AuthLib] Session not found for hashed token: ${sessionIdHashed}`)
    return null
  }
  let currentExpiresAt = new Date(result.expires_at)
  if (currentExpiresAt.getTime() < Date.now()) {
    console.log(`[AuthLib] Session expired: ${sessionIdHashed}`)
    db.run("DELETE FROM session WHERE id = ?", [sessionIdHashed])
    return null
  }
  if (currentExpiresAt.getTime() < Date.now() + SESSION_RENEWAL_THRESHOLD_MS) {
    const newExpiresAt = new Date(Date.now() + EXPIRES_IN_MS)
    db.run("UPDATE session SET expires_at = ? WHERE id = ?", [
      newExpiresAt.getTime(),
      sessionIdHashed
    ])
    console.log(`[AuthLib] Session renewed: ${sessionIdHashed}. New expiry: ${newExpiresAt.toISOString()}`)
    const user = getUserById(result.user_id)
    return { userId: result.user_id, expiresAt: newExpiresAt, clientSessionToken: clientToken, renewed: true, user }
  }
  const user = getUserById(result.user_id)
  return { userId: result.user_id, expiresAt: currentExpiresAt, clientSessionToken: clientToken, user }
}

export function deleteSession(clientToken: string): void {
  const sessionIdHashed = hashSessionToken(clientToken)
  db.run("DELETE FROM session WHERE id = ?", [sessionIdHashed])
  console.log(`[AuthLib] Session deleted: ${sessionIdHashed}`)
}

export function getUserByEmail(email: string): { id: string; email: string; hashed_password: string } | null {
  const user = db.query("SELECT id, email, hashed_password FROM user WHERE email = ?").get(email) as { id: string; email: string; hashed_password: string } | null
  return user
}

export function getUserById(userId: string): { id: string; email: string } | null {
  const user = db.query("SELECT id, email FROM user WHERE id = ?").get(userId) as { id: string; email: string } | null
  return user
}
