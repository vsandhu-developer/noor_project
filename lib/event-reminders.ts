import { prisma } from './prisma'
import { sendEventReminderEmail } from './email'

export async function sendEventReminders(): Promise<void> {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const upcomingEvents = await prisma.event.findMany({
    where: {
      startTime: {
        gte: now,
        lte: oneDayFromNow,
      },
      reminderSent: false,
    },
    include: {
      group: {
        include: {
          members: true,
        },
      },
    },
  })

  for (const event of upcomingEvents) {
    const timeUntilEvent = event.startTime.getTime() - now.getTime()
    const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60)

    if (hoursUntilEvent <= 1 && hoursUntilEvent > 0) {
      for (const member of event.group.members) {
        const user = await prisma.user.findUnique({
          where: { id: member.userId },
          select: { email: true, emailNotifications: true },
        })

        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'EVENT',
            title: 'Event Reminder',
            message: `Event "${event.title}" starts in less than 1 hour`,
            link: `/groups/${event.groupId}`,
          },
        })

        if (user?.emailNotifications) {
          try {
            await sendEventReminderEmail(
              user.email,
              event.title,
              event.startTime,
              event.group.name
            )
          } catch (error) {
            console.error('Failed to send reminder email:', error)
          }
        }
      }

      await prisma.event.update({
        where: { id: event.id },
        data: { reminderSent: true },
      })
    } else if (hoursUntilEvent <= 24 && hoursUntilEvent > 23) {
      for (const member of event.group.members) {
        const user = await prisma.user.findUnique({
          where: { id: member.userId },
          select: { email: true, emailNotifications: true },
        })

        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'EVENT',
            title: 'Event Reminder',
            message: `Event "${event.title}" starts tomorrow`,
            link: `/groups/${event.groupId}`,
          },
        })

        if (user?.emailNotifications) {
          try {
            await sendEventReminderEmail(
              user.email,
              event.title,
              event.startTime,
              event.group.name
            )
          } catch (error) {
            console.error('Failed to send reminder email:', error)
          }
        }
      }
    }
  }
}

