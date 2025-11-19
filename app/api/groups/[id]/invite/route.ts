import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(
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
        { error: 'Only admins can generate invite links' },
        { status: 403 }
      )
    }

    const inviteToken = crypto.randomBytes(32).toString('hex')

    const group = await prisma.group.update({
      where: { id: params.id },
      data: { inviteToken },
      select: {
        id: true,
        name: true,
        inviteToken: true,
      },
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/groups/join/${inviteToken}`

    return NextResponse.json(
      {
        inviteToken: group.inviteToken,
        inviteUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
        { error: 'Only admins can view invite links' },
        { status: 403 }
      )
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        inviteToken: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const inviteUrl = group.inviteToken
      ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/groups/join/${group.inviteToken}`
      : null

    return NextResponse.json(
      {
        inviteToken: group.inviteToken,
        inviteUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

