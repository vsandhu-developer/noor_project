import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEventSchema = z.object({
  groupId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('groupId')
    const userId = searchParams.get('userId')

    const where: any = {}
    if (groupId) {
      where.groupId = groupId
    }
    if (userId) {
      where.group = {
        members: {
          some: {
            userId,
          },
        },
      }
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({ events }, { status: 200 })
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
    const validatedData = createEventSchema.parse(body)

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: validatedData.groupId,
          userId: session.user.id,
        },
      },
    })

    if (!member || member.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to create events' },
        { status: 403 }
      )
    }

    const event = await prisma.event.create({
      data: {
        groupId: validatedData.groupId,
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        location: validatedData.location,
        recurrence: validatedData.recurrence || 'NONE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        rsvps: true,
      },
    })

    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId: validatedData.groupId,
        userId: { not: session.user.id },
      },
    })

    await Promise.all(
      groupMembers.map(member =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'EVENT',
            title: 'New Event Created',
            message: `${session.user?.name || 'Someone'} created an event: ${validatedData.title}`,
            link: `/groups/${validatedData.groupId}`,
          },
        })
      )
    )

    return NextResponse.json({ event }, { status: 201 })
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

