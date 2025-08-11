"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  X,
  Menu,
  Home,
  Upload,
  List,
  Bookmark,
  User,
  HelpCircle,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "submissions", label: "My Research", icon: FileText, href: "/dashboard?tab=submissions" },
    { id: "submit", label: "Submit Article", icon: Upload, href: "/submit" },
    { id: "reviews", label: "My Reviews", icon: Eye, href: "/dashboard?tab=reviews" },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, href: "/dashboard?tab=bookmarks" },
    { id: "profile", label: "Profile", icon: User, href: "/dashboard?tab=profile" },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Left Sidebar */}
      <div className={`
        ${sidebarOpen ? (isMobile ? 'w-64' : 'w-64') : 'w-16'} 
        ${isMobile ? 'fixed left-0 top-0 h-full z-50' : 'relative'} 
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-all duration-300 bg-white border-r border-slate-200 flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">AMHSJ</h1>
                  <p className="text-xs text-slate-500">Research Portal</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 h-8 w-8"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={(session?.user as any)?.image || ""} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {session?.user?.name || "Researcher"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = item.href === pathname || 
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.href === "/submit" && pathname === "/submit")
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/help')}
            className="w-full justify-start"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {sidebarOpen && "Help & Support"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && "Sign Out"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="p-1 h-8 w-8 md:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {pathname === "/submit" ? "Submit Research Article" : "Dashboard"}
                </h1>
                <p className="text-sm text-slate-600">
                  {pathname === "/submit" 
                    ? "Submit your research for peer review and publication" 
                    : "Welcome back to your research portal"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
