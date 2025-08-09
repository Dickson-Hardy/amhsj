"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

interface DashboardStats {
  totalSubmissions: number;
  medicalSubmissions: number;
  underReview: number;
  published: number;
  totalDownloads: number;
  pendingActions: number;
  averageReviewTime: number;
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
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!session?.user?.id) return

      try {
        setLoading(true)
        
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
          
          // Show success toast for first-time users
          if (statsData.stats.totalSubmissions === 0) {
            toast.info("Welcome to your dashboard! Start by submitting your first research article.")
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
          userId: session.user.id 
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

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

  const quickActions = [
    {
      title: "Submit New Article",
      description: "Start a new submission",
      icon: <Plus className="h-5 w-5" />,
      href: "/submit",
      primary: true,
    },
    {
      title: "View Messages",
      description: `${stats.pendingActions} pending`,
      icon: <MessageSquare className="h-5 w-5" />,
      href: "#messages",
      badge: stats.pendingActions > 0 ? stats.pendingActions : undefined,
    },
    {
      title: "Track Progress",
      description: "Monitor all submissions",
      icon: <Activity className="h-5 w-5" />,
      href: "#submissions",
    },
  ]

  if (loading) {
    return (
      <RouteGuard>
        <SectionLoading text="Loading your dashboard..." className="min-h-screen" />
      </RouteGuard>
    )
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="container mx-auto px-4 py-6 max-w-7xl">'
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {session?.user?.name || "Researcher"}! 👋
                </h1>
                <p className="text-gray-600">
                  Ready to advance medical science? Here's your research overview.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {stats.pendingActions > 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <Bell className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      {stats.pendingActions} actions require your attention
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  action.primary ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0' : 'hover:border-indigo-200'
                }`}
                onClick={() => action.href.startsWith('#') ? document.querySelector(action.href)?.scrollIntoView({ behavior: 'smooth' }) : router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.primary ? 'bg-white/20' : 'bg-indigo-50'}`}>
                        <div className={action.primary ? 'text-white' : 'text-indigo-600'}>
                          {action.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${action.primary ? 'text-white' : 'text-gray-900'}`}>
                          {action.title}
                        </h3>
                        <p className={`text-sm ${action.primary ? 'text-white/80' : 'text-gray-600'}`}>
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.badge && (
                        <Badge className="bg-red-500 text-white">{action.badge}</Badge>
                      )}
                      <ChevronRight className={`h-4 w-4 ${action.primary ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">Total</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</h3>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-xs text-blue-600">+2 this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Heart className="h-5 w-5 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Medical</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.medicalSubmissions}</h3>
                <p className="text-sm text-gray-600">Medical Research</p>
                <p className="text-xs text-emerald-600">
                  {Math.round((stats.medicalSubmissions / stats.totalSubmissions) * 100)}% of total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <Badge className="bg-amber-100 text-amber-800">Active</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.underReview}</h3>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-xs text-amber-600">Avg. {stats.averageReviewTime} days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-800">Live</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stats.published}</h3>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-xs text-purple-600">{stats.totalDownloads.toLocaleString()} downloads</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200 rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Overview</TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">My Research</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Reviews</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Messages</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Action Required Section */}
            {submissions.filter(s => s.actionRequired).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  Action Required
                </h2>
                <div className="space-y-3">
                  {submissions.filter(s => s.actionRequired).map((submission) => {
                    const statusConfig = getStatusConfig(submission.status)
                    return (
                      <Card key={submission.id} className="border-l-4 border-l-red-500 bg-red-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{submission.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
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
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New submission received</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Review completed for "IoT in Healthcare"</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Article published in AMHSJ</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Quick Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Average Review Time</span>
                    <Badge className="bg-indigo-100 text-indigo-800">{stats.averageReviewTime} days</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <span className="text-sm font-medium">Acceptance Rate</span>
                    <Badge className="bg-green-100 text-green-800">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <span className="text-sm font-medium">Impact Score</span>
                    <Badge className="bg-purple-100 text-purple-800">8.2</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6" id="submissions">'
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Research Submissions</h2>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => router.push('/submit')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit New Research
              </Button>
            </div>

            <div className="space-y-4">
              {submissions.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-gray-400 mb-4">
                      <FileText className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-gray-600 mb-4">Start by submitting your first research article to AMHSJ.</p>
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
                    <Card key={submission.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {submission.title}
                              </h3>
                              {submission.actionRequired && (
                                <Badge className="bg-red-100 text-red-800 animate-pulse">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <Badge variant="secondary" className="bg-gray-100">
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
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-600">{submission.progress}%</span>
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
                          <div className="text-sm text-gray-500">
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
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Status & Feedback</h2>
            
            <div className="space-y-4">
              {submissions.filter(s => s.status === "under_review" || s.status === "revision_requested").map((submission) => {
                const statusConfig = getStatusConfig(submission.status)
                return (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 mb-2">{submission.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
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
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">Editor Decision</span>
                            <Clock className="h-4 w-4 text-gray-600" />
                          </div>
                          <p className="text-sm text-gray-700">Pending reviews</p>
                          <p className="text-xs text-gray-600 mt-1">Expected in 2 weeks</p>
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
          </TabsContent>

          <TabsContent value="messages" className="space-y-6" id="messages">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Communication Center</h2>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </div>
            <CommunicationCenter />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Research Impact & Analytics</h2>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-gray-600">AMHSJ Impact Metrics</span>
              </div>
            </div>

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
                    <span className="text-gray-700">Total Downloads</span>
                    <div className="text-right">
                      <div className="font-bold text-2xl text-green-600">
                        {stats.totalDownloads.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-500">+12% this month</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Average Citations</span>
                    <div className="text-right">
                      <div className="font-bold text-xl text-blue-600">12.4</div>
                      <div className="text-xs text-blue-500">per article</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">H-Index</span>
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
                    <span className="text-gray-700">Medical Papers</span>
                    <div className="text-right">
                      <div className="font-bold text-2xl text-indigo-600">{stats.medicalSubmissions}</div>
                      <div className="text-xs text-indigo-500">published</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Healthcare Focus</span>
                    <div className="text-right">
                      <div className="font-bold text-xl text-purple-600">
                        {Math.round((stats.medicalSubmissions / stats.totalSubmissions) * 100)}%
                      </div>
                      <div className="text-xs text-purple-500">of your research</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Impact Ranking</span>
                    <div className="text-right">
                      <div className="font-bold text-xl text-green-600">#12</div>
                      <div className="text-xs text-green-500">in medical research</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Downloads Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Download Trends</CardTitle>
                <CardDescription>Track how your research is being accessed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive charts will be displayed here</p>
                    <p className="text-sm">Download trends, citation growth, and impact metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </RouteGuard>
  )
}
