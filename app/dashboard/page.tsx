"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import AuthorLayout from "@/components/layouts/author-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Filter,
  SortDesc,
  Calendar as CalendarIcon,
  Award,
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
  acceptanceRate?: number;
  citationImpact?: number;
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'review' | 'publication' | 'message' | 'revision';
  title: string;
  description: string;
  timestamp: string;
  submissionId?: string;
}

interface PerformanceInsight {
  id: string;
  label: string;
  value: string | number;
  progress: number;
  trend: 'up' | 'down' | 'neutral';
  color: 'indigo' | 'green' | 'purple' | 'blue';
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
    technical_check: {
      label: "Technical Check",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: <Eye className="h-3 w-3" />,
      description: "Under technical and editorial assessment"
    },
    under_review: {
      label: "Under Review",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Users className="h-3 w-3" />,
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Debug logging for session changes
  useEffect(() => {
    if (session) {
      console.log("Dashboard session updated:", {
        name: session.user?.name,
        email: session.user?.email,
        role: session.user?.role,
        timestamp: new Date().toISOString()
      })
    }
  }, [session])

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
  
  // Get the active tab from URL parameters, default to "overview"
  const activeTab = searchParams.get('tab') || 'overview'
  const activeFilter = searchParams.get('filter') || 'all'
  
  // Handle tab changes by updating URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'overview') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '/dashboard'
    router.push(newUrl)
  }
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([])

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

  // Editor section state
  const [userSection, setUserSection] = useState<string>("General")
  const [availableSections, setAvailableSections] = useState<string[]>(["General"])
  const [isEditor, setIsEditor] = useState(false)

  useEffect(() => {
    const allowedRoles = ["section-editor", "managing-editor", "editor-in-chief", "admin"]
    const userIsEditor = allowedRoles.includes(session?.user?.role || "")
    setIsEditor(userIsEditor)

    if (!session?.user?.id || fetching) return

    fetchDashboardData()
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setFetching(true)
      
      // First get user profile to determine section
      if (isEditor) {
        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.success) {
            setUserSection(profileData.profile.primarySection)
            setAvailableSections(profileData.profile.availableSections)
          }
        }
      }

      // Determine which APIs to call based on user role
      const apiCalls = isEditor 
        ? await fetchEditorDashboardData()
        : await fetchAuthorDashboardData()

      // Process the API responses
      await processApiResponses(apiCalls)
        
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

  const fetchEditorDashboardData = async (section?: string) => {
    // For editors, fetch section-specific data
    const sectionToUse = section || userSection
    const encodedSection = encodeURIComponent(sectionToUse)
    
    return Promise.all([
      fetch(`/api/sections/${encodedSection}/stats`),
      fetch(`/api/sections/${encodedSection}/submissions?limit=20`),
      fetch(`/api/user/profile`).catch(() => null),
      fetch(`/api/users/${session?.user?.id}/insights`).catch(() => null),
    ])
  }

  const fetchAuthorDashboardData = async () => {
    // For authors, fetch personal data
    return Promise.all([
      fetch(`/api/users/${session?.user?.id}/stats`),
      fetch(`/api/users/${session?.user?.id}/submissions`),
      fetch(`/api/users/${session?.user?.id}/activities`).catch(() => null),
      fetch(`/api/users/${session?.user?.id}/insights`).catch(() => null),
    ])
  }

