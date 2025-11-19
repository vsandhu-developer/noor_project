import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const messageId = formData.get('messageId') as string

    if (!file || !messageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed size' },
        { status: 400 }
      )
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
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

    if (!message || message.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 403 }
      )
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'messages', messageId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    const attachment = await prisma.messageAttachment.create({
      data: {
        messageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `/uploads/messages/${messageId}/${fileName}`,
      },
    })

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

