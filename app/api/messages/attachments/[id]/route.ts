import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attachment = await prisma.messageAttachment.findUnique({
      where: { id: params.id },
      include: {
        message: {
          include: {
            group: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    if (attachment.message.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Not authorized to access this attachment' },
        { status: 403 }
      )
    }

    if (attachment.filePath.startsWith('https://') || attachment.filePath.startsWith('http://')) {
      return NextResponse.redirect(attachment.filePath)
    }

    try {
      const fileBuffer = await readFile(attachment.filePath)
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      )

      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': attachment.fileType,
          'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
          'Content-Length': attachment.fileSize.toString(),
        },
      })
    } catch (fileError) {
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

