import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.redirect(
      new URL('/auth/signin?verified=true', process.env.NEXTAUTH_URL || 'http://localhost:3000')
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

