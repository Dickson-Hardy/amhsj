import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { articles, review_assignments } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"

const assignmentSchema = z.object({
  submissionId: z.string(),
  reviewerId: z.string(),
  assignedBy: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has section editor role or higher
    const allowedRoles = ["section-editor", "managing-editor", "editor-in-chief", "admin"]
    if (!allowedRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, reviewerId, assignedBy } = assignmentSchema.parse(body)

    // Verify the submission exists and is assigned to this editor
    const submission = await db
      .select()
      .from(articles)
      .where(eq(articles.id, submissionId))
      .limit(1)

    if (!submission.length) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    if (submission[0].editor_id !== session.user.id) {
      return NextResponse.json({ error: "Not authorized for this submission" }, { status: 403 })
    }

    // Check if reviewer is already assigned to this submission
    const existingAssignment = await db
      .select()
      .from(review_assignments)
      .where(and(
        eq(review_assignments.article_id, submissionId),
        eq(review_assignments.reviewer_id, reviewerId)
      ))
      .limit(1)

    if (existingAssignment.length > 0) {
      return NextResponse.json({ error: "Reviewer already assigned to this submission" }, { status: 400 })
    }

    // Create new review assignment
    await db.insert(review_assignments).values({
      id: crypto.randomUUID(),
      article_id: submissionId,
      reviewer_id: reviewerId,
      assigned_by: session.user.id,
      assigned_date: new Date(),
      due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      status: "pending",
      created_at: new Date()
    })

    // Update article status to under_review if not already
    if (submission[0].status === "technical_check" || submission[0].status === "submitted") {
      await db
        .update(articles)
        .set({ 
          status: "under_review",
          updated_at: new Date()
        })
        .where(eq(articles.id, submissionId))
    }

    // Update reviewer_ids array in articles table
    const currentReviewerIds = submission[0].reviewer_ids || []
    if (!currentReviewerIds.includes(reviewerId)) {
      await db
        .update(articles)
        .set({ 
          reviewer_ids: [...currentReviewerIds, reviewerId],
          updated_at: new Date()
        })
        .where(eq(articles.id, submissionId))
    }

    // TODO: Send notification email to reviewer

    return NextResponse.json({ 
      success: true, 
      message: "Reviewer assigned successfully" 
    })

  } catch (error) {
    console.error("Error assigning reviewer:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
