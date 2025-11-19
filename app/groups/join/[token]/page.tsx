import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function JoinGroupByTokenPage({
  params,
}: {
  params: { token: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/auth/signin?redirect=/groups/join/${params.token}`)
  }

  try {
    const group = await prisma.group.findUnique({
      where: { inviteToken: params.token },
    })

    if (!group) {
      redirect('/groups?error=invalid_token')
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id,
        },
      },
    })

    if (existingMember) {
      redirect(`/groups/${group.id}?message=already_member`)
    }

    if (group.requiresApproval) {
      const existingRequest = await prisma.groupJoinRequest.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: session.user.id,
          },
        },
      })

      if (!existingRequest) {
        await prisma.groupJoinRequest.create({
          data: {
            groupId: group.id,
            userId: session.user.id,
            status: 'PENDING',
          },
        })

        const admins = await prisma.groupMember.findMany({
          where: {
            groupId: group.id,
            role: 'ADMIN',
          },
        })

        await Promise.all(
          admins.map(admin =>
            prisma.notification.create({
              data: {
                userId: admin.userId,
                type: 'INVITATION',
                title: 'New Join Request',
                message: `${session.user?.name || 'Someone'} requested to join ${group.name}`,
                link: `/groups/${group.id}`,
              },
            })
          )
        )
      }

      redirect(`/groups/${group.id}?message=request_sent`)
    } else {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: session.user.id,
          role: 'MEMBER',
        },
      })

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'MEMBER_JOINED',
          title: 'Joined Group',
          message: `You joined ${group.name}`,
          link: `/groups/${group.id}`,
        },
      })

      redirect(`/groups/${group.id}?message=joined`)
    }
  } catch (error) {
    redirect('/groups?error=join_failed')
  }
}

