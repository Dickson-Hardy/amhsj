import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { workflowManager } from "@/lib/workflow"
import { logError } from "@/lib/logger"
import { z } from "zod"
import { db } from "@/lib/db"
import { submissions } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

// Workflow submission schema
const workflowSubmissionSchema = z.object({
  articleData: z.object({
    title: z.string().min(1),
    abstract: z.string().min(100),
    keywords: z.array(z.string()).min(3),
    category: z.string(),
    authors: z.array(z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      affiliation: z.string().optional(),
      orcid: z.string().optional(),
      isCorrespondingAuthor: z.boolean().default(false)
    })),
    files: z.array(z.object({
      url: z.string(),
      type: z.string(),
      name: z.string(),
      fileId: z.string()
    })).optional(),
    recommendedReviewers: z.array(z.object({
      name: z.string(),
      email: z.string().email(),
      affiliation: z.string(),
      expertise: z.string()
    })).optional(),
    coverLetter: z.string().optional(),
    ethicalApproval: z.boolean().default(false),
    conflictOfInterest: z.boolean().default(false),
    funding: z.string().optional()
  }),
  submissionType: z.enum(["new", "revision", "resubmission"]).default("new"),
  previousSubmissionId: z.string().optional(),
  revisionNotes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = workflowSubmissionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const { articleData, submissionType, previousSubmissionId, revisionNotes } = validation.data
    const authorId = session.user.id

    // Submit article through workflow manager
    const result = await workflowManager.submitArticle(articleData, authorId)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.message || "Workflow submission failed" 
      }, { status: 500 })
    }

    // If this is a revision, update the previous submission
    if (submissionType === "revision" && previousSubmissionId) {
      try {
        // Append superseded note to previous submission history (do not change to a non-existent status)
        await db
          .update(submissions)
          .set({
            statusHistory: sql`${submissions.statusHistory} || ${JSON.stringify([{ 
              status: "revision_superseded",
              timestamp: new Date(),
              userId: authorId,
              notes: `Superseded by submission ${result.submissionId}`,
              systemGenerated: true
            }])}::jsonb`,
            updatedAt: new Date()
          })
          .where(eq(submissions.id, previousSubmissionId))

        // Add revision notes to the new submission's history if provided
        if (revisionNotes && result.submissionId) {
          await db
            .update(submissions)
            .set({
              statusHistory: sql`${submissions.statusHistory} || ${JSON.stringify([{ 
                status: "revision_submitted",
                timestamp: new Date(),
                userId: authorId,
                notes: revisionNotes,
                systemGenerated: false
              }])}::jsonb`
            })
            .where(eq(submissions.id, result.submissionId))
        }
      } catch (revisionError) {
        logError(revisionError as Error, { endpoint: "/api/workflow/submit", operation: "revision_update" })
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      articleId: result.article?.id,
      workflowStatus: "submitted",
      message: "Article submitted to workflow successfully",
      nextSteps: [
        "Technical check in progress",
        "Editor assignment pending",
        "Reviewer selection pending"
      ]
    })

  } catch (error) {
    logError(error as Error, { endpoint: "/api/workflow/submit", operation: "POST" })
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get("submissionId")

    if (!submissionId) {
      return NextResponse.json({ 
        error: "Submission ID required" 
      }, { status: 400 })
    }

    // Get workflow status from database
    try {
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1)

      if (!submission) {
        return NextResponse.json({
          error: "Submission not found"
        }, { status: 404 })
      }

      // Check permissions - user can only see their own submissions unless they're admin/editor
      if (session.user.role !== "admin" && 
          session.user.role !== "editor" && 
          submission.authorId !== session.user.id) {
        return NextResponse.json({
          error: "Access denied"
        }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        submissionId,
        workflowStatus: submission.status,
        statusHistory: submission.statusHistory || [],
        submittedAt: submission.submittedAt,
        lastUpdated: submission.updatedAt,
        estimatedCompletion: getEstimatedCompletion(submission.status),
        nextSteps: getNextSteps(submission.status)
      })
    } catch (error) {
      logError(error as Error, { endpoint: "/api/workflow/submit", operation: "GET" })
      return NextResponse.json({
        error: "Failed to retrieve workflow status"
      }, { status: 500 })
    }

  } catch (error) {
    logError(error as Error, { endpoint: "/api/workflow/submit", operation: "GET" })
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// Helper function to get estimated completion time
function getEstimatedCompletion(status: string): string {
  const estimations: Record<string, string> = {
    "submitted": "3-5 business days",
    "technical_check": "1-2 business days", 
    "under_review": "4-6 weeks",
    "revision_requested": "Author dependent",
    "revision_submitted": "2-3 weeks",
    "accepted": "2-4 weeks",
    "rejected": "Completed",
    "published": "Completed"
  }
  return estimations[status] || "Unknown"
}

// Helper function to get next steps
function getNextSteps(status: string): string[] {
  const nextStepsMap: Record<string, string[]> = {
    "submitted": ["Technical check", "Editor assignment"],
    "technical_check": ["Editor assignment", "Reviewer selection"],
    "under_review": ["Review completion", "Editorial decision"],
    "revision_requested": ["Author revision", "Resubmission"],
    "revision_submitted": ["Review of revision", "Final decision"],
    "accepted": ["Production", "Publication"],
    "rejected": ["Process completed"],
    "published": ["Archive", "Citation tracking"]
  }
  return nextStepsMap[status] || []
}
