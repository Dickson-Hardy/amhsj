"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { RouteGuard } from "@/components/route-guard"
import ReviewerLayout from "@/components/layouts/reviewer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Clock, FileText, Star, CheckCircle, Calendar, Target, TrendingUp, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReviewerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleStartReview = (manuscriptId: string) => {
    router.push(`/reviewer/review/${manuscriptId}`)
  }

  const handleDownloadPDF = (manuscriptId: string) => {
    // In a real implementation, this would download the manuscript PDF
    toast({
      title: "Download Starting",
      description: `Downloading PDF for manuscript ${manuscriptId}`,
    })
    // window.open(`/api/manuscripts/${manuscriptId}/download`, '_blank')
  }

  const handleViewProfile = () => {
    router.push('/reviewer/profile')
  }

  const handleViewGuidelines = () => {
    router.push('/reviewer/guidelines')
  }

  const handleViewHistory = () => {
    router.push('/reviewer/history')
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent('/reviewer/dashboard'))
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access the reviewer portal.
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const reviewerStats = [
    {
      title: "Pending Reviews",
      value: "3",
      icon: Clock,
      change: "Due this week",
      color: "text-orange-600",
    },
    {
      title: "Completed Reviews",
      value: "12",
      icon: CheckCircle,
      change: "This year",
      color: "text-green-600",
    },
    {
      title: "Average Review Time",
      value: "18 days",
      icon: Target,
      change: "Below average",
      color: "text-blue-600",
    },
    {
      title: "Quality Rating",
      value: "4.8/5",
      icon: Star,
      change: "Excellent",
      color: "text-purple-600",
    },
  ]

  return (
    <RouteGuard allowedRoles={["reviewer", "admin"]}>
      <ReviewerLayout>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reviewerStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
            <TabsTrigger value="history">Review History</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Pending Reviews</h2>
              <Badge className="bg-orange-100 text-orange-800">3 reviews due</Badge>
            </div>

            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">AI-Assisted Diagnosis in Rural Healthcare Settings</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Assigned: 5 days ago
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Due in 5 days</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    A prospective study evaluating machine learning algorithms for diagnostic assistance in resource-limited settings. Focus on implementation challenges and clinical outcomes.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="secondary">Artificial Intelligence</Badge>
                      <Badge variant="secondary">Healthcare Technology</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF('ms-001')}>
                        <FileText className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button size="sm" onClick={() => handleStartReview('ms-001')} className="bg-indigo-600 hover:bg-indigo-700">
                        Start Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Telemedicine Adoption in Sub-Saharan Africa</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Assigned: 2 days ago
                        </div>
                        <Badge className="bg-green-100 text-green-800">Due in 12 days</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Cross-sectional analysis of telemedicine implementation barriers and facilitators across multiple countries. Comprehensive policy and infrastructure assessment.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="secondary">Telemedicine</Badge>
                      <Badge variant="secondary">Policy Analysis</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF('ms-002')}>
                        <FileText className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button size="sm" onClick={() => handleStartReview('ms-002')} className="bg-indigo-600 hover:bg-indigo-700">
                        Start Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Mobile Health Interventions for Maternal Care</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Assigned: 1 day ago
                        </div>
                        <Badge className="bg-green-100 text-green-800">Due in 18 days</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Randomized controlled trial of mobile application for prenatal care monitoring in rural communities. Maternal and neonatal outcome evaluation.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="secondary">Mobile Health</Badge>
                      <Badge variant="secondary">Maternal Care</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF('ms-003')}>
                        <FileText className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button size="sm" onClick={() => handleStartReview('ms-003')} className="bg-indigo-600 hover:bg-indigo-700">
                        Start Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Review History</h2>
              <Button variant="outline" onClick={handleViewHistory}>
                View All Reviews
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Recent Completed Reviews
                </CardTitle>
                <CardDescription>Your review activity and contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">IoT in Healthcare Monitoring</div>
                      <div className="text-sm text-gray-600">Completed 2 days ago • Recommended with minor revisions</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">Blockchain in Medical Records</div>
                      <div className="text-sm text-gray-600">Completed 1 week ago • Recommended for publication</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">5G Networks in Rural Health</div>
                      <div className="text-sm text-gray-600">Completed 2 weeks ago • Major revisions required</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Performance Metrics</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Review Quality
                  </CardTitle>
                  <CardDescription>Feedback from editors and authors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold text-2xl text-yellow-600">4.8/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Timeliness Score</span>
                    <span className="font-semibold text-xl text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thoroughness Rating</span>
                    <span className="font-semibold text-xl text-blue-600">4.9/5</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Recognition & Achievements
                  </CardTitle>
                  <CardDescription>Awards and acknowledgments received</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">Outstanding Reviewer 2024</div>
                      <div className="text-sm text-gray-600">Received 1 week ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Star className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">Top 10% Reviewer</div>
                      <div className="text-sm text-gray-600">Received 1 month ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Resources & Guidelines</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Guidelines</CardTitle>
                  <CardDescription>Essential guidelines for high-quality reviews</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleViewGuidelines}>
                    <FileText className="h-4 w-4 mr-2" />
                    Peer Review Guidelines
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Ethical Review Standards
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Statistical Review Checklist
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Manage your reviewer profile and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleViewProfile}>
                    <Clock className="h-4 w-4 mr-2" />
                    Update Profile & Expertise
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Availability
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Review Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </ReviewerLayout>
    </RouteGuard>
  )
}
