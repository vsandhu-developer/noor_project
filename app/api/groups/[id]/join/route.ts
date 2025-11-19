import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        group: true,
      },
    })

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'MEMBER_JOINED',
        title: 'Joined Group',
        message: `You joined ${member.group.name}`,
        link: `/groups/${params.id}`,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

