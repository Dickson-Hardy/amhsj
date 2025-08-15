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

// Removed badge counts (demo) – real counts to be fetched dynamically.
const editorSidebarItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', description: 'Editorial overview' },
  { href: '/dashboard?tab=submissions', icon: FileText, label: 'Manuscripts', description: 'Active submissions' },
  { href: '/dashboard?tab=reviews', icon: Eye, label: 'Reviews', description: 'Peer review status' },
  { href: '/dashboard?tab=submissions', icon: UserCheck, label: 'Reviewers', description: 'Manage reviewers' },
  { href: '/dashboard?tab=submissions', icon: Edit3, label: 'Editorial Decisions', description: 'Make decisions' },
  { href: '/dashboard?tab=overview', icon: Calendar, label: 'Editorial Calendar', description: 'Deadlines & events' },
  { href: '/dashboard?tab=analytics', icon: BarChart3, label: 'Analytics', description: 'Performance metrics' },
  { href: '/archive', icon: Archive, label: 'Published Issues', description: 'Archive management' },
  { href: '/dashboard', icon: Settings, label: 'Editorial Settings', description: 'Workflow preferences' }
]

export default function EditorLayout({ children }: EditorLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

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
      <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-6">
        <div className="flex items-center space-x-2">
          <Edit3 className="h-7 w-7 text-blue-600" />
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-gray-900">AMJHS Editorial</h1>
            <p className="text-[10px] text-gray-500">Management Console</p>
          </div>
        </div>
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search (manuscripts, reviewers, authors)" className="pl-10 h-9" />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0) || 'E'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-tight truncate max-w-[120px]">{session?.user?.name || 'Editor'}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{getEditorTitle()}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Profile Settings</DropdownMenuItem>
              <DropdownMenuItem><BookOpen className="mr-2 h-4 w-4" />Editorial Guidelines</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600"><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="pt-16 flex">
        <aside className="fixed top-16 bottom-0 left-0 w-72 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {editorSidebarItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 p-3 rounded-md text-sm transition-colors', isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
                  <span className="flex-1">
                    <span className="block font-medium leading-tight">{item.label}</span>
                    <span className="block text-[11px] text-gray-500 leading-tight">{item.description}</span>
                  </span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-200 text-[11px] text-gray-500">
            <p className="italic">Editorial metrics will appear here.</p>
          </div>
        </aside>
        <main className="flex-1 ml-72 h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
