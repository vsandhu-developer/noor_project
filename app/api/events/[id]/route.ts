import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
                profilePhoto: true,
              },
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.userId !== session.user.id) {
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: event.groupId,
            userId: session.user.id,
          },
        },
      })

      if (!member || member.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    const updateData: any = {}
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.startTime) updateData.startTime = new Date(validatedData.startTime)
    if (validatedData.endTime) updateData.endTime = new Date(validatedData.endTime)
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.recurrence) updateData.recurrence = validatedData.recurrence

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
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
    })

    return NextResponse.json({ event: updatedEvent }, { status: 200 })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.userId !== session.user.id) {
      const member = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: event.groupId,
            userId: session.user.id,
          },
        },
      })

      if (!member || member.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Event deleted' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

