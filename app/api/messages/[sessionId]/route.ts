import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { verifyToken } from '@/app/lib/auth'

interface Params {
  params: { sessionId: string }
}

export async function GET(req: Request, { params }: Params) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    verifyToken(token)

    const { sessionId } = params

    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, username: true, name: true, image: true } } },
    })

    return NextResponse.json({ messages })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
