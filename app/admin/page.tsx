"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Article {
  id: string;
  title: string;
  author: string;
  category: string;
  status: string;
  submittedDate: string;
  views: number;
  // add any other fields you use
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  affiliation?: string;
  isVerified?: boolean;
  createdAt?: string;
  // add any other fields you use
}
import { useSession } from "next-auth/react"
import RouteGuard from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  FileText,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  BarChart3,
  Mail,
} from "lucide-react"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    pendingReviews: 0,
    publishedThisMonth: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  
  // New state for managing forms and dialogs
  const [emailSettings, setEmailSettings] = useState({
    submissionConfirmations: true,
    reviewAssignments: true,
    publicationNotifications: true,
  })
  const [advertisements, setAdvertisements] = useState([
    {
      id: '1',
      title: 'Medical Equipment Ad',
      position: 'sidebar-top',
      expiresIn: 25,
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '2',
      title: 'Sponsor Banner',
      position: 'sidebar-bottom',
      expiresIn: 55,
      imageUrl: '/api/placeholder/300/150'
    }
  ])
  const [reviewerApplications, setReviewerApplications] = useState([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      specialty: 'Cardiology',
      experience: '10-15 years',
      status: 'pending',
      submittedDate: '2025-01-05'
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      email: 'mchen@medical.center',
      specialty: 'Oncology',
      experience: '15-20 years',
      status: 'pending',
      submittedDate: '2025-01-03'
    }
  ])

  useEffect(() => {
    async function fetchAdminData() {
      if (session?.user?.role !== "admin") return

      try {
        const [statsRes, usersRes, articlesRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/articles"),
        ])

        const statsData = await statsRes.json()
        const usersData = await usersRes.json()
        const articlesData = await articlesRes.json()

        if (statsData.success) setStats(statsData.stats)
        if (usersData.success) setUsers(usersData.users)
        if (articlesData.success) setArticles(articlesData.articles)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [session])

  // Helper functions for admin actions
  const handleViewArticle = (articleId: string) => {
    router.push(`/article/${articleId}`)
  }

  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/articles/edit/${articleId}`)
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setArticles(articles.filter(article => article.id !== articleId))
        alert('Article deleted successfully!')
      } else {
        alert('Failed to delete article')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Error deleting article')
    }
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/edit/${userId}`)
  }

  const handleEmailUser = (userEmail: string) => {
    router.push(`/admin/email?to=${encodeURIComponent(userEmail)}`)
  }

  const handleViewAdvertisement = (adId: string) => {
    const ad = advertisements.find(a => a.id === adId)
    if (ad) {
      window.open(ad.imageUrl, '_blank')
    }
  }

  const handleEditAdvertisement = (adId: string) => {
    router.push(`/admin/advertisements/edit/${adId}`)
  }

  const handleCreateAdvertisement = () => {
    router.push('/admin/advertisements/create')
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/admin/upload-advertisement', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      if (response.ok) {
        alert('Advertisement uploaded successfully!')
        // Refresh advertisements list
        window.location.reload()
      } else {
        alert(result.message || 'Failed to upload advertisement')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewPeriod: 14,
          minimumReviewers: 2,
        }),
      })
      
      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    }
  }

  const handleToggleEmailSetting = async (setting: keyof typeof emailSettings) => {
    const newValue = !emailSettings[setting]
    
    try {
      const response = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [setting]: newValue,
        }),
      })
      
      if (response.ok) {
        setEmailSettings(prev => ({
          ...prev,
          [setting]: newValue,
        }))
        alert(`Email setting updated successfully!`)
      } else {
        alert('Failed to update email setting')
      }
    } catch (error) {
      console.error('Error updating email setting:', error)
      alert('Error updating email setting')
    }
  }

  const handleExportReport = () => {
    // Generate CSV report
    const reportData = articles.map(article => ({
      title: article.title,
      author: article.author,
      category: article.category,
      status: article.status,
      submittedDate: article.submittedDate,
      views: article.views,
    }))
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Author,Category,Status,Submitted Date,Views\n" +
      reportData.map(row => Object.values(row).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `journal_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reviewer Application Management
  const handleViewReviewerApplication = (applicationId: string) => {
    router.push(`/admin/reviewer-applications/${applicationId}`)
  }

  const handleApproveReviewer = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/reviewer-applications/${applicationId}/approve`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setReviewerApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: 'approved' }
              : app
          )
        )
        alert('Reviewer application approved successfully!')
      } else {
        alert('Failed to approve reviewer application')
      }
    } catch (error) {
      console.error('Error approving reviewer:', error)
      alert('Error approving reviewer application')
    }
  }

  const handleRejectReviewer = async (applicationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    
    try {
      const response = await fetch(`/api/admin/reviewer-applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })
      
      if (response.ok) {
        setReviewerApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: 'rejected' }
              : app
          )
        )
        alert('Reviewer application rejected.')
      } else {
        alert('Failed to reject reviewer application')
      }
    } catch (error) {
      console.error('Error rejecting reviewer:', error)
      alert('Error rejecting reviewer application')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "published":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "editor":
        return "bg-blue-100 text-blue-800"
      case "reviewer":
        return "bg-green-100 text-green-800"
      case "author":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">AMHSJ Admin Dashboard</h1>
              <p className="text-gray-600">System administration, user management, and journal operations</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">Administrator</Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">+47 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stats.totalArticles.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">+12 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stats.pendingReviews}</div>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stats.publishedThisMonth}</div>
              <p className="text-xs text-gray-500 mt-1">On track for target</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="reviewers">Reviewers</TabsTrigger>
            <TabsTrigger value="advertisements">Ads</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">System Overview</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    User Activity
                  </CardTitle>
                  <CardDescription>Recent user registrations and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Users (7 days)</span>
                    <span className="font-semibold text-2xl text-blue-600">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-semibold text-xl text-green-600">234</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Content Stats
                  </CardTitle>
                  <CardDescription>Publication and submission metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Submissions (30 days)</span>
                    <span className="font-semibold text-2xl text-green-600">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published Articles</span>
                    <span className="font-semibold text-xl text-purple-600">{stats.totalArticles}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    Reviewer Applications
                  </CardTitle>
                  <CardDescription>Pending reviewer applications requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Applications</span>
                    <span className="font-semibold text-2xl text-orange-600">
                      {reviewerApplications.filter(app => app.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-xl text-blue-600">{reviewerApplications.length}</span>
                  </div>
                  {reviewerApplications.filter(app => app.status === 'pending').length > 0 && (
                    <Button 
                      size="sm" 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => {
                        // Switch to reviewers tab
                        const reviewersTab = document.querySelector('[value="reviewers"]') as HTMLButtonElement
                        reviewersTab?.click()
                      }}
                    >
                      Review Applications
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Article Management</h2>
              <div className="flex gap-2">
                <Input placeholder="Search articles..." className="w-64" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate">{article.title}</div>
                      </TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{article.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(article.status)}>{article.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{new Date(article.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{article.views}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewArticle(article.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditArticle(article.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="reviewers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Reviewer Applications</h2>
              <div className="flex gap-2">
                <Input placeholder="Search applications..." className="w-64" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Primary Specialty</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewerApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.name}</TableCell>
                      <TableCell>{application.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{application.specialty}</Badge>
                      </TableCell>
                      <TableCell>{application.experience}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            application.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : application.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(application.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewReviewerApplication(application.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handleApproveReviewer(application.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleRejectReviewer(application.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Quick Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {reviewerApplications.filter(app => app.status === 'pending').length}
                  </div>
                  <p className="text-sm text-gray-600">Pending Applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {reviewerApplications.filter(app => app.status === 'approved').length}
                  </div>
                  <p className="text-sm text-gray-600">Approved This Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <p className="text-sm text-gray-600">Active Reviewers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">2.3</div>
                  <p className="text-sm text-gray-600">Avg Review Time (weeks)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advertisements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Advertisement Management</h2>
              <Button
                onClick={handleCreateAdvertisement}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add New Advertisement
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Advertisements</CardTitle>
                  <CardDescription>Currently displayed advertisements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {advertisements.map((ad) => (
                      <div key={ad.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{ad.title}</div>
                          <div className="text-sm text-gray-600">
                            {ad.position === 'sidebar-top' ? 'Sidebar Top' : 'Sidebar Bottom'} • Expires in {ad.expiresIn} days
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewAdvertisement(ad.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditAdvertisement(ad.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Add Advertisement</CardTitle>
                  <CardDescription>Upload a new advertisement banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Advertisement title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sidebar-top">Sidebar Top</SelectItem>
                        <SelectItem value="sidebar-bottom">Sidebar Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image Upload</label>
                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                      <div className="text-gray-500">Click to upload image</div>
                      <div className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    Upload Advertisement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <div className="flex gap-2">
                <Input placeholder="Search users..." className="w-64" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="author">Authors</SelectItem>
                    <SelectItem value="reviewer">Reviewers</SelectItem>
                    <SelectItem value="editor">Editors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Affiliation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{user.affiliation}</div>
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt ?? '').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEmailUser(user.email)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Analytics & Reports</h2>
              <Button onClick={handleExportReport}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>IoT Research Distribution</CardTitle>
                  <CardDescription>Breakdown of IoT vs non-IoT submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>IoT Research Papers</span>
                      <span className="font-semibold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Other Research Areas</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Submissions</CardTitle>
                  <CardDescription>Submission trends over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">March 2024</span>
                      <span className="font-semibold">23 submissions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">February 2024</span>
                      <span className="font-semibold">19 submissions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">January 2024</span>
                      <span className="font-semibold">27 submissions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Journal Settings</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Editorial Settings</CardTitle>
                  <CardDescription>Configure review process and editorial workflow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Review Period (days)</label>
                    <Input defaultValue="14" type="number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Minimum Reviewers</label>
                    <Input defaultValue="2" type="number" />
                  </div>
                  <Button onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Configure automated email settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Submission confirmations</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleEmailSetting('submissionConfirmations')}
                    >
                      {emailSettings.submissionConfirmations ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Review assignments</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleEmailSetting('reviewAssignments')}
                    >
                      {emailSettings.reviewAssignments ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Publication notifications</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleEmailSetting('publicationNotifications')}
                    >
                      {emailSettings.publicationNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>  {/* closes container */}
    </div>  {/* closes outer wrapper */}
    </RouteGuard>
  )
}
