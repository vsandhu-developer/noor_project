import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/ProfileForm'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      program: true,
      semester: true,
      skills: true,
      profilePhoto: true,
      profileVisibility: true,
      emailNotifications: true,
      pushNotifications: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        <ProfileForm user={user} />
      </div>
    </DashboardLayout>
  )
}

