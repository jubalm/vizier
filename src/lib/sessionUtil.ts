import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

export function hashSessionToken(token: string): string {
  const encoder = new TextEncoder()
  const hash = sha256(encoder.encode(token))
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('')
}
