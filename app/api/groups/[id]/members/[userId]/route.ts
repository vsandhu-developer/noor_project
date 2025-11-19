import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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
        { error: 'Only admins can update members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateMemberSchema.parse(body)

    const member = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: params.userId,
        },
      },
      data: validatedData,
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

    return NextResponse.json({ member }, { status: 200 })
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
  { params }: { params: { id: string; userId: string } }
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
        { error: 'Only admins can remove members' },
        { status: 403 }
      )
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: params.userId,
        },
      },
    })

    return NextResponse.json({ message: 'Member removed' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

