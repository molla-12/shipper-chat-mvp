// app/api/messages/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify user is part of this session
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        users: {
          some: {
            userId: user.id
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: { sessionId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({ 
      messages: messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}