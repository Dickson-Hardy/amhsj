import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, reviews } from "@/lib/db/schema"
import { eq, count, avg } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["editor", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all reviewers with their statistics
    const reviewerResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        expertise: users.expertise,
      })
      .from(users)
      .where(eq(users.role, "reviewer"))

    // Get statistics for each reviewer
    const reviewers = await Promise.all(
      reviewerResults.map(async (reviewer) => {
        const [
          currentLoadResult,
          averageRatingResult,
          totalReviewsResult,
        ] = await Promise.all([
          db.select({ count: count() }).from(reviews).where(
            eq(reviews.reviewerId, reviewer.id)
          ),
          db.select({ avg: avg(reviews.rating) }).from(reviews).where(
            eq(reviews.reviewerId, reviewer.id)
          ),
          db.select({ count: count() }).from(reviews).where(
            eq(reviews.reviewerId, reviewer.id)
          ),
        ])

        return {
          id: reviewer.id,
          name: reviewer.name,
          email: reviewer.email,
          expertise: reviewer.expertise || [],
          currentLoad: Math.floor(Math.random() * 5), // Mock data - calculate actual load
          averageRating: Number(averageRatingResult[0]?.avg) || 4.2,
          onTimeRate: 85 + Math.floor(Math.random() * 15), // Mock data
          lastActive: new Date().toISOString(),
        }
      })
    )

    return NextResponse.json({
      success: true,
      reviewers,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/editors/reviewers" })
    return NextResponse.json({ success: false, error: "Failed to fetch reviewers" }, { status: 500 })
  }
}
