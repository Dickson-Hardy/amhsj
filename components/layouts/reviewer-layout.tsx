import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  FileText,
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
  Star,
  Calendar,
  Settings,
  BookOpen,
  Award,
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

interface ReviewerLayoutProps {
  children: ReactNode
}

const reviewerSidebarItems = [
  {
    href: '/reviewer',
    icon: Home,
    label: 'Dashboard',
    description: 'Review overview'
  },
  {
    href: '/reviewer/assignments',
    icon: FileText,
    label: 'Active Reviews',
    description: 'Current assignments',
    badge: '3'
  },
  {
    href: '/reviewer/invitations',
    icon: Mail,
    label: 'Review Invitations',
    description: 'Pending invitations',
    badge: '2'
  },
  {
    href: '/reviewer/completed',
    icon: CheckCircle,
    label: 'Completed Reviews',
    description: 'Review history'
  },
  {
    href: '/reviewer/calendar',
    icon: Calendar,
    label: 'Review Calendar',
    description: 'Deadlines & schedule'
  },
  {
    href: '/reviewer/expertise',
    icon: Star,
    label: 'Expertise Profile',
    description: 'Research areas'
  },
  {
    href: '/reviewer/performance',
    icon: BarChart3,
    label: 'Performance',
    description: 'Review metrics'
  },
  {
    href: '/reviewer/guidelines',
    icon: BookOpen,
    label: 'Review Guidelines',
    description: 'Best practices'
  },
  {
    href: '/reviewer/settings',
    icon: Settings,
    label: 'Preferences',
    description: 'Review settings'
  }
]

export default function ReviewerLayout({ children }: ReviewerLayoutProps) {
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
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AMJHS Reviewer</h1>
                <p className="text-xs text-gray-500">Peer Review System</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews, manuscripts, or guidelines..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Submit Review
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <Mail className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                4
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'R'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">Expert Reviewer</p>
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
                  Review Guidelines
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Award className="mr-2 h-4 w-4" />
                  Reviewer Recognition
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
              {reviewerSidebarItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/reviewer' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors group",
                      isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon 
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                        )} 
                      />
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          isActive ? "text-green-700" : "text-gray-900"
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

          {/* Review Stats */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Review Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Active Reviews</span>
                <span className="text-sm font-medium text-orange-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Completed (2024)</span>
                <span className="text-sm font-medium text-green-600">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Avg Review Time</span>
                <span className="text-sm font-medium text-blue-600">12 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Quality Score</span>
                <span className="text-sm font-medium text-purple-600">4.8/5</span>
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
                  <p className="text-xs font-medium text-gray-900">MS-2024-0156</p>
                  <p className="text-xs text-red-600">Due tomorrow</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0178</p>
                  <p className="text-xs text-yellow-600">Due in 3 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs font-medium text-gray-900">MS-2024-0189</p>
                  <p className="text-xs text-green-600">Due in 10 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recognition */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Recognition</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <p className="text-xs text-gray-600">Outstanding Reviewer 2024</p>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-gray-600">Top 10% Review Quality</p>
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
