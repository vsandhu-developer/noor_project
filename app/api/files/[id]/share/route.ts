import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    if (!file.filePath || !file.filePath.startsWith('https://')) {
      return NextResponse.json(
        { error: 'File is not stored in Cloudinary. Only Cloudinary files can be shared.' },
        { status: 400 }
      )
    }

    const updatedFile = await prisma.file.update({
      where: { id: params.id },
      data: {
        shareToken: file.filePath,
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

    return NextResponse.json(
      {
        file: updatedFile,
        shareUrl: file.filePath,
        isPublic: updatedFile.isPublic,
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

    const shareUrl = file.shareToken || file.filePath

    return NextResponse.json(
      {
        shareUrl: shareUrl && shareUrl.startsWith('https://') ? shareUrl : null,
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

