"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Eye,
  Download,
  Star
} from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  totalArticles: number
  totalReviews: number
  publishedThisMonth: number
  iotPercentage: number
  topCategories: string[]
  monthlySubmissions: number[]
}

interface UserAnalytics {
  articles: {
    total: number
    underReview: number
    published: number
  }
  totalDownloads: number
  totalViews: number
  monthlyViews: number[]
  reviewMetrics: {
    completed: number
    averageRating: number
    averageTimedays: number
  }
}

interface AnalyticsDashboardProps {
  type: 'admin' | 'user'
  userId?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AnalyticsDashboard({ type, userId }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (type === 'admin') {
          const response = await fetch('/api/analytics/journal-stats')
          const data = await response.json()
          if (data.success) {
            setAnalyticsData(data.stats)
          }
        } else if (type === 'user' && userId) {
          const response = await fetch(`/api/analytics/user-stats?userId=${userId}`)
          const data = await response.json()
          if (data.success) {
            setUserAnalytics(data.analytics)
          }
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [type, userId])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (type === 'admin' && analyticsData) {
    const monthlyData = analyticsData.monthlySubmissions.map((submissions, index) => ({
      month: new Date(0, index).toLocaleString('default', { month: 'short' }),
      submissions
    }))

    const categoryData = analyticsData.topCategories.map((category, index) => ({
      name: category.length > 20 ? category.substring(0, 20) + '...' : category,
      value: Math.floor(Math.random() * 50) + 10, // Placeholder values
      color: COLORS[index % COLORS.length]
    }))

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                All submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                Completed reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.publishedThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                New publications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Submissions</CardTitle>
              <CardDescription>Article submissions over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submissions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>Most popular article categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Technology Focus */}
        <Card>
          <CardHeader>
            <CardTitle>Technology & Innovation Focus</CardTitle>
            <CardDescription>Percentage of health tech and biomedical research</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Progress value={analyticsData.iotPercentage} className="flex-1" />
              <Badge variant="secondary">{analyticsData.iotPercentage}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Healthcare Technology & Biomedical Sciences articles
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === 'user' && userAnalytics) {
    const monthlyViewsData = userAnalytics.monthlyViews.map((views, index) => ({
      month: new Date(0, index).toLocaleString('default', { month: 'short' }),
      views
    }))

    return (
      <div className="space-y-6">
        {/* User Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.articles.total}</div>
              <p className="text-xs text-muted-foreground">
                All submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.articles.published}</div>
              <p className="text-xs text-muted-foreground">
                Published articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Article views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">
                Total downloads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Views</CardTitle>
              <CardDescription>Your article views over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Performance</CardTitle>
              <CardDescription>Your reviewing statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Reviews Completed</span>
                <Badge variant="outline">{userAnalytics.reviewMetrics.completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {userAnalytics.reviewMetrics.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Review Time</span>
                <Badge variant="secondary">
                  {userAnalytics.reviewMetrics.averageTimedays.toFixed(1)} days
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Article Status */}
        <Card>
          <CardHeader>
            <CardTitle>Article Status Overview</CardTitle>
            <CardDescription>Current status of your submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userAnalytics.articles.underReview}</div>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userAnalytics.articles.published}</div>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {userAnalytics.articles.total - userAnalytics.articles.underReview - userAnalytics.articles.published}
                </div>
                <p className="text-sm text-muted-foreground">Draft/Other</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <div>No data available</div>
}
