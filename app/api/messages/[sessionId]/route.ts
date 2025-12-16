
//import { NextResponse } from 'next/server'
//import prisma from '@/app/lib/prisma'

//export async function GET(
//  req: Request,
//  context: { params: { sessionId: string } } // Next.js 13+ App Router
//) {
//  const { sessionId } = context.params // do NOT await here
//  const messages = await prisma.message.findMany({
//    where: { sessionId },
//    include: { sender: true },
//    orderBy: { createdAt: 'asc' },
//  })
//  return NextResponse.json(messages)
//}
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  const messages = await prisma.message.findMany({
    where: { sessionId },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}
