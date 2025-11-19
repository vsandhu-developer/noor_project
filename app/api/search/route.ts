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
    const query = searchParams.get('q')
    const type = searchParams.get('type')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results: any = {}

    if (!type || type === 'groups') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { program: true, skills: true },
      })

      const groups = await prisma.group.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { courseTopic: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } },
          ],
        },
        include: {
          members: {
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
          },
          _count: {
            select: {
              members: true,
              files: true,
              events: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      const recommendedGroups = groups.map(group => {
        let score = 0
        if (user?.program && group.courseTopic.toLowerCase().includes(user.program.toLowerCase())) {
          score += 2
        }
        if (user?.skills && group.tags.some(tag => user.skills.includes(tag))) {
          score += 1
        }
        return { ...group, recommendationScore: score }
      }).sort((a, b) => b.recommendationScore - a.recommendationScore)

      results.groups = recommendedGroups
    }

    if (!type || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          id: { not: session.user.id },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { program: { contains: query, mode: 'insensitive' } },
            { skills: { hasSome: [query] } },
          ],
          profileVisibility: { not: 'PRIVATE' },
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          program: true,
          semester: true,
          skills: true,
        },
        take: 20,
      })

      results.users = users
    }

    if (!type || type === 'files') {
      const files = await prisma.file.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { fileName: { contains: query, mode: 'insensitive' } },
          ],
          group: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 20,
      })

      results.files = files
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

