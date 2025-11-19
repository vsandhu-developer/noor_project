import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userGroups = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          _count: {
            select: {
              members: true,
              files: true,
              events: true,
            },
          },
        },
      },
    },
    take: 10,
  })

  const upcomingEvents = await prisma.event.findMany({
    where: {
      group: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
        },
      },
      rsvps: {
        where: {
          userId: session.user.id,
        },
      },
    },
    orderBy: { startTime: 'asc' },
    take: 5,
  })

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Groups</CardTitle>
              <CardDescription>{userGroups.length} groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userGroups.length === 0 ? (
                  <p className="text-sm text-gray-600">No groups yet</p>
                ) : (
                  userGroups.map((member) => (
                    <Link
                      key={member.group.id}
                      href={`/groups/${member.group.id}`}
                      className="block p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="font-medium">{member.group.name}</div>
                      <div className="text-sm text-gray-600">
                        {member.group._count.members} members
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href="/groups">View All Groups</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>{upcomingEvents.length} events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-600">No upcoming events</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="p-2">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.startTime).toLocaleDateString()} - {event.group.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>{notifications.length} unread</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-600">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link || '#'}
                      className="block p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-gray-600">{notification.message}</div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

