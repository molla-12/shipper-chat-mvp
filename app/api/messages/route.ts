import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload: any = verifyToken(token) // contains { id, username, name }

    const { content, receiverId, sessionId } = await req.json()

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Missing content or receiverId' }, { status: 400 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: payload.id,
        sessionId: sessionId || `${payload.id}-${receiverId}`,
      },
    })

    return NextResponse.json({ message })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
