import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    let fileData: ArrayBuffer
    let contentType: string = attachment.fileType

    if (attachment.filePath.startsWith('http://') || attachment.filePath.startsWith('https://')) {
      try {
        const response = await fetch(attachment.filePath)
        if (!response.ok) {
          return NextResponse.json(
            { error: 'File not found in cloud storage' },
            { status: 404 }
          )
        }
        fileData = await response.arrayBuffer()
        contentType = response.headers.get('content-type') || attachment.fileType
      } catch (fetchError) {
        return NextResponse.json(
          { error: 'Failed to fetch file from cloud storage' },
          { status: 500 }
        )
      }
    } else {
      try {
        const { readFile } = await import('fs/promises')
        const { join } = await import('path')
        const filePath = join(process.cwd(), 'public', attachment.filePath)
        const buffer = await readFile(filePath)
        fileData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      } catch (fileError) {
        return NextResponse.json(
          { error: 'File not found on server' },
          { status: 404 }
        )
      }
    }

    return new Response(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
        'Content-Length': attachment.fileSize.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

