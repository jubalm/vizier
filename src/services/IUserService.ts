// src/services/IUserService.ts
export interface IUserService {
  getUserByUsername(username: string): { id: string } | null
  createUser(id: string, username: string, email: string, created_at: string): void
  createSession(sessionId: string, userId: string, created_at: string, expires_at: string): void
  getSessionById(sessionId: string): { user_id: string; expires_at: string } | null
  updateSessionExpiry(sessionId: string, newExpiresAt: string): void
}
