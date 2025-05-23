import bcrypt from 'bcryptjs'

export function hashPassword(password: string): string {
  // 10 salt rounds is a common default
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(hash: string, password: string): boolean {
  return bcrypt.compareSync(password, hash)
}
