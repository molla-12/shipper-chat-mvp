
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

interface JWTPayload {
  id: string
  email: string
  name: string
  image?: string
  exp?: number
  iat?: number
}

export function signToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    
    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      return null
    }
    
    const payload = decoded as JWTPayload
    
    // Check required fields
    if (!payload.id || !payload.email || !payload.name) {
      return null
    }
    
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return null
    }
    
    return verifyToken(token)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}