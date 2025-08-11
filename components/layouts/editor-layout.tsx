import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  FileText,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Mail,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Home,
  Edit3,
  UserCheck,
  Eye,
  Settings,
  BookOpen,
  Archive,
  BarChart3
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

interface EditorLayoutProps {
  children: ReactNode
}

const editorSidebarItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    description: 'Editorial overview'
  },
  {
    href: '/dashboard/manuscripts',
    icon: FileText,
    label: 'Manuscripts',
    description: 'Active submissions',
    badge: '23'
  },
  {
    href: '/dashboard/reviews',
    icon: Eye,
    label: 'Reviews',
    description: 'Peer review status',
    badge: '8'
  },
  {
    href: '/dashboard/reviewers',
    icon: UserCheck,
    label: 'Reviewers',
    description: 'Manage reviewers'
  },
  {
    href: '/dashboard/decisions',
    icon: Edit3,
    label: 'Editorial Decisions',
    description: 'Make decisions'
  },
  {
    href: '/dashboard/calendar',
    icon: Calendar,
    label: 'Editorial Calendar',
    description: 'Deadlines & events'
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Performance metrics'
  },
  {
    href: '/dashboard/archive',
    icon: Archive,
    label: 'Published Issues',
    description: 'Archive management'
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Editorial Settings',
    description: 'Workflow preferences'
  }
]

export default function EditorLayout({ children }: EditorLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Determine editor role title
  const getEditorTitle = () => {
    if (session?.user?.email === 'eic@amhsj.org') return 'Editor-in-Chief'
    if (session?.user?.email === 'managing@amhsj.org') return 'Managing Editor'
    if (session?.user?.email?.includes('section')) return 'Section Editor'
    if (session?.user?.email?.includes('production')) return 'Production Editor'
    if (session?.user?.email?.includes('guest')) return 'Guest Editor'
    return 'Associate Editor'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AMJHS Editorial</h1>
                <p className="text-xs text-gray-500">Editorial Management System</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search manuscripts, reviewers, or authors..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              New Submission
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                5
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <Mail className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                12
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'E'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{getEditorTitle()}</p>
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
                  <BookOpen className="mr-2 h-4 w-4" />
                  Editorial Guidelines
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
              {editorSidebarItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors group",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon 
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                        )} 
                      />
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          isActive ? "text-blue-700" : "text-gray-900"
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

          {/* Editorial Quick Stats */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Editorial Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Pending Decisions</span>
                <span className="text-sm font-medium text-red-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Under Review</span>
                <span className="text-sm font-medium text-yellow-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">This Month</span>
                <span className="text-sm font-medium text-green-600">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Avg Review Time</span>
                <span className="text-sm font-medium text-blue-600">18d</span>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Deadlines</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0045</p>
                  <p className="text-xs text-red-600">Due in 2 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0047</p>
                  <p className="text-xs text-yellow-600">Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0049</p>
                  <p className="text-xs text-green-600">Due in 12 days</p>
                </div>
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
