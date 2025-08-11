import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  FileText,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  TrendingUp,
  Mail,
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Home,
  Upload,
  Calendar,
  Settings,
  BookOpen,
  User,
  BarChart3,
  MessageSquare
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

interface AuthorLayoutProps {
  children: ReactNode
}

const authorSidebarItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    description: 'Submission overview'
  },
  {
    href: '/dashboard/submit',
    icon: Plus,
    label: 'New Submission',
    description: 'Submit manuscript'
  },
  {
    href: '/dashboard/manuscripts',
    icon: FileText,
    label: 'My Manuscripts',
    description: 'Track submissions',
    badge: '5'
  },
  {
    href: '/dashboard/revisions',
    icon: Upload,
    label: 'Revisions Required',
    description: 'Respond to reviews',
    badge: '2'
  },
  {
    href: '/dashboard/reviews',
    icon: Eye,
    label: 'Review Status',
    description: 'Peer review progress'
  },
  {
    href: '/dashboard/published',
    icon: CheckCircle,
    label: 'Published Works',
    description: 'Published articles'
  },
  {
    href: '/dashboard/communications',
    icon: MessageSquare,
    label: 'Editorial Messages',
    description: 'Editor communications'
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart3,
    label: 'Publication Metrics',
    description: 'Impact & citations'
  },
  {
    href: '/dashboard/profile',
    icon: User,
    label: 'Author Profile',
    description: 'Manage profile'
  },
  {
    href: '/dashboard/guidelines',
    icon: BookOpen,
    label: 'Submission Guidelines',
    description: 'Author guidelines'
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Preferences',
    description: 'Account settings'
  }
]

export default function AuthorLayout({ children }: AuthorLayoutProps) {
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
              <FileText className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AMJHS Author Portal</h1>
                <p className="text-xs text-gray-500">Manuscript Submission System</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search manuscripts, guidelines, or help..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Submission
            </Button>

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
                6
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">Research Author</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Author Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Submission Guidelines
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
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
              {authorSidebarItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors group",
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon 
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                        )} 
                      />
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          isActive ? "text-indigo-700" : "text-gray-900"
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

          {/* Submission Stats */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Submission Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Active Submissions</span>
                <span className="text-sm font-medium text-blue-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Under Review</span>
                <span className="text-sm font-medium text-yellow-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Published (2024)</span>
                <span className="text-sm font-medium text-green-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Acceptance Rate</span>
                <span className="text-sm font-medium text-purple-600">75%</span>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Action Required</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0234</p>
                  <p className="text-xs text-red-600">Revision due in 2 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Editorial Message</p>
                  <p className="text-xs text-blue-600">Response requested</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0198</p>
                  <p className="text-xs text-yellow-600">Upload missing files</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Tips</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800 font-medium">💡 Tip</p>
                <p className="text-xs text-blue-700">Use ORCID for faster submission processing</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-800 font-medium">📋 Reminder</p>
                <p className="text-xs text-green-700">Check formatting guidelines before submission</p>
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
