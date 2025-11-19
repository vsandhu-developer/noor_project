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

    if (file.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    const isImage = file.fileType.startsWith('image/')
    const isPDF = file.fileType === 'application/pdf'

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { error: 'Preview not available for this file type' },
        { status: 400 }
      )
    }

    if (isImage) {
      const filePath = join(process.cwd(), 'public', file.filePath)
      const fileBuffer = await readFile(filePath)

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': file.fileType,
          'Content-Disposition': 'inline',
        },
      })
    }

    if (isPDF) {
      return NextResponse.json({
        previewUrl: file.filePath,
        fileType: 'pdf',
        message: 'PDF preview available at the file path',
      })
    }

    return NextResponse.json({ error: 'Preview not supported' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

