import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { reviews, articles, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { reviewSchema } from "@/lib/validations"
import { EditorialWorkflow } from "@/lib/workflow"
import { logError, logInfo } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let query = db
      .select({
        id: reviews.id,
        articleId: reviews.articleId,
        status: reviews.status,
        recommendation: reviews.recommendation,
        submittedAt: reviews.submittedAt,
        createdAt: reviews.createdAt,
        articleTitle: articles.title,
        articleCategory: articles.category,
        authorName: users.name,
      })
      .from(reviews)
      .leftJoin(articles, eq(reviews.articleId, articles.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(reviews.reviewerId, session.user.id))

    if (status !== "all") {
      query = query.where(and(eq(reviews.reviewerId, session.user.id), eq(reviews.status, status)))
    }

    const userReviews = await query.orderBy(desc(reviews.createdAt))

    return NextResponse.json({
      success: true,
      reviews: userReviews,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/reviews" })
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, ...reviewData } = body
    const validatedData = reviewSchema.parse(reviewData)

    const result = await EditorialWorkflow.submitReview(reviewId, validatedData)

    if (result.success) {
      logInfo("Review submitted", {
        reviewId,
        reviewerId: session.user.id,
        recommendation: validatedData.recommendation,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    logError(error as Error, { endpoint: "/api/reviews POST" })
    return NextResponse.json({ success: false, error: "Review submission failed" }, { status: 500 })
  }
}
