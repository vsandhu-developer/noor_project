import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AnimatedHomePage } from '@/components/AnimatedHomePage'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return <AnimatedHomePage session={session} />
}
