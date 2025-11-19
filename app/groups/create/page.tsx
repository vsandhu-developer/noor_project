import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import { CreateGroupForm } from '@/components/CreateGroupForm'

export default async function CreateGroupPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Study Group</h1>
        <CreateGroupForm />
      </div>
    </DashboardLayout>
  )
}

