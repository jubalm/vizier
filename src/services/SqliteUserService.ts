import { IUserService } from './IUserService'
import { authDb } from '../db'

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

  createSession(sessionId: string, userId: string, created_at: string, expires_at: string) {
    authDb.query(
      'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
    ).run(sessionId, userId, created_at, expires_at)
  }

  getSessionById(sessionId: string) {
    return authDb.query<{ user_id: string; expires_at: string }, { $sessionId: string }>(
      'SELECT user_id, expires_at FROM sessions WHERE id = $sessionId'
    ).get({ $sessionId: sessionId })
  }

  updateSessionExpiry(sessionId: string, newExpiresAt: string) {
    authDb.query(
      'UPDATE sessions SET expires_at = ? WHERE id = ?'
    ).run(newExpiresAt, sessionId)
  }
}
