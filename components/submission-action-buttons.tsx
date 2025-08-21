"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  MessageSquare, 
  Edit, 
  Download,
  Clock,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Submission {
  id: string
  status: string
  comments: number
}

interface SubmissionActionButtonsProps {
  submission: Submission
  context?: 'dashboard' | 'list' | 'details'
}

export function SubmissionActionButtons({ 
  submission, 
  context = 'dashboard' 
}: SubmissionActionButtonsProps) {
  const router = useRouter()

  // Primary action based on status
  const getPrimaryAction = () => {
    switch (submission.status) {
      case "revision_requested":
        return (
          <Button 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => router.push(`/submissions/${submission.id}/revise`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Submit Revision
          </Button>
        )
      case "accepted":
      case "published":
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => router.push(`/submissions/${submission.id}/download`)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )
      case "technical_check":
      case "under_review":
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => router.push(`/submissions/${submission.id}/status`)}
          >
            <Clock className="h-4 w-4 mr-1" />
            Track Status
          </Button>
        )
      default:
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="hover:bg-indigo-50"
            onClick={() => router.push(`/submissions/${submission.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        )
    }
  }

  // Condensed view for mobile or tight spaces
  if (context === 'list') {
    return (
      <div className="flex gap-1">
        {getPrimaryAction()}
        <Button 
          size="sm" 
          variant="ghost"
          className="p-1 h-8 w-8"
          onClick={() => router.push(`/submissions/${submission.id}/messages`)}
        >
          <MessageSquare className="h-4 w-4" />
          {submission.comments > 0 && (
            <span className="sr-only">{submission.comments} messages</span>
          )}
        </Button>
      </div>
    )
  }

  // Full action buttons for dashboard
  return (
    <div className="flex gap-2">
      {getPrimaryAction()}
      <Button 
        size="sm" 
        variant="outline" 
        className="hover:bg-blue-50"
        onClick={() => router.push(`/submissions/${submission.id}/messages`)}
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Messages
        {submission.comments > 0 && (
          <Badge className="ml-1 bg-blue-500 text-white text-xs">
            {submission.comments}
          </Badge>
        )}
      </Button>
    </div>
  )
}