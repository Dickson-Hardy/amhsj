"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users,
  UserPlus,
  Mail,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Award,
  TrendingUp,
} from "lucide-react"

interface Reviewer {
  id: string
  name: string
  email: string
  affiliation: string
  expertise: string[]
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  currentLoad: number
  maxLoad: number
  averageRating: number
  completedReviews: number
  onTimeRate: number
  lastActive: string
  joinDate: string
}

interface ReviewerStats {
  totalReviewers: number
  activeReviewers: number
  pendingInvitations: number
  averageResponseTime: number
  overallRating: number
  onTimePercentage: number
}

export default function AdminReviewersPage() {
  const { data: session } = useSession()
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [stats, setStats] = useState<ReviewerStats>({
    totalReviewers: 0,
    activeReviewers: 0,
    pendingInvitations: 0,
    averageResponseTime: 0,
    overallRating: 0,
    onTimePercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (session?.user?.role !== "admin") return
    fetchReviewersData()
  }, [session])

  const fetchReviewersData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      setStats({
        totalReviewers: 245,
        activeReviewers: 189,
        pendingInvitations: 12,
        averageResponseTime: 8.5,
        overallRating: 4.2,
        onTimePercentage: 87,
      })

      setReviewers([
        {
          id: "1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@university.edu",
          affiliation: "Harvard Medical School",
          expertise: ["Cardiology", "Surgery", "Clinical Research"],
          status: 'active',
          currentLoad: 3,
          maxLoad: 5,
          averageRating: 4.8,
          completedReviews: 45,
          onTimeRate: 95,
          lastActive: "2024-01-20",
          joinDate: "2022-03-15"
        },
        {
          id: "2",
          name: "Prof. Michael Chen",
          email: "m.chen@medical.edu",
          affiliation: "Johns Hopkins University",
          expertise: ["Neurology", "Medical Imaging", "AI in Medicine"],
          status: 'active',
          currentLoad: 2,
          maxLoad: 4,
          averageRating: 4.6,
          completedReviews: 67,
          onTimeRate: 89,
          lastActive: "2024-01-22",
          joinDate: "2021-08-20"
        },
        {
          id: "3",
          name: "Dr. Emily Watson",
          email: "e.watson@research.org",
          affiliation: "Mayo Clinic",
          expertise: ["Oncology", "Immunotherapy", "Clinical Trials"],
          status: 'pending',
          currentLoad: 0,
          maxLoad: 3,
          averageRating: 0,
          completedReviews: 0,
          onTimeRate: 0,
          lastActive: "Never",
          joinDate: "2024-01-15"
        },
        {
          id: "4",
          name: "Dr. Robert Kim",
          email: "r.kim@hospital.com",
          affiliation: "Stanford Medicine",
          expertise: ["Pediatrics", "Genetics", "Rare Diseases"],
          status: 'inactive',
          currentLoad: 0,
          maxLoad: 4,
          averageRating: 4.3,
          completedReviews: 23,
          onTimeRate: 78,
          lastActive: "2023-11-30",
          joinDate: "2020-06-10"
        }
      ])
    } catch (error) {
      console.error('Error fetching reviewers data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReviewerStatus = async (reviewerId: string, newStatus: string) => {
    try {
      console.log(`Updating reviewer ${reviewerId} status to: ${newStatus}`)
      // API call to update reviewer status
      fetchReviewersData()
    } catch (error) {
      console.error('Error updating reviewer status:', error)
    }
  }

  const handleInviteReviewer = async (email: string, expertise: string[]) => {
    try {
      console.log(`Inviting reviewer: ${email} with expertise: ${expertise.join(", ")}`)
      // API call to invite reviewer
      fetchReviewersData()
    } catch (error) {
      console.error('Error inviting reviewer:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesStatus = filterStatus === "all" || reviewer.status === filterStatus
    const matchesSearch = reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reviewer.affiliation.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reviewer Management</h1>
              <p className="text-gray-600">Manage journal reviewers and their assignments</p>
            </div>
          </div>
          <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Reviewer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Reviewer</DialogTitle>
              <DialogDescription>
                Send an invitation to a potential reviewer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Email address" type="email" />
              <Input placeholder="Full name" />
              <Input placeholder="Affiliation" />
              <Input placeholder="Areas of expertise (comma-separated)" />
              <Button onClick={() => handleInviteReviewer("", [])} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviewers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeReviewers} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}d</div>
            <p className="text-xs text-muted-foreground">Days to respond</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallRating}/5</div>
            <p className="text-xs text-muted-foreground">{stats.onTimePercentage}% on time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search reviewers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      {/* Reviewers Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px]">Reviewer</TableHead>
                <TableHead className="min-w-[200px]">Expertise</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Load</TableHead>
                <TableHead className="min-w-[140px]">Performance</TableHead>
                <TableHead className="min-w-[100px]">Last Active</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredReviewers.map((reviewer) => (
              <TableRow key={reviewer.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{reviewer.name}</div>
                    <div className="text-sm text-gray-500">{reviewer.email}</div>
                    <div className="text-sm text-gray-500">{reviewer.affiliation}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {reviewer.expertise.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {reviewer.expertise.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{reviewer.expertise.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(reviewer.status)}>
                    {reviewer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{reviewer.currentLoad}/{reviewer.maxLoad}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(reviewer.currentLoad / reviewer.maxLoad) * 100}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{reviewer.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span className="text-sm">{reviewer.onTimeRate}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {reviewer.completedReviews} reviews
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {reviewer.lastActive === "Never" ? "Never" : new Date(reviewer.lastActive).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setSelectedReviewer(reviewer)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Reviewer</DialogTitle>
                          <DialogDescription>
                            Update status for {reviewer.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select defaultValue={reviewer.status}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={() => handleUpdateReviewerStatus(reviewer.id, 'active')}
                            className="w-full"
                          >
                            Update Status
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Reviewer Details Dialog */}
      {selectedReviewer && (
        <Dialog open={!!selectedReviewer} onOpenChange={() => setSelectedReviewer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedReviewer.name}</DialogTitle>
              <DialogDescription>{selectedReviewer.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Affiliation</label>
                  <p className="text-sm text-gray-600">{selectedReviewer.affiliation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Join Date</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReviewer.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Completed Reviews</label>
                  <p className="text-sm text-gray-600">{selectedReviewer.completedReviews}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Average Rating</label>
                  <p className="text-sm text-gray-600">{selectedReviewer.averageRating}/5</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Areas of Expertise</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedReviewer.expertise.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
