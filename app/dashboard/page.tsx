import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Bell, Calendar, FileText, MessageSquare, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
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
              messages: true,
            },
          },
        },
      },
    },
    take: 10,
  });

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
    orderBy: { startTime: "asc" },
    take: 5,
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      read: false,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalFiles = await prisma.file.count({
    where: {
      group: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  const totalMessages = await prisma.message.count({
    where: {
      group: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user?.name || "User"}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your groups today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Groups</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups.length}</div>
            <p className="text-xs text-gray-600 mt-1">Active groups</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-gray-600 mt-1">Events scheduled</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Shared</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-gray-600 mt-1">Total files</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-gray-600 mt-1">Total messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>My Groups</span>
            </CardTitle>
            <CardDescription>
              {userGroups.length} groups you&apos;re part of
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userGroups.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  No groups yet
                </p>
              ) : (
                userGroups.map((member) => (
                  <Link
                    key={member.group.id}
                    href={`/groups/${member.group.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {member.group.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {member.group._count.members} members
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {member.group._count.files} files
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {member.group._count.messages} messages
                      </span>
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

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>
              {upcomingEvents.length} events coming up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/groups/${event.group.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      in {event.group.name}
                    </div>
                    {event.rsvps.length > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ You&apos;re attending
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Recent Notifications</span>
          </CardTitle>
          <CardDescription>
            {notifications.length} unread notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">
                No new notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || "#"}
                  className="block p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {notification.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
