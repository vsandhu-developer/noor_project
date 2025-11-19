import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isValidStudentEmail } from '@/lib/utils'
import { z } from 'zod'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  program: z.string().optional(),
  semester: z.number().int().positive().optional(),
  skills: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    if (!isValidStudentEmail(validatedData.email)) {
      return NextResponse.json(
        { error: 'Please use a valid institutional/student email address' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        program: validatedData.program,
        semester: validatedData.semester,
        skills: validatedData.skills || [],
      },
    })

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)

    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token: verificationToken,
        expires,
      },
    })

    let emailResult
    try {
      emailResult = await sendVerificationEmail(validatedData.email, verificationToken)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      emailResult = { success: false, message: 'Failed to send verification email' }
    }

    const emailConfigured = !!process.env.EMAIL_SERVICE_API_KEY

    return NextResponse.json(
      {
        message: 'User registered successfully. Please check your email to verify your account.',
        emailSent: emailResult?.success || false,
        emailMessage: emailResult?.message || 'Verification email sent',
        emailConfigured,
        verificationUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}` : null,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
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

