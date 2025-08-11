import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { articles, reviews } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET(request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Next.js 15+ requires awaiting params if it's a promise
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.id !== id && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userSubmissions = await db
      .select({
        id: articles.id,
        title: articles.title,
        category: articles.category,
        status: articles.status,
        submittedDate: articles.submittedDate,
        updatedAt: articles.updatedAt,
        reviewerCount: sql<number>`(
          SELECT COUNT(*) FROM ${reviews} 
          WHERE ${reviews.articleId} = ${articles.id}
        )`,
      })
      .from(articles)
      .where(eq(articles.authorId, id))
      .orderBy(desc(articles.submittedDate))

    // Format submissions for frontend
    const formattedSubmissions = userSubmissions.map((submission) => ({
      ...submission,
      reviewers: submission.reviewerCount || 0,
      comments: 0, // Placeholder - would need to implement comments system
      lastUpdate: submission.updatedAt || submission.submittedDate,
      isIoT:
        submission.category.toLowerCase().includes("clinical") || submission.category.toLowerCase().includes("medical"),
    }))

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
    })
  } catch (error) {
    const { params } = context;
    const id = params.id;
    logError(error as Error, { endpoint: `/api/users/${id}/submissions` })
    return NextResponse.json({ success: false, error: "Failed to fetch submissions" }, { status: 500 })
  }
}
