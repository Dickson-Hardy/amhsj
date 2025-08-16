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
import Image from 'next/image'
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
  { href: '/reviewer', icon: Home, label: 'Dashboard', description: 'Review overview' },
  { href: '/reviewer/assignments', icon: FileText, label: 'Active Reviews', description: 'Current assignments' },
  { href: '/reviewer/invitations', icon: Mail, label: 'Review Invitations', description: 'Pending invitations' },
  { href: '/reviewer/completed', icon: CheckCircle, label: 'Completed Reviews', description: 'Review history' },
  { href: '/reviewer/calendar', icon: Calendar, label: 'Review Calendar', description: 'Deadlines & schedule' },
  { href: '/reviewer/expertise', icon: Star, label: 'Expertise Profile', description: 'Research areas' },
  { href: '/reviewer/performance', icon: BarChart3, label: 'Performance', description: 'Review metrics' },
  { href: '/reviewer/guidelines', icon: BookOpen, label: 'Review Guidelines', description: 'Best practices' },
  { href: '/reviewer/settings', icon: Settings, label: 'Preferences', description: 'Review settings' }
]

export default function ReviewerLayout({ children }: ReviewerLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  return (
    <div className="min-h-screen bg-amhsj-background">
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-amhsj-border z-50 flex items-center px-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo-amhsj.png"
              alt="AMHSJ Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-amhsj-primary">AMHSJ Reviewer</h1>
              <p className="text-[10px] text-amhsj-text-muted">Peer Review</p>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search (assignments, manuscripts)" className="pl-10 h-9" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-amhsj-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'R'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-tight truncate max-w-[120px]">{session?.user?.name || 'Reviewer'}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Reviewer</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Profile Settings</DropdownMenuItem>
              <DropdownMenuItem><BookOpen className="mr-2 h-4 w-4" />Review Guidelines</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600"><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="pt-16 flex">
        <aside className="fixed top-16 bottom-0 left-0 w-72 bg-amhsj-secondary-50 border-r border-amhsj-secondary-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {reviewerSidebarItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/reviewer' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 p-3 rounded-md text-sm transition-colors', isActive ? 'bg-amhsj-background text-amhsj-primary border border-amhsj-primary/20' : 'text-amhsj-text-light hover:bg-amhsj-background hover:text-amhsj-primary')}>
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-amhsj-primary' : 'text-amhsj-text-muted')} />
                  <span className="flex-1">
                    <span className="block font-medium leading-tight">{item.label}</span>
                    <span className="block text-[11px] text-amhsj-text-muted leading-tight">{item.description}</span>
                  </span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-amhsj-secondary-200 text-[11px] text-amhsj-text-muted">
            <p className="italic">Review stats will appear here.</p>
          </div>
        </aside>
        <main className="flex-1 ml-72 h-[calc(100vh-4rem)] overflow-y-auto p-6 bg-amhsj-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
