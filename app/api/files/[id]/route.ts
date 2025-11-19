import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const shareToken = searchParams.get('token')

    let file

    if (shareToken) {
      file = await prisma.file.findUnique({
        where: { shareToken },
      })

      if (!file || !file.isPublic) {
        return NextResponse.json(
          { error: 'File not found or not publicly accessible' },
          { status: 404 }
        )
      }
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      file = await prisma.file.findUnique({
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
    }

    let fileData: ArrayBuffer
    let contentType: string = file.fileType

    if (file.filePath.startsWith('http://') || file.filePath.startsWith('https://')) {
      const response = await fetch(file.filePath)
      fileData = await response.arrayBuffer()
      contentType = response.headers.get('content-type') || file.fileType
    } else {
      try {
        const { readFile } = await import('fs/promises')
        const { join } = await import('path')
        const filePath = join(process.cwd(), 'public', file.filePath)
        const buffer = await readFile(filePath)
        fileData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      } catch (error) {
        return NextResponse.json(
          { error: 'File not found on server. It may have been stored in cloud storage.' },
          { status: 404 }
        )
      }
    }

    return new Response(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
              where: {
                userId: session.user.id,
                role: { in: ['ADMIN', 'MEMBER'] },
              },
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
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await prisma.file.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'File deleted' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

