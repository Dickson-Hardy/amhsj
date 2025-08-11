"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  FileText,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail,
  BarChart3,
  Workflow,
  UserPlus,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  MessageSquare,
} from "lucide-react"

interface WorkflowMetrics {
  submissionsToday: number
  pendingInitialReview: number
  overdueTasks: number
  averageProcessingTime: number
  editorWorkloadAvg: number
  systemEfficiency: number
}

interface Task {
  id: string
  type: 'initial_review' | 'editor_assignment' | 'reviewer_reminder' | 'decision_followup'
  title: string
  submissionId: string
  submissionTitle: string
  assignedTo: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  daysPending: number
}

interface EditorWorkload {
  id: string
  name: string
  role: string
  currentAssignments: number
  capacity: number
  averageResponseTime: number
  performanceScore: number
  specialties: string[]
}

interface SystemAlert {
  id: string
  type: 'overdue' | 'capacity' | 'performance' | 'system'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
}

export default function ManagingEditorDashboard() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<WorkflowMetrics>({
    submissionsToday: 0,
    pendingInitialReview: 0,
    overdueTasks: 0,
    averageProcessingTime: 0,
    editorWorkloadAvg: 0,
    systemEfficiency: 0,
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [editorWorkloads, setEditorWorkloads] = useState<EditorWorkload[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const allowedRoles = ["managing-editor", "editor-in-chief", "admin"]
    if (!allowedRoles.includes(session?.user?.role || "")) return

    fetchDashboardData()
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      setMetrics({
        submissionsToday: 7,
        pendingInitialReview: 23,
        overdueTasks: 5,
        averageProcessingTime: 3.2,
        editorWorkloadAvg: 78,
        systemEfficiency: 92,
      })

      setTasks([
        {
          id: "1",
          type: 'initial_review',
          title: "Initial Review - Novel Cardiac Techniques",
          submissionId: "SUB-001",
          submissionTitle: "Novel Cardiac Techniques",
          assignedTo: "System",
          dueDate: "2024-01-25",
          priority: 'high',
          status: 'pending',
          daysPending: 3,
        },
        {
          id: "2",
          type: 'editor_assignment',
          title: "Editor Assignment Needed",
          submissionId: "SUB-002",
          submissionTitle: "AI in Medical Diagnosis",
          assignedTo: "Managing Editor",
          dueDate: "2024-01-24",
          priority: 'high',
          status: 'pending',
          daysPending: 2,
        },
        {
          id: "3",
          type: 'reviewer_reminder',
          title: "Reviewer Reminder - Dr. Smith",
          submissionId: "SUB-003",
          submissionTitle: "Cancer Treatment Innovation",
          assignedTo: "Dr. Sarah Chen",
          dueDate: "2024-01-23",
          priority: 'medium',
          status: 'in_progress',
          daysPending: 7,
        }
      ])

      setEditorWorkloads([
        {
          id: "1",
          name: "Dr. Mike Chen",
          role: "Section Editor",
          currentAssignments: 8,
          capacity: 10,
          averageResponseTime: 2.5,
          performanceScore: 95,
          specialties: ["Cardiology", "Surgery"],
        },
        {
          id: "2",
          name: "Dr. Lisa Wong",
          role: "Associate Editor",
          currentAssignments: 12,
          capacity: 10,
          averageResponseTime: 4.1,
          performanceScore: 88,
          specialties: ["Technology", "AI"],
        },
        {
          id: "3",
          name: "Dr. Robert Johnson",
          role: "Associate Editor",
          currentAssignments: 6,
          capacity: 10,
          averageResponseTime: 1.8,
          performanceScore: 97,
          specialties: ["Neurology", "Research"],
        }
      ])

      setSystemAlerts([
        {
          id: "1",
          type: 'overdue',
          title: "Overdue Initial Reviews",
          description: "5 submissions awaiting initial editorial review for >3 days",
          severity: 'high',
          timestamp: "2024-01-22T10:30:00Z",
        },
        {
          id: "2",
          type: 'capacity',
          title: "Editor Over Capacity",
          description: "Dr. Lisa Wong has exceeded recommended workload (12/10)",
          severity: 'medium',
          timestamp: "2024-01-22T09:15:00Z",
        }
      ])

    } catch (error) {
      console.error('Error fetching managing editor dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      console.log(`Task action: ${action} for task ${taskId}`)
      fetchDashboardData()
    } catch (error) {
      console.error('Error handling task action:', error)
    }
  }

  const handleWorkloadAdjustment = async (editorId: string, newCapacity: number) => {
    try {
      console.log(`Adjusting workload for editor ${editorId}: ${newCapacity}`)
      fetchDashboardData()
    } catch (error) {
      console.error('Error adjusting workload:', error)
    }
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

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
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Managing Editor Dashboard</h1>
          <p className="text-gray-600">Editorial workflow management and operations oversight</p>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="space-y-2">
          {systemAlerts.map((alert) => (
            <Alert key={alert.id} className={getAlertColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.submissionsToday}</div>
            <p className="text-xs text-muted-foreground">New submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingInitialReview}</div>
            <p className="text-xs text-muted-foreground">Awaiting initial review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageProcessingTime}d</div>
            <p className="text-xs text-muted-foreground">Average days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemEfficiency}%</div>
            <p className="text-xs text-muted-foreground">Workflow efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="workload">Editor Workload</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Editorial Workflow Overview</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Workflow className="h-4 w-4 mr-2" />
                Workflow Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Initial Review</span>
                  <Badge variant="outline">{metrics.pendingInitialReview} pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Editor Assignment</span>
                  <Badge variant="outline">8 pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Peer Review</span>
                  <Badge variant="outline">45 active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Decision Pending</span>
                  <Badge variant="outline">12 awaiting</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Initial Review</span>
                    <span className="text-sm font-medium">2.1 days</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Editor Assignment</span>
                    <span className="text-sm font-medium">1.5 days</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">First Review</span>
                    <span className="text-sm font-medium">21 days</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Editorial Tasks</h2>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="my-tasks">My Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className={`border-l-4 ${getTaskPriorityColor(task.priority)}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>
                        Submission: {task.submissionTitle} • 
                        Assigned to: {task.assignedTo} • 
                        {task.daysPending} days pending
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === 'pending' ? 'secondary' : 'default'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleTaskAction(task.id, 'complete')}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                    <Button 
                      onClick={() => handleTaskAction(task.id, 'assign')}
                      variant="outline" 
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Reassign
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Editor Workload Tab */}
        <TabsContent value="workload" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Editor Workload Management</h2>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Editor
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Editor</TableHead>
                  <TableHead>Current Load</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editorWorkloads.map((editor) => (
                  <TableRow key={editor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{editor.name}</div>
                        <div className="text-sm text-gray-500">{editor.role}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(editor.currentAssignments / editor.capacity) * 100} 
                            className="w-16"
                          />
                          <span className="text-sm">
                            {editor.currentAssignments}/{editor.capacity}
                          </span>
                        </div>
                        {editor.currentAssignments > editor.capacity && (
                          <Badge variant="destructive" className="text-xs">
                            Over capacity
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{editor.averageResponseTime} days</TableCell>
                    <TableCell>
                      <Badge variant={editor.performanceScore >= 90 ? "default" : "secondary"}>
                        {editor.performanceScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {editor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          onClick={() => handleWorkloadAdjustment(editor.id, editor.capacity + 2)}
                          variant="outline" 
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Editorial Reports & Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Monthly Editorial Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Processing Time Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Editor Workload Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Editor Workload</span>
                  <Badge>{metrics.editorWorkloadAvg}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overdue Tasks</span>
                  <Badge variant={metrics.overdueTasks > 0 ? "destructive" : "default"}>
                    {metrics.overdueTasks}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>System Efficiency</span>
                  <Badge variant="default">{metrics.systemEfficiency}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Editorial Settings</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Review Timeline Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Template Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Editor Assignment Rules
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alert Thresholds
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
