import { hashPassword, verifyPassword } from '../lib/passwordHash'
import { IUserService } from './IUserService'
import { authDb } from '../db'
import { generateSessionToken, hashSessionToken } from '../lib/sessionUtil'

export class SqliteUserService implements IUserService {
  getUserByUsername(username: string) {
    return authDb.query<{ id: string }, { $username: string }>(
      'SELECT id FROM users WHERE username = $username'
    ).get({ $username: username })
  }

  createUser(id: string, username: string, email: string, created_at: string) {
    authDb.query(
      'INSERT INTO users (id, username, email, created_at) VALUES (?, ?, ?, ?)'
    ).run(id, username, email, created_at)
  }

  async createUserWithPassword(username: string, password: string, email: string) {
    const password_hash = hashPassword(password)
    // Insert user and get id (UUID generated here)
    const id = crypto.randomUUID()
    const created_at = new Date().toISOString()
    try {
      authDb.query(
        'INSERT INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      ).run(id, username, email, password_hash, created_at)
      return { id, username, email, password_hash, created_at }
    } catch (e) {
      console.error('createUserWithPassword error:', e)
      return null
    }
  }

  async verifyUserPassword(username: string, password: string): Promise<boolean> {
    const row = authDb.query<{ password_hash: string }, { $username: string }>(
      'SELECT password_hash FROM users WHERE username = $username'
    ).get({ $username: username })
    if (!row?.password_hash) return false
    return verifyPassword(row.password_hash, password)
  }

  createSession(token: string, userId: string, created_at: string, expires_at: string) {
    const sessionId = hashSessionToken(token)
    authDb.query(
      'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
    ).run(sessionId, userId, created_at, expires_at)
  }

  getSessionByToken(token: string) {
    const sessionId = hashSessionToken(token)
    return authDb.query<{ user_id: string; expires_at: string }, { $sessionId: string }>(
      'SELECT user_id, expires_at FROM sessions WHERE id = $sessionId'
    ).get({ $sessionId: sessionId })
  }

  updateSessionExpiryByToken(token: string, newExpiresAt: string) {
    const sessionId = hashSessionToken(token)
    authDb.query(
      'UPDATE sessions SET expires_at = ? WHERE id = ?'
    ).run(newExpiresAt, sessionId)
  }

  // Legacy compatibility for interface
  getSessionById(sessionId: string) {
    // Accepts a hashed sessionId (for compatibility)
    return authDb.query<{ user_id: string; expires_at: string }, { $sessionId: string }>(
      'SELECT user_id, expires_at FROM sessions WHERE id = $sessionId'
    ).get({ $sessionId: sessionId })
  }

  updateSessionExpiry(sessionId: string, newExpiresAt: string) {
    // Accepts a hashed sessionId (for compatibility)
    authDb.query(
      'UPDATE sessions SET expires_at = ? WHERE id = ?'
    ).run(newExpiresAt, sessionId)
  }
}
