'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  User, 
  Mail,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/groups',
      label: 'Groups',
      icon: Users,
    },
    {
      href: '/search',
      label: 'Search',
      icon: Search,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
    },
    {
      href: '/dashboard/email-status',
      label: 'Email Status',
      icon: Mail,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between ${className}`}>
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          CampusConnect
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 hidden lg:block">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              CampusConnect
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${
                          active
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 hidden lg:block">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">Quick Actions</p>
              <div className="mt-2 space-y-1">
                <Link
                  href="/groups/new"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Create Group
                </Link>
                <Link
                  href="/search"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Find Groups
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

