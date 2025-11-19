import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { CreateEventForm } from '@/components/CreateEventForm'

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: { groupId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Event</h1>
        <CreateEventForm groupId={searchParams.groupId} />
      </div>
    </div>
  )
}