  const processApiResponses = async ([statsRes, submissionsRes, activitiesRes, insightsRes]: (Response | null)[]) => {
    // Handle API errors with modern error handling
    if (!statsRes || !statsRes.ok) {
      if (statsRes) {
        handleApiError(statsRes, { 
          component: 'dashboard', 
          action: 'fetch_stats' 
        })
      }
      return
    }

    if (!submissionsRes || !submissionsRes.ok) {
      if (submissionsRes) {
        handleApiError(submissionsRes, { 
          component: 'dashboard', 
          action: 'fetch_submissions' 
        })
      }
      return
    }

    const statsData = await statsRes.json()
    const submissionsData = await submissionsRes.json()
    const activitiesData = activitiesRes && activitiesRes.ok ? await activitiesRes.json() : { success: false }
    const insightsData = insightsRes && insightsRes.ok ? await insightsRes.json() : { success: false }

    if (statsData.success) {
      if (isEditor) {
        // Map section stats to dashboard stats format
        setStats({
          totalSubmissions: statsData.stats.totalSubmissions,
          medicalSubmissions: Math.floor(statsData.stats.totalSubmissions * 0.7), // Estimate
          underReview: statsData.stats.technicalCheck + statsData.stats.underReview,
          published: statsData.stats.published,
          totalDownloads: 0, // Not available in section stats
          pendingActions: statsData.stats.pendingActions,
          averageReviewTime: statsData.stats.averageReviewTime,
        })
      } else {
        // Author stats
        setStats({
          ...statsData.stats,
          pendingActions: 0,
          averageReviewTime: 0,
        })
      }
    } else {
      // Keep default empty state
      setStats({
        totalSubmissions: 0,
        medicalSubmissions: 0,
        underReview: 0,
        published: 0,
        totalDownloads: 0,
        pendingActions: 0,
        averageReviewTime: 0,
      })
    }

    if (submissionsData.success) {
      // Enhance submissions with UX data
      const enhancedSubmissions = submissionsData.submissions.map((sub: any) => ({
        ...sub,
        progress: getSubmissionProgress(sub.status),
        priority: getSubmissionPriority(sub.status, sub.submittedDate),
        actionRequired: sub.status === "revision_requested" || sub.status === "technical_check",
      }))
      setSubmissions(enhancedSubmissions)
    } else {
      setSubmissions([])
    }

    // Handle recent activities
    if (activitiesData.success && activitiesData.activities) {
      setRecentActivities(activitiesData.activities)
    } else {
      // Generate activities from submissions if no activities API
      setRecentActivities(generateActivitiesFromSubmissions(submissionsData.submissions || []))
    }

    // Handle performance insights
    if (insightsData.success && insightsData.insights) {
      setPerformanceInsights(insightsData.insights)
    } else {
      setPerformanceInsights([])
    }
  }

  const getSubmissionProgress = (status: string): number => {
    switch (status) {
      case "submitted": return 25;
      case "technical_check": return 40;
      case "under_review": return 60;
      case "revision_requested": return 75;
      case "accepted": return 100;
      case "published": return 100;
      default: return 0;
    }
  }

  const getSubmissionPriority = (status: string, submittedDate: string): "high" | "medium" | "low" => {
    const daysSinceSubmission = Math.floor((Date.now() - new Date(submittedDate).getTime()) / (1000 * 60 * 60 * 24))
    
    if (status === "revision_requested") return "high"
    if (status === "technical_check" && daysSinceSubmission > 30) return "high"
    if (status === "under_review" && daysSinceSubmission > 60) return "high"
    if (daysSinceSubmission > 30) return "medium"
    return "low"
  }

  const generateActivitiesFromSubmissions = (submissions: any[]): RecentActivity[] => {
    if (!submissions || submissions.length === 0) return []
    
    const activities: RecentActivity[] = []
    
    submissions.slice(0, 4).forEach((submission, index) => {
      const timeAgo = [
        "2 hours ago",
        "1 day ago", 
        "3 days ago",
        "5 days ago"
      ][index] || "1 week ago"
      
      let activityType: RecentActivity['type'] = 'submission'
      let description = ''
      
      switch (submission.status) {
        case 'submitted':
          activityType = 'submission'
          description = `New submission: "${submission.title}"`
          break
        case 'technical_check':
          activityType = 'review'
          description = `Technical check in progress for "${submission.title}"`
          break
        case 'under_review':
          activityType = 'review'
          description = `Under peer review: "${submission.title}"`
          break
        case 'published':
          activityType = 'publication'
          description = `Article published: "${submission.title}"`
          break
        case 'revision_requested':
          activityType = 'revision'
          description = `Revision requested for "${submission.title}"`
          break
        default:
          description = `Update on "${submission.title}"`
      }
      
      activities.push({
        id: `activity-${submission.id}`,
        type: activityType,
        title: submission.title,
        description,
        timestamp: timeAgo,
        submissionId: submission.id
      })
    })
    
    return activities
  }

  const generateInsightsFromStats = (statsData: DashboardStats): PerformanceInsight[] => {
    const insights: PerformanceInsight[] = [
      {
        id: 'review-time',
        label: 'Average Review Time',
        value: `${statsData.averageReviewTime || 45} days`,
        progress: Math.min(100, Math.max(0, 100 - (statsData.averageReviewTime || 45))),
        trend: 'neutral',
        color: 'indigo'
      },
      {
        id: 'acceptance-rate',
        label: 'Acceptance Rate',
        value: `${statsData.acceptanceRate || 85}%`,
        progress: statsData.acceptanceRate || 85,
        trend: 'up',
        color: 'green'
      },
      {
        id: 'citation-impact',
        label: 'Citation Impact',
        value: statsData.citationImpact || 8.2,
        progress: Math.min(100, (statsData.citationImpact || 8.2) * 10),
        trend: 'up',
        color: 'purple'
      }
    ]
    
    return insights
  }

