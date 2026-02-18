// Simple authentication for admin panel
// In production, use a proper authentication system like NextAuth.js

const ADMIN_PASSWORD = "Purplson123!"

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt or similar
  return Buffer.from(password).toString('base64')
}

export function verifySession(sessionToken: string | null): boolean {
  if (!sessionToken) return false
  
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString()
    return decoded === ADMIN_PASSWORD
  } catch {
    return false
  }
}
