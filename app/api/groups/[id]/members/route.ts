import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addMemberSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
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

    // Check if requester is admin
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
        { error: 'Only admins can add members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = addMemberSchema.parse(body)

    let targetUserId: string

    if (validatedData.userId) {
      targetUserId = validatedData.userId
    } else if (validatedData.email) {
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found with this email' },
          { status: 404 }
        )
      }

      targetUserId = user.id
    } else {
      return NextResponse.json(
        { error: 'Either userId or email must be provided' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: targetUserId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      )
    }

    // Add the member
    const member = await prisma.groupMember.create({
      data: {
        groupId: params.id,
        userId: targetUserId,
        role: validatedData.role,
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
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Send notification to the added user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'INVITATION',
        title: 'Added to Group',
        message: `You have been added to ${member.group.name}`,
        link: `/groups/${params.id}`,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
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

