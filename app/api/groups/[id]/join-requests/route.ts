import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        { error: 'Only admins can view join requests' },
        { status: 403 }
      )
    }

    const requests = await prisma.groupJoinRequest.findMany({
      where: {
        groupId: params.id,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            program: true,
            semester: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

