import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  courseTopic: z.string().min(1),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const topic = searchParams.get('topic')
    const tags = searchParams.get('tags')?.split(',')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { courseTopic: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (topic) {
      where.courseTopic = { contains: topic, mode: 'insensitive' }
    }
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            files: true,
            events: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ groups }, { status: 200 })
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

    const body = await request.json()
    const validatedData = createGroupSchema.parse(body)

    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        courseTopic: validatedData.courseTopic,
        tags: validatedData.tags || [],
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ group }, { status: 201 })
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

