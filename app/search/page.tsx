import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import { SearchComponent } from '@/components/SearchComponent'

export default async function SearchPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>
      <SearchComponent />
    </DashboardLayout>
  )
}

