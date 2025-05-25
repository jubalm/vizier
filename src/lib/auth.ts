import db from "./db"
// import { TimeSpan, createDate } from "oslo"; // Removed - these are not from the installed oslo packages
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { Buffer } from "buffer" // Bun provides Buffer
import { randomBytes } from "crypto" // Using Node.js/Bun crypto for user ID

const EXPIRES_IN_MS = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
const SESSION_RENEWAL_THRESHOLD_MS = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Generates a URL-safe, random string for user IDs.
 */
function generateRandomId(length: number = 15): string {
  return randomBytes(Math.ceil(length * 3 / 4))
    .toString('base64url') // URL-safe base64
    .slice(0, length)
}

export async function createUser(username: string, password_plaintext: string): Promise<string> {
  const hashedPassword = await Bun.password.hash(password_plaintext)
  const userId = generateRandomId(15)

  try {
    db.run("INSERT INTO user (id, username, hashed_password) VALUES (?, ?, ?)", [
      userId,
      username,
      hashedPassword
    ])
    return userId
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed: user.username")) {
      throw new Error("Username already taken")
    }
    console.error("Error creating user:", e)
    throw new Error("Failed to create user")
  }
}

export async function verifyPassword(hashedPassword: string, password_plaintext: string): Promise<boolean> {
  return await Bun.password.verify(password_plaintext, hashedPassword)
}

/**
 * Generates a cryptographically secure session token for the client.
 * Recommended length is 32 bytes for good entropy.
 */
export function generateClientSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

/**
 * Hashes a client session token to create a session ID for database storage.
 * @param sessionToken The client-side session token.
 * @returns The SHA-256 hashed session ID (hex encoded).
 */
function hashSessionToken(sessionToken: string): string {
  const hash = sha256(new TextEncoder().encode(sessionToken))
  return Buffer.from(hash).toString('hex')
}

/**
 * Creates a new session in the database.
 * @param userId The ID of the user for whom the session is created.
 * @param clientToken The client-facing session token.
 * @returns An object containing the client-facing session token and its expiration date.
 */
export function createSession(userId: string, clientToken: string): { clientSessionToken: string; expiresAt: Date } {
  const sessionIdHashed = hashSessionToken(clientToken)
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MS)

  db.run("INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)", [
    sessionIdHashed,
    userId,
    expiresAt.getTime() // Store as milliseconds
  ])
  console.log(`[AuthLib] Session created: ${sessionIdHashed} for user ${userId}`)
  return { clientSessionToken: clientToken, expiresAt }
}

/**
 * Retrieves and potentially renews a session based on the client session token.
 * @param clientToken The client-facing session token.
 * @returns The session data (userId, expiresAt) if valid and found, otherwise null.
 */
export function getSessionAndRenew(clientToken: string): { userId: string; expiresAt: Date; clientSessionToken: string } | null {
  const sessionIdHashed = hashSessionToken(clientToken)
  const result = db.query("SELECT user_id, expires_at FROM session WHERE id = ?").get(sessionIdHashed) as { user_id: string; expires_at: number } | null

  if (!result) {
    console.log(`[AuthLib] Session not found for hashed token: ${sessionIdHashed}`)
    return null
  }

  let currentExpiresAt = new Date(result.expires_at)

  // Check if session is expired
  if (currentExpiresAt.getTime() < Date.now()) {
    console.log(`[AuthLib] Session expired: ${sessionIdHashed}`)
    db.run("DELETE FROM session WHERE id = ?", [sessionIdHashed]) // Clean up expired session
    return null
  }

  // Check if session needs renewal
  const renewalTimeLimit = Date.now() - (EXPIRES_IN_MS - SESSION_RENEWAL_THRESHOLD_MS) // if current time is past this, it means less than threshold is left.
  // More directly: if (currentExpiresAt.getTime() < Date.now() + SESSION_RENEWAL_THRESHOLD_MS)
  if (currentExpiresAt.getTime() < Date.now() + SESSION_RENEWAL_THRESHOLD_MS) { // Simpler check: if expiry is within the renewal threshold from now
    const newExpiresAt = new Date(Date.now() + EXPIRES_IN_MS) // Renew for the full duration from now
    db.run("UPDATE session SET expires_at = ? WHERE id = ?", [
      newExpiresAt.getTime(),
      sessionIdHashed
    ])
    console.log(`[AuthLib] Session renewed: ${sessionIdHashed}. New expiry: ${newExpiresAt.toISOString()}`)
    return { userId: result.user_id, expiresAt: newExpiresAt, clientSessionToken: clientToken }
  }
  // console.log(`[AuthLib] Session validated (no renewal needed): ${sessionIdHashed}`);
  return { userId: result.user_id, expiresAt: currentExpiresAt, clientSessionToken: clientToken }
}

/**
 * Deletes a session from the database using the client session token.
 * @param clientToken The client-facing session token.
 */
export function deleteSession(clientToken: string): void {
  const sessionIdHashed = hashSessionToken(clientToken)
  db.run("DELETE FROM session WHERE id = ?", [sessionIdHashed])
  console.log(`[AuthLib] Session deleted: ${sessionIdHashed}`)
}

export function getUserByUsername(username: string): { id: string; hashed_password: string } | null {
  const user = db.query("SELECT id, hashed_password FROM user WHERE username = ?").get(username) as { id: string; hashed_password: string } | null
  return user
}

export function getUserById(userId: string): { id: string; username: string } | null {
  const user = db.query("SELECT id, username FROM user WHERE id = ?").get(userId) as { id: string; username: string } | null
  return user
}
