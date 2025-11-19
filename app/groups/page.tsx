import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import { GroupsList } from '@/components/GroupsList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function GroupsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
        <Button asChild>
          <Link href="/groups/create">Create Group</Link>
        </Button>
      </div>
      <GroupsList />
    </DashboardLayout>
  )
}

