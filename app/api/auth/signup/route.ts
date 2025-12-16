import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { signToken } from '@/app/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const { username, password, name } = await req.json()

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: { username, password: hashed, name, image: '/avatar.png' },
  })

  // Sign JWT
  const token = signToken({ id: user.id, username: user.username, name: user.name })

  return NextResponse.json({ token, user })
}
