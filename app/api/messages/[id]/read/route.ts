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

    const existingRead = await prisma.messageRead.findUnique({
      where: {
        messageId_userId: {
          messageId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingRead) {
      return NextResponse.json({ message: 'Already marked as read' }, { status: 200 })
    }

    await prisma.messageRead.create({
      data: {
        messageId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Message marked as read' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

