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
  Eye,
  Megaphone,
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

const adminSidebarItems = [
  {
    href: '/admin',
    icon: Home,
    label: 'Dashboard',
    description: 'System overview'
  },
  {
    href: '/admin/users',
    icon: Users,
    label: 'User Management',
    description: 'Manage users & roles'
  },
  {
    href: '/admin/submissions',
    icon: FileText,
    label: 'Submissions',
    description: 'Review & manage articles'
  },
  {
    href: '/admin/reviewers',
    icon: UserCheck,
    label: 'Reviewer Applications',
    description: 'Approve reviewers',
    badge: '3' // Dynamic count
  },
  {
    href: '/admin/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Reports & insights'
  },
  {
    href: '/admin/advertisements',
    icon: Megaphone,
    label: 'Advertisements',
    description: 'Manage site ads'
  },
  {
    href: '/admin/system',
    icon: Database,
    label: 'System Health',
    description: 'Monitor performance'
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: 'Settings',
    description: 'Configure system'
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AMJHS Admin</h1>
                <p className="text-xs text-gray-500">System Administration</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users, articles, or settings..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <Mail className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                7
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {adminSidebarItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors group",
                      isActive
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon 
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
                        )} 
                      />
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          isActive ? "text-purple-700" : "text-gray-900"
                        )}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Active Users</span>
                <span className="text-sm font-medium text-green-600">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Pending Reviews</span>
                <span className="text-sm font-medium text-orange-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">New Submissions</span>
                <span className="text-sm font-medium text-blue-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">System Health</span>
                <span className="text-sm font-medium text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
