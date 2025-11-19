import { ReactNode } from 'react'
import { DashboardSidebar } from './DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      <div className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pt-8 pt-20">
          {children}
        </div>
      </div>
    </div>
  )
}

