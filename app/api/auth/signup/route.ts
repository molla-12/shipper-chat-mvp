
import { NextResponse } from 'next/server'
 import prisma from '@/app/lib/prisma'
import { signToken } from '@/app/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ 
      where: { email }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      }
    })

    // Create token payload
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
       image: user.image || undefined  
    }

    // Sign JWT
    const token = signToken(tokenPayload)

    // Create response
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    })

    // Set cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}