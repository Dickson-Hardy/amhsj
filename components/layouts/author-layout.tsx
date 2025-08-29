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
import Image from 'next/image'
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
  { href: '/author/dashboard', icon: Home, label: 'Dashboard', description: 'Submission overview' },
  { href: '/author/profile', icon: User, label: 'My Profile', description: 'Complete your profile' },
  { href: '/author/submit', icon: Plus, label: 'New Submission', description: 'Submit manuscript' },
  { href: '/author/submissions', icon: FileText, label: 'My Submissions', description: 'View all manuscripts' },
  { href: '/author/submissions?filter=revisions', icon: Upload, label: 'Revisions Required', description: 'Respond to reviews' },
  { href: '/author/submissions?tab=reviews', icon: Eye, label: 'Review Status', description: 'Peer review progress' },
  { href: '/author/submissions?filter=published', icon: CheckCircle, label: 'Published Works', description: 'Published articles' },
  { href: '/author/messages', icon: MessageSquare, label: 'Editorial Messages', description: 'Editor communications' },
  { href: '/author/analytics', icon: BarChart3, label: 'Publication Metrics', description: 'Impact & citations' },
  { href: '/author/guidelines', icon: BookOpen, label: 'Submission Guidelines', description: 'Author guidelines' },
  { href: '/author/preferences', icon: Settings, label: 'Preferences', description: 'Account settings' }
]

export default function AuthorLayout({ children }: AuthorLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  return (
    <div className="min-h-screen bg-amhsj-background">
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-amhsj-secondary-200 z-50 flex items-center px-6">
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
              <h1 className="text-sm font-semibold text-amhsj-primary">AMHSJ Author Portal</h1>
              <p className="text-[10px] text-amhsj-text-muted">Submission System</p>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search (manuscripts, guidelines)" className="pl-10 h-9" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-amhsj-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-tight truncate max-w-[120px]">{session?.user?.name || 'Author'}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Author</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                 <Link href="/author/profile">
                   <User className="mr-2 h-4 w-4" />
                   Author Profile
                 </Link>
               </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/author/guidelines">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Submission Guidelines
                </Link>
              </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                 <Link href="/author/preferences">
                   <Settings className="mr-2 h-4 w-4" />
                   Account Settings
                 </Link>
               </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="pt-16 flex">
        <aside className="fixed top-16 bottom-0 left-0 w-72 bg-amhsj-secondary-50 border-r border-amhsj-secondary-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {authorSidebarItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
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
            <p className="italic">Submission tips & stats will appear here.</p>
          </div>
        </aside>
        <main className="flex-1 ml-72 h-[calc(100vh-4rem)] overflow-y-auto p-6 bg-amhsj-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
