import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { submissions } from "@/lib/db/schema"
import { eq, and, sql, desc } from "drizzle-orm"
import { workflowManager } from "@/lib/workflow"
import { logError } from "@/lib/logger"
import { z } from "zod"

// Validation schema for submission
const submissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  abstract: z.string().min(100, "Abstract must be at least 100 characters").max(2000, "Abstract too long"),
  keywords: z.array(z.string().min(1)).min(3, "At least 3 keywords required").max(10, "Maximum 10 keywords"),
  category: z.string().min(1, "Category is required"),
  authors: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    affiliation: z.string().optional(),
    orcid: z.string().optional(),
    isCorrespondingAuthor: z.boolean().default(false)
  })).min(1, "At least one author required"),
  files: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string(),
    fileId: z.string()
  })).min(1, "At least one file required"),
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
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = submissionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const submissionData = validation.data
    const authorId = session.user.id

    // Check if user has active draft submissions limit
    const activeDrafts = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(and(
        eq(submissions.authorId, authorId),
        eq(submissions.status, "draft")
      ))

    if (activeDrafts.length >= 5) {
      return NextResponse.json({ 
        error: "Maximum 5 active drafts allowed" 
      }, { status: 429 })
    }

    // Submit article through workflow manager
    const result = await workflowManager.submitArticle(submissionData, authorId)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.message || "Submission failed" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      articleId: result.article?.id,
      message: "Submission created successfully"
    })

  } catch (error) {
    logError(error as Error, { endpoint: "/api/submissions", operation: "POST" })
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
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = db
      .select({
        id: submissions.id,
        articleId: submissions.articleId,
        authorId: submissions.authorId,
        status: submissions.status,
        submittedAt: submissions.submittedAt,
        createdAt: submissions.createdAt,
        updatedAt: submissions.updatedAt
      })
      .from(submissions)

    // Filter by user role
    if (session.user.role === "author") {
      query = query.where(eq(submissions.authorId, session.user.id))
    }

    // Apply filters
    if (status) {
      query = query.where(eq(submissions.status, status))
    }

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)

    // Get paginated results
    const results = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(submissions.createdAt))

    return NextResponse.json({
      success: true,
      submissions: results,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    })

  } catch (error) {
    logError(error as Error, { endpoint: "/api/submissions", operation: "GET" })
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 