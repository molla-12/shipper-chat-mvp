
import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export async function GET(
  req: Request,
  context: { params: { sessionId: string } } // Next.js 13+ App Router
) {
  const { sessionId } = context.params // do NOT await here
  const messages = await prisma.message.findMany({
    where: { sessionId },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}
