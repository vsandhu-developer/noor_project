import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const requestJoinSchema = z.object({
  message: z.string().optional(),
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

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this group' },
        { status: 400 }
      )
    }

    const existingRequest = await prisma.groupJoinRequest.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Join request already exists' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = requestJoinSchema.parse(body)

    if (group.requiresApproval) {
      const joinRequest = await prisma.groupJoinRequest.create({
        data: {
          groupId: params.id,
          userId: session.user.id,
          message: validatedData.message,
          status: 'PENDING',
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

      const admins = await prisma.groupMember.findMany({
        where: {
          groupId: params.id,
          role: 'ADMIN',
        },
      })

      await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              userId: admin.userId,
              type: 'INVITATION',
              title: 'New Join Request',
              message: `${session.user?.name || 'Someone'} requested to join ${group.name}`,
              link: `/groups/${params.id}`,
            },
          })
        )
      )

      return NextResponse.json({ joinRequest }, { status: 201 })
    } else {
      const member = await prisma.groupMember.create({
        data: {
          groupId: params.id,
          userId: session.user.id,
          role: 'MEMBER',
        },
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
      })

      return NextResponse.json({ member }, { status: 201 })
    }
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

