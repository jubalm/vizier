import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

// Generate a secure random session token (20 bytes, base32, no padding)
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

// Hash the session token with SHA-256 and return as hex string
export function hashSessionToken(token: string): string {
  const encoder = new TextEncoder()
  const hash = sha256(encoder.encode(token))
  // Convert Uint8Array to hex string
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('')
}
