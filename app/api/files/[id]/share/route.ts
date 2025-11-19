import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { z } from 'zod'

const shareFileSchema = z.object({
  isPublic: z.boolean().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== session.user.id && file.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Not authorized to share this file' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = shareFileSchema.parse(body)

    const shareToken = crypto.randomBytes(32).toString('hex')

    const updatedFile = await prisma.file.update({
      where: { id: params.id },
      data: {
        shareToken,
        isPublic: validatedData.isPublic ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/files/share/${shareToken}`

    return NextResponse.json(
      {
        file: updatedFile,
        shareToken: updatedFile.shareToken,
        shareUrl,
      },
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.userId !== session.user.id && file.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Not authorized to view share link' },
        { status: 403 }
      )
    }

    const shareUrl = file.shareToken
      ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/files/share/${file.shareToken}`
      : null

    return NextResponse.json(
      {
        shareToken: file.shareToken,
        shareUrl,
        isPublic: file.isPublic,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

