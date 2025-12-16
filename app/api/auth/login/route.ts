import { NextResponse } from 'next/server'
 import { prisma } from '@/app/lib/prisma'
import { signToken } from '@/app/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { username } })

  if (!user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = signToken({ id: user.id, username: user.username, name: user.name })
  return NextResponse.json({ token, user })
}
