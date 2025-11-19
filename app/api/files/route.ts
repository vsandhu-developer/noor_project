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
]

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search')

    const where: any = {}
    if (groupId) {
      where.groupId = groupId
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const files = await prisma.file.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ files }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string
    const name = formData.get('name') as string

    if (!file || !groupId || !name) {
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

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!member || member.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to upload files' },
        { status: 403 }
      )
    }

    const existingFile = await prisma.file.findFirst({
      where: {
        groupId,
        fileName: file.name,
      },
      orderBy: { version: 'desc' },
    })

    if (existingFile && existingFile.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'File with this name already exists. Please rename your file or contact the file owner.' },
        { status: 409 }
      )
    }

    const version = existingFile ? existingFile.version + 1 : 1

    const uploadsDir = join(process.cwd(), 'public', 'uploads', groupId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    const savedFile = await prisma.file.create({
      data: {
        groupId,
        userId: session.user.id,
        name,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `/uploads/${groupId}/${fileName}`,
        version,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { not: session.user.id },
      },
    })

    await Promise.all(
      groupMembers.map(member =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'FILE_UPLOAD',
            title: 'New File Uploaded',
            message: `${session.user?.name || 'Someone'} uploaded a file: ${name}`,
            link: `/groups/${groupId}`,
          },
        })
      )
    )

    return NextResponse.json({ file: savedFile }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

