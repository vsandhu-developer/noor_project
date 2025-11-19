import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMessageSchema = z.object({
  groupId: z.string(),
  content: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        readBy: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages }, { status: 200 })
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
    const validatedData = createMessageSchema.parse(body)

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: validatedData.groupId,
          userId: session.user.id,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        groupId: validatedData.groupId,
        userId: session.user.id,
        content: validatedData.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        readBy: true,
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
            type: 'MESSAGE',
            title: 'New Message',
            message: `${session.user?.name || 'Someone'} sent a message in the group`,
            link: `/groups/${validatedData.groupId}`,
          },
        })
      )
    )

    return NextResponse.json({ message }, { status: 201 })
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

