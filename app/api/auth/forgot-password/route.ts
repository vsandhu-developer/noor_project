import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a reset link has been sent' },
        { status: 200 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: validatedData.email,
        expires: { lt: new Date() },
      },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token: resetToken,
        expires,
      },
    })

    let emailResult
    try {
      emailResult = await sendPasswordResetEmail(validatedData.email, resetToken)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      emailResult = { success: false, message: 'Failed to send reset email' }
    }

    const emailConfigured = !!process.env.EMAIL_SERVICE_API_KEY

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a password reset link has been sent.',
        emailSent: emailResult?.success || false,
        emailMessage: emailResult?.message || 'Password reset email sent',
        emailConfigured,
        resetUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}` : null,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

