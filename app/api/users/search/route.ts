import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const program = searchParams.get('program')
    const skills = searchParams.get('skills')?.split(',')

    const where: any = {
      id: { not: session.user.id },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (program) {
      where.program = { contains: program, mode: 'insensitive' }
    }

    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        program: true,
        semester: true,
        skills: true,
        profileVisibility: true,
      },
      take: 50,
    })

    const filteredUsers = users.filter(user => {
      if (user.profileVisibility === 'PUBLIC') return true
      if (user.profileVisibility === 'PRIVATE') return false
      return true
    })

    return NextResponse.json({ users: filteredUsers }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

