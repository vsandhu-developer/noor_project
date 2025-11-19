import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const rsvpSchema = z.object({
  status: z.enum(['YES', 'MAYBE', 'NO']),
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

    const body = await request.json()
    const validatedData = rsvpSchema.parse(body)

    const event = await prisma.event.findUnique({
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    const rsvp = await prisma.eventRSVP.upsert({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
      update: {
        status: validatedData.status,
      },
      create: {
        eventId: params.id,
        userId: session.user.id,
        status: validatedData.status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    })

    return NextResponse.json({ rsvp }, { status: 200 })
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

