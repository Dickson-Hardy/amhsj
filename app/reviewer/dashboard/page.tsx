"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, FileText, Star, CheckCircle } from "lucide-react"

export default function ReviewerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleStartReview = (manuscriptId: string) => {
    router.push(`/reviewer/review/${manuscriptId}`)
  }

  const handleDownloadPDF = (manuscriptId: string) => {
    // In a real implementation, this would download the manuscript PDF
    alert(`Downloading PDF for manuscript ${manuscriptId}`)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reviewer Portal</h1>
          <p className="text-gray-600">Welcome back, {session.user?.name || 'Reviewer'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Completed Reviews</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">18</div>
              <div className="text-sm text-gray-600">Average Days</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Manuscripts assigned for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">AI-Assisted Diagnosis in Rural Healthcare Settings</h4>
                  <Badge className="bg-yellow-100 text-yellow-800">Due in 5 days</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  A prospective study evaluating machine learning algorithms for diagnostic assistance...
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleStartReview('ms-001')}>Start Review</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF('ms-001')}>Download PDF</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Telemedicine Adoption in Sub-Saharan Africa</h4>
                  <Badge className="bg-orange-100 text-orange-800">Due in 12 days</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Cross-sectional analysis of telemedicine implementation barriers and facilitators...
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleStartReview('ms-002')}>Start Review</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF('ms-002')}>Download PDF</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Mobile Health Interventions for Maternal Care</h4>
                  <Badge className="bg-green-100 text-green-800">Due in 18 days</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Randomized controlled trial of mobile application for prenatal care monitoring...
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleStartReview('ms-003')}>Start Review</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF('ms-003')}>Download PDF</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium">Review completed</div>
                    <div className="text-xs text-gray-600">IoT in Healthcare Monitoring - 2 days ago</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium">New assignment</div>
                    <div className="text-xs text-gray-600">Telemedicine study - 5 days ago</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium">Recognition received</div>
                    <div className="text-xs text-gray-600">Outstanding Reviewer Award - 1 week ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleViewGuidelines}>
                  <FileText className="h-4 w-4 mr-2" />
                  Review Guidelines
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={handleViewProfile}>
                  <Clock className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={handleViewHistory}>
                  <Star className="h-4 w-4 mr-2" />
                  Review History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
