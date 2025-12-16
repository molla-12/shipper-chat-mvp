// import { NextResponse } from 'next/server'
// import { prisma } from '@/app/lib/prisma'
// import { signToken } from '@/app/lib/auth'


// export async function POST(req: Request) {
// const { email, name } = await req.json()


// let user = await prisma.user.findUnique({ where: { email } })


// if (!user) {
// user = await prisma.user.create({
// data: { name, email, image: '/avatar.png' },
// })
// }


// const token = signToken({ id: user.id, email: user.email })


// return NextResponse.json({ token, user })
// }

// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
 import { prisma } from '@/app/lib/prisma'
import { signToken } from '@/app/lib/auth'

export async function POST(req: Request) {
  const { email, name } = await req.json()

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: { name, email, image: '/avatar.png' },
    })
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  })

  return NextResponse.json({ token, user })
}
