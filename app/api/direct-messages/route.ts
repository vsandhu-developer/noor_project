import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createDirectMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
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
    const validatedData = createDirectMessageSchema.parse(body)

    const message = await prisma.directMessage.create({
      data: {
        senderId: session.user.id,
        receiverId: validatedData.receiverId,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    })

    await prisma.notification.create({
      data: {
        userId: validatedData.receiverId,
        type: 'MESSAGE',
        title: 'New Direct Message',
        message: `${session.user?.name || 'Someone'} sent you a message`,
        link: `/messages/${session.user.id}`,
      },
    })

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