  const renderSubmissionsView = () => {
    // Filter submissions based on URL parameter
    const filteredSubmissions = submissions.filter(submission => {
      if (activeFilter === 'revisions') {
        return submission.status === 'revision_requested'
      }
      if (activeFilter === 'published') {
        return submission.status === 'published' || submission.status === 'accepted'
      }
      return true // 'all' or no filter
    })

    const handleFilterChange = (filter: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (filter === 'All') {
        params.delete('filter')
      } else {
        const filterMap: { [key: string]: string } = {
          'Technical Check': 'technical_check',
          'Under Review': 'under_review',
          'Published': 'published', 
          'Revision Needed': 'revisions'
        }
        params.set('filter', filterMap[filter] || filter.toLowerCase())
      }
      router.push(`?${params.toString()}`)
    }

    return (
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            {["All", "Technical Check", "Under Review", "Published", "Revision Needed"].map((filter) => {
              const isActive = (filter === 'All' && activeFilter === 'all') ||
                             (filter === 'Technical Check' && activeFilter === 'technical_check') ||
                             (filter === 'Under Review' && activeFilter === 'under_review') ||
                             (filter === 'Published' && activeFilter === 'published') ||
                             (filter === 'Revision Needed' && activeFilter === 'revisions')
              
              return (
                <Button 
                  key={filter} 
                  variant={isActive ? "default" : "outline"} 
                  size="sm" 
                  className="h-8"
                  onClick={() => handleFilterChange(filter)}
                >
                  {filter}
                </Button>
              )
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">Sort by date</span>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
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
            filteredSubmissions.map((submission) => {
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

  const renderReviewsView = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {submissions.filter(s => s.status === "technical_check" || s.status === "under_review" || s.status === "revision_requested").map((submission) => {
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

  const renderMessagesView = () => {
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

  const renderAnalyticsView = () => {
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



  // Section change handler for editors
  const handleSectionChange = async (newSection: string) => {
    setUserSection(newSection)
    setLoading(true)
    setFetching(true)
    
    try {
      // Fetch data for the new section
      const [statsRes, submissionsRes] = await fetchEditorDashboardData(newSection)
      await processApiResponses([statsRes, submissionsRes, null, null])
    } catch (error) {
      handleError(error, { 
        component: 'dashboard', 
        action: 'section_change',
        metadata: { section: newSection }
      })
    } finally {
      setLoading(false)
      setFetching(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["author", "reviewer", "editor", "admin"]}>
      <AuthorLayout>
        {/* Section Selector for Editors */}
        {isEditor && availableSections.length > 1 && (
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Editorial Dashboard</h2>
                    <p className="text-sm text-slate-600">Manage submissions in your assigned sections</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Section:</span>
                    </div>
                    <Select value={userSection} onValueChange={handleSectionChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections.map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Section Badge for Single Section Editors */}
        {isEditor && availableSections.length === 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Managing Section:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userSection}
              </Badge>
            </div>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <Card className="border-l-4 border-l-red-500 bg-red-50/30 mb-8">
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">My Research</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'submission': return FileText
                          case 'review': return Eye
                          case 'publication': return BookOpen
                          case 'message': return MessageSquare
                          case 'revision': return Edit
                          default: return FileText
                        }
                      }

                      const getActivityColor = (type: string) => {
                        switch (type) {
                          case 'submission': return 'blue'
                          case 'review': return 'amber'
                          case 'publication': return 'purple'
                          case 'message': return 'green'
                          case 'revision': return 'orange'
                          default: return 'blue'
                        }
                      }

                      const Icon = getActivityIcon(activity.type)
                      const colorType = getActivityColor(activity.type)
                      const colorClasses = {
                        blue: "bg-blue-50 border-blue-200 text-blue-600",
                        green: "bg-green-50 border-green-200 text-green-600",
                        purple: "bg-purple-50 border-purple-200 text-purple-600",
                        amber: "bg-amber-50 border-amber-200 text-amber-600",
                        orange: "bg-orange-50 border-orange-200 text-orange-600"
                      }

                      return (
                        <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[colorType as keyof typeof colorClasses]}`}>
                          <div className="p-2 bg-white rounded-full">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                            <p className="text-xs text-slate-600">{activity.timestamp}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500">No recent activity</p>
                    </div>
                  )}
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
                    {performanceInsights.length > 0 ? (
                      performanceInsights.map((insight) => (
                        <div key={insight.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">{insight.label}</span>
                            <span className="text-sm font-bold text-slate-900">{insight.value}</span>
                          </div>
                          <Progress value={insight.progress} className="h-2" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500">No performance data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            {renderSubmissionsView()}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {renderReviewsView()}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            {renderMessagesView()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderAnalyticsView()}
          </TabsContent>
        </Tabs>
      </AuthorLayout>
    </RouteGuard>
  )
}
