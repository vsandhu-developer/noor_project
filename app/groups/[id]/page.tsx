import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import { prisma } from '@/lib/prisma'
import { GroupDetail } from '@/components/GroupDetail'

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              program: true,
              semester: true,
              skills: true,
            },
          },
        },
      },
      files: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      events: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          rsvps: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
      },
      messages: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
          readBy: true,
          attachments: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      },
    },
  })

  if (!group) {
    return (
      <DashboardLayout>
        <div>Group not found</div>
      </DashboardLayout>
    )
  }

  const currentMember = group.members.find((m) => m.userId === session.user.id)

  return (
    <DashboardLayout>
      <GroupDetail group={group} currentMember={currentMember} userId={session.user.id} />
    </DashboardLayout>
  )
}

