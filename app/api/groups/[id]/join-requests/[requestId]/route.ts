import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!adminMember || adminMember.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can approve/reject requests' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateRequestSchema.parse(body)

    const joinRequest = await prisma.groupJoinRequest.update({
      where: { id: params.requestId },
      data: { status: validatedData.status },
      include: {
        user: true,
        group: true,
      },
    })

    if (validatedData.status === 'APPROVED') {
      await prisma.groupMember.create({
        data: {
          groupId: params.id,
          userId: joinRequest.userId,
          role: 'MEMBER',
        },
      })

      await prisma.notification.create({
        data: {
          userId: joinRequest.userId,
          type: 'INVITATION',
          title: 'Join Request Approved',
          message: `Your request to join ${joinRequest.group.name} has been approved`,
          link: `/groups/${params.id}`,
        },
      })
    } else {
      await prisma.notification.create({
        data: {
          userId: joinRequest.userId,
          type: 'INVITATION',
          title: 'Join Request Rejected',
          message: `Your request to join ${joinRequest.group.name} has been rejected`,
          link: `/groups`,
        },
      })
    }

    return NextResponse.json({ joinRequest }, { status: 200 })
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

