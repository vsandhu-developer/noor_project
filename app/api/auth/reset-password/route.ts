import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: validatedData.token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token: validatedData.token },
      })
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({
      where: { token: validatedData.token },
    })

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

