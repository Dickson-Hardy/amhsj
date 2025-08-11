"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import CommunicationCenter from "@/components/communication-center"
import { SectionLoading } from "@/components/modern-loading"
import { handleError, handleApiError } from "@/lib/modern-error-handler"
import { toast } from "@/hooks/use-toast"
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
  ArrowRight,
  Edit,
  Download,
  Star,
  Activity,
  Heart,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Home,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  PieChart,
  Mail,
  HelpCircle,
  Bookmark,
  Filter,
  SortDesc,
  Calendar as CalendarIcon,
  Zap,
  Award,
  Globe,
  Target,
} from "lucide-react"

interface Submission {
  id: string;
  title: string;
  category: string;
  submittedDate: string;
  reviewers: number;
  comments: number;
  status: string;
  lastUpdate: string;
  progress?: number;
  priority?: "high" | "medium" | "low";
  actionRequired?: boolean;
}

interface DashboardStats {
  totalSubmissions: number;
  medicalSubmissions: number;
  underReview: number;
  published: number;
  totalDownloads: number;
  pendingActions: number;
  averageReviewTime: number;
}

// Helper functions for status styling and formatting
const getStatusConfig = (status: string) => {
  const configs = {
    submitted: {
      label: "Submitted",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <Clock className="h-3 w-3" />,
      description: "Under initial review by editorial team"
    },
    under_review: {
      label: "Under Review",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Eye className="h-3 w-3" />,
      description: "Being evaluated by peer reviewers"
    },
    revision_requested: {
      label: "Revision Requested",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: <Edit className="h-3 w-3" />,
      description: "Action required: Please address reviewer comments"
    },
    accepted: {
      label: "Accepted",
      color: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle className="h-3 w-3" />,
      description: "Congratulations! Your paper has been accepted"
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="h-3 w-3" />,
      description: "Unfortunately, your submission was not accepted"
    }
  }
  return configs[status as keyof typeof configs] || configs.submitted
}

