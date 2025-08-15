'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Shield,
  Mail,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Home,
  UserCheck,
  Database,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminLayoutProps {
  children: ReactNode
}

// Sidebar definition – remove all demo badge counts; real values should be injected later.
const adminSidebarItems = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard', description: 'System overview' },
  { href: '/admin/users', icon: Users, label: 'User Management', description: 'Manage users & roles' },
  { href: '/admin/submissions', icon: FileText, label: 'Submissions', description: 'Review & manage articles' },
  { href: '/admin/applications', icon: UserCheck, label: 'Reviewer Applications', description: 'Approve reviewers' },
  { href: '/admin/reviewers', icon: Users, label: 'Reviewers', description: 'Manage reviewers' },
  { href: '/admin/doi-management', icon: BarChart3, label: 'DOI Management', description: 'Manage DOI assignments' },
  { href: '/admin/archive-management', icon: Database, label: 'Archive Management', description: 'Manage publication archive' },
  { href: '/admin/seo', icon: Settings, label: 'SEO Settings', description: 'Configure SEO' }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-6">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-gray-900">AMJHS Admin</h1>
            <p className="text-[10px] text-gray-500">System Administration</p>
          </div>
        </div>
        {/* Search */}
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search (users, submissions, settings)" className="pl-10 h-9" />
          </div>
        </div>
        {/* User / Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Badges removed – add dynamic indicators later */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-tight truncate max-w-[120px]">{session?.user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Admin</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity className="mr-2 h-4 w-4" /> Activity Log
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="pt-16 flex">
        <aside className="fixed top-16 bottom-0 left-0 w-72 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {adminSidebarItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-md text-sm transition-colors',
                    isActive ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600')} />
                  <span className="flex-1">
                    <span className="block font-medium leading-tight">{item.label}</span>
                    <span className="block text-[11px] text-gray-500 leading-tight">{item.description}</span>
                  </span>
                </Link>
              )
            })}
          </nav>
          {/* Placeholder for future dynamic widgets */}
          <div className="p-4 border-t border-gray-200 text-[11px] text-gray-500">
            {/* TODO: Inject small live stats component (system health, pending tasks) */}
            <p className="italic">Stats will appear here once connected.</p>
          </div>
        </aside>

        <main className="flex-1 ml-72 h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
