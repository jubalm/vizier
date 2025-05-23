import argon2 from '@phc/argon2' // Use default import

// src/services/IUserService.ts
export interface IUserService {
  getUserByUsername(username: string): { id: string } | null
  createUser(id: string, username: string, email: string, created_at: string): void
  createSession(sessionId: string, userId: string, created_at: string, expires_at: string): void
  getSessionById(sessionId: string): { user_id: string; expires_at: string } | null
  updateSessionExpiry(sessionId: string, newExpiresAt: string): void
  createUserWithPassword(username: string, password: string, email: string): Promise<User | null>
  verifyUserPassword(username: string, password: string): Promise<boolean>
}

// Add type for User if not already present
export type User = {
  id: string
  username: string
  email?: string
  password_hash?: string
  // ...other fields...
}

// Add module declaration for @phc/argon2 to fix type errors
// If using TypeScript, add this at the top or in a .d.ts file:
declare module '@phc/argon2'