const getPriorityColor = (priority: string) => {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300"
  }
  return colors[priority as keyof typeof colors] || colors.medium
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    medicalSubmissions: 0,
    underReview: 0,
    published: 0,
    totalDownloads: 0,
    pendingActions: 0,
    averageReviewTime: 0,
  })
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home, badge: null },
    { id: "submissions", label: "My Research", icon: FileText, badge: stats.totalSubmissions },
    { id: "reviews", label: "Reviews", icon: Eye, badge: stats.underReview },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: stats.pendingActions },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
    { id: "calendar", label: "Calendar", icon: CalendarIcon, badge: null },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, badge: null },
  ]

  // Quick stats for the top cards
  const quickStats = [
    {
      title: "Total Research",
      value: stats.totalSubmissions,
      change: "+2 this month",
      icon: FileText,
      color: "blue",
      trend: "up"
    },
    {
      title: "Under Review",
      value: stats.underReview,
      change: `${stats.averageReviewTime} days avg`,
      icon: Clock,
      color: "amber",
      trend: "neutral"
    },
    {
      title: "Published",
      value: stats.published,
      change: "+1 this month",
      icon: CheckCircle,
      color: "green",
      trend: "up"
    },
    {
      title: "Impact Score",
      value: "8.2",
      change: "+0.3 this year",
      icon: Award,
      color: "purple",
      trend: "up"
    }
  ]

  useEffect(() => {
    async function fetchDashboardData() {
      if (!session?.user?.id || fetching) return

      try {
        setLoading(true)
        setFetching(true)
        
        const [statsRes, submissionsRes] = await Promise.all([
          fetch(`/api/users/${session.user.id}/stats`),
          fetch(`/api/users/${session.user.id}/submissions`),
        ])

        // Handle API errors with modern error handling
        if (!statsRes.ok) {
          handleApiError(statsRes, { 
            component: 'dashboard', 
            action: 'fetch_stats' 
          })
          return
        }

        if (!submissionsRes.ok) {
          handleApiError(submissionsRes, { 
            component: 'dashboard', 
            action: 'fetch_submissions' 
          })
          return
        }

        const statsData = await statsRes.json()
        const submissionsData = await submissionsRes.json()

        if (statsData.success) {
          setStats({
            ...statsData.stats,
            pendingActions: 2,
            averageReviewTime: 45,
          })
          
          // Show success toast for first-time users only once
          if (statsData.stats.totalSubmissions === 0 && !localStorage.getItem('welcomeShown')) {
            toast.info("Welcome to your dashboard! Start by submitting your first research article.")
            localStorage.setItem('welcomeShown', 'true')
          }
        }

        if (submissionsData.success) {
          // Enhance submissions with UX data
          const enhancedSubmissions = submissionsData.submissions.map((sub: any) => ({
            ...sub,
            progress: getSubmissionProgress(sub.status),
            priority: getSubmissionPriority(sub.status, sub.submittedDate),
            actionRequired: sub.status === "revision_requested" || sub.status === "awaiting_response",
          }))
          setSubmissions(enhancedSubmissions)
        }
        
      } catch (error) {
        handleError(error, { 
          component: 'dashboard', 
          action: 'fetch_dashboard_data',
          userId: session?.user?.id || 'unknown'
        })
      } finally {
        setLoading(false)
        setFetching(false)
      }
    }

    fetchDashboardData()
  }, [session?.user?.id])

  const getSubmissionProgress = (status: string): number => {
    switch (status) {
      case "submitted": return 25;
      case "under_review": return 50;
      case "revision_requested": return 75;
      case "accepted": return 100;
      case "published": return 100;
      default: return 0;
    }
  }

  const getSubmissionPriority = (status: string, submittedDate: string): "high" | "medium" | "low" => {
    const daysSinceSubmission = Math.floor((Date.now() - new Date(submittedDate).getTime()) / (1000 * 60 * 60 * 24))
    
    if (status === "revision_requested") return "high"
    if (status === "under_review" && daysSinceSubmission > 60) return "high"
    if (daysSinceSubmission > 30) return "medium"
    return "low"
  }

  if (loading) {
    return (
      <RouteGuard>
        <SectionLoading text="Loading your dashboard..." className="min-h-screen" />
      </RouteGuard>
    )
  }

  return (
    <RouteGuard>
      <div className="flex h-screen bg-slate-50">
        {/* Fixed Left Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col`}>
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
                <AvatarImage src={session?.user?.image || ""} />
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
                    {session?.user?.email || "researcher@amhsj.org"}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && stats.pendingActions > 0 && (
              <Alert className="mt-3 border-amber-200 bg-amber-50">
                <Bell className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-xs">
                  {stats.pendingActions} actions need attention
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className={`${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-slate-200 space-y-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Settings className="h-5 w-5 text-slate-400" />
              {sidebarOpen && <span className="font-medium">Settings</span>}
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <HelpCircle className="h-5 w-5 text-slate-400" />
              {sidebarOpen && <span className="font-medium">Help</span>}
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5 text-red-400" />
              {sidebarOpen && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {sidebarItems.find(item => item.id === activeView)?.label || "Dashboard"}
                </h1>
                <p className="text-slate-500 mt-1">
                  {activeView === "overview" && "Welcome back! Here's your research overview."}
                  {activeView === "submissions" && "Manage and track your research submissions."}
                  {activeView === "reviews" && "Review status and peer feedback."}
                  {activeView === "messages" && "Communication center and notifications."}
                  {activeView === "analytics" && "Research impact and analytics."}
                  {activeView === "calendar" && "Important dates and deadlines."}
                  {activeView === "bookmarks" && "Your saved articles and references."}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-64 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  onClick={() => router.push('/submit')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Submission
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </RouteGuard>
  )

  // Render different views based on active selection
  function renderActiveView() {
    switch (activeView) {
      case "overview":
        return renderOverviewView()
      case "submissions":
        return renderSubmissionsView()
      case "reviews":
        return renderReviewsView()
      case "messages":
        return renderMessagesView()
      case "analytics":
        return renderAnalyticsView()
      case "calendar":
        return renderCalendarView()
      case "bookmarks":
        return renderBookmarksView()
      default:
        return renderOverviewView()
    }
  }

  function renderOverviewView() {
    return (
      <div className="space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: "from-blue-50 to-indigo-50 border-blue-200 text-blue-600",
              amber: "from-amber-50 to-yellow-50 border-amber-200 text-amber-600",
              green: "from-green-50 to-emerald-50 border-green-200 text-green-600",
              purple: "from-purple-50 to-violet-50 border-purple-200 text-purple-600"
            }
            return (
              <Card key={index} className={`bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} border-2`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-white/50 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'amber' ? 'text-amber-600' : stat.color === 'green' ? 'text-green-600' : 'text-purple-600'}`} />
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {stat.trend === 'up' ? '↗️' : '→'} {stat.change}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-slate-700">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action Required Section */}
        {submissions.filter(s => s.actionRequired).length > 0 && (
          <Card className="border-l-4 border-l-red-500 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                Actions Required ({submissions.filter(s => s.actionRequired).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.filter(s => s.actionRequired).slice(0, 3).map((submission) => {
                const statusConfig = getStatusConfig(submission.status)
                return (
                  <div key={submission.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">{submission.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Badge className={statusConfig.color} variant="outline">
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                        <span>{statusConfig.description}</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Take Action
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: FileText, text: "New submission received", time: "2 hours ago", color: "blue" },
                { icon: CheckCircle, text: "Review completed for 'IoT in Healthcare'", time: "1 day ago", color: "green" },
                { icon: BookOpen, text: "Article published in AMHSJ", time: "3 days ago", color: "purple" },
                { icon: MessageSquare, text: "Message from editor", time: "5 days ago", color: "amber" }
              ].map((activity, index) => {
                const Icon = activity.icon
                const colorClasses = {
                  blue: "bg-blue-50 border-blue-200 text-blue-600",
                  green: "bg-green-50 border-green-200 text-green-600",
                  purple: "bg-purple-50 border-purple-200 text-purple-600",
                  amber: "bg-amber-50 border-amber-200 text-amber-600"
                }
                return (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                    <div className="p-2 bg-white rounded-full">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                      <p className="text-xs text-slate-600">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: "Average Review Time", value: `${stats.averageReviewTime} days`, progress: 75, color: "indigo" },
                  { label: "Acceptance Rate", value: "85%", progress: 85, color: "green" },
                  { label: "Citation Impact", value: "8.2", progress: 82, color: "purple" },
                ].map((insight, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{insight.label}</span>
                      <span className="text-sm font-bold text-slate-900">{insight.value}</span>
                    </div>
                    <Progress value={insight.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  function renderSubmissionsView() {
    return (
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            {["All", "Under Review", "Published", "Revision Needed"].map((filter) => (
              <Button key={filter} variant="outline" size="sm" className="h-8">
                {filter}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">Sort by date</span>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-slate-400 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No submissions yet</h3>
                <p className="text-slate-600 mb-4">Start by submitting your first research article to AMHSJ.</p>
                <Button 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                  onClick={() => router.push('/submit')}
                >
                  Submit Your First Article
                </Button>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => {
              const statusConfig = getStatusConfig(submission.status)
              return (
                <Card key={submission.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {submission.title}
                          </h3>
                          {submission.actionRequired && (
                            <Badge className="bg-red-100 text-red-800 animate-pulse">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <Badge variant="secondary" className="bg-slate-100">
                            {submission.category}
                          </Badge>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(submission.submittedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {submission.reviewers} reviewers
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Progress</span>
                            <span className="text-sm text-slate-600">{submission.progress}%</span>
                          </div>
                          <Progress value={submission.progress} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={statusConfig.color} variant="outline">
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                        {submission.priority && (
                          <Badge className={getPriorityColor(submission.priority)} variant="outline">
                            {submission.priority} priority
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        Last updated: {new Date(submission.lastUpdate).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="hover:bg-indigo-50">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-blue-50">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Messages
                          {submission.comments > 0 && (
                            <Badge className="ml-1 bg-blue-500 text-white text-xs">
                              {submission.comments}
                            </Badge>
                          )}
                        </Button>
                        {submission.status === "revision_requested" && (
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Edit className="h-4 w-4 mr-1" />
                            Submit Revision
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  function renderReviewsView() {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {submissions.filter(s => s.status === "under_review" || s.status === "revision_requested").map((submission) => {
            const statusConfig = getStatusConfig(submission.status)
            return (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-slate-900 mb-2">{submission.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                        <span>{statusConfig.description}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">Reviewer 1</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700">Review completed</p>
                      <p className="text-xs text-green-600 mt-1">Score: 8.5/10</p>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-800">Reviewer 2</span>
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-sm text-amber-700">In progress</p>
                      <p className="text-xs text-amber-600 mt-1">Due in 5 days</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">Editor Decision</span>
                        <Clock className="h-4 w-4 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-700">Pending reviews</p>
                      <p className="text-xs text-slate-600 mt-1">Expected in 2 weeks</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      View Detailed Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  function renderMessagesView() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">Communication Center</h2>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Compose Message
          </Button>
        </div>
        <CommunicationCenter />
      </div>
    )
  }

  function renderAnalyticsView() {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-green-800">
                <TrendingUp className="h-5 w-5 mr-2" />
                Publication Impact
              </CardTitle>
              <CardDescription>Your research reach and influence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">Total Downloads</span>
                <div className="text-right">
                  <div className="font-bold text-2xl text-green-600">
                    {stats.totalDownloads.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-500">+12% this month</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">Average Citations</span>
                <div className="text-right">
                  <div className="font-bold text-xl text-blue-600">12.4</div>
                  <div className="text-xs text-blue-500">per article</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">H-Index</span>
                <div className="text-right">
                  <div className="font-bold text-xl text-purple-600">8</div>
                  <div className="text-xs text-purple-500">+1 this year</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-indigo-800">
                <Heart className="h-5 w-5 mr-2" />
                Medical Research Impact
              </CardTitle>
              <CardDescription>Your contribution to healthcare advancement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">Medical Papers</span>
                <div className="text-right">
                  <div className="font-bold text-2xl text-indigo-600">{stats.medicalSubmissions}</div>
                  <div className="text-xs text-indigo-500">published</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">Healthcare Focus</span>
                <div className="text-right">
                  <div className="font-bold text-xl text-purple-600">
                    {Math.round((stats.medicalSubmissions / stats.totalSubmissions) * 100)}%
                  </div>
                  <div className="text-xs text-purple-500">of your research</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <span className="text-slate-700">Impact Ranking</span>
                <div className="text-right">
                  <div className="font-bold text-xl text-green-600">#12</div>
                  <div className="text-xs text-green-500">in medical research</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Download Trends</CardTitle>
            <CardDescription>Track how your research is being accessed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive charts will be displayed here</p>
                <p className="text-sm">Download trends, citation growth, and impact metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderCalendarView() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Upcoming Deadlines & Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Review due for 'IoT in Healthcare'", date: "Aug 15, 2025", type: "deadline", urgent: true },
                { title: "AMHSJ Editorial Board Meeting", date: "Aug 20, 2025", type: "meeting", urgent: false },
                { title: "Special Issue Submission Deadline", date: "Sep 1, 2025", type: "deadline", urgent: false },
                { title: "Peer Review Training Session", date: "Sep 10, 2025", type: "training", urgent: false },
              ].map((event, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${event.urgent ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${event.urgent ? 'bg-red-100' : 'bg-indigo-100'}`}>
                      <CalendarIcon className={`h-4 w-4 ${event.urgent ? 'text-red-600' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{event.title}</h4>
                      <p className="text-sm text-slate-600">{event.date}</p>
                    </div>
                  </div>
                  <Badge className={event.urgent ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}>
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderBookmarksView() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-purple-600" />
              Saved Articles & References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No bookmarks yet</h3>
              <p className="text-slate-600">Save articles and references you want to revisit later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
