import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { 
  users, 
  submissions, 
  reviews, 
  pageViews,
  articles,
  volumes,
  issues,
  notifications
} from "@/lib/db/schema"
import { count, sql, gte, lte, eq, desc, and } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["admin", "editor-in-chief"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "30d" // 7d, 30d, 90d, 1y

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Core statistics
    const [
      totalUsers,
      activeUsers,
      totalSubmissions,
      pendingReviews,
      publishedArticles,
      totalVolumes,
      totalIssues,
      recentActivity
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),
      
      // Active users (using lastActiveAt instead of lastLoginAt)
      db.select({ count: count() })
        .from(users)
        .where(gte(users.lastActiveAt, startDate)),
      
      // Total submissions
      db.select({ count: count() }).from(submissions),
      
      // Pending reviews
      db.select({ count: count() })
        .from(reviews)
        .where(eq(reviews.status, 'pending')),
      
      // Published articles
      db.select({ count: count() })
        .from(submissions)
        .where(eq(submissions.status, 'published')),
      
      // Total volumes
      db.select({ count: count() }).from(volumes),
      
      // Total issues
      db.select({ count: count() }).from(issues),
      
      // Recent activity (using notifications as proxy)
      db.select({ count: count() })
        .from(notifications)
        .where(gte(notifications.createdAt, startDate))
    ])

    // User growth over time
    const userGrowth = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`.as('date'),
        count: count()
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`)

    // Submission trends
    const submissionTrends = await db
      .select({
        date: sql<string>`DATE(${submissions.submittedAt})`.as('date'),
        count: count(),
        status: submissions.status
      })
      .from(submissions)
      .where(gte(submissions.submittedAt, startDate))
      .groupBy(sql`DATE(${submissions.submittedAt})`, submissions.status)
      .orderBy(sql`DATE(${submissions.submittedAt})`)

    // Role distribution
    const roleDistribution = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
      .groupBy(users.role)

    // Review completion rates (using submittedAt instead of completedAt and assignedAt)
    const reviewStats = await db
      .select({
        status: reviews.status,
        count: count(),
        avgDays: sql<number>`AVG(EXTRACT(EPOCH FROM (${reviews.submittedAt} - ${reviews.createdAt}))/86400)`.as('avgDays')
      })
      .from(reviews)
      .where(gte(reviews.createdAt, startDate))
      .groupBy(reviews.status)

    // System health indicators
    const systemHealth = {
      avgReviewTime: reviewStats.find(r => r.status === 'completed')?.avgDays || 0,
      pendingReviewsCount: pendingReviews[0].count,
      recentActivityCount: recentActivity[0].count,
      userActiveRate: totalUsers[0].count > 0 ? (activeUsers[0].count / totalUsers[0].count) * 100 : 0
    }

    // Calculate monthly growth
    const lastMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
    const [usersLastMonth, submissionsLastMonth] = await Promise.all([
      db.select({ count: count() })
        .from(users)
        .where(and(gte(users.createdAt, lastMonth), lte(users.createdAt, startDate))),
      
      db.select({ count: count() })
        .from(submissions)
        .where(and(gte(submissions.submittedAt, lastMonth), lte(submissions.submittedAt, startDate)))
    ])

    const monthlyGrowth = {
      users: ((activeUsers[0].count - usersLastMonth[0].count) / Math.max(usersLastMonth[0].count, 1)) * 100,
      submissions: ((totalSubmissions[0].count - submissionsLastMonth[0].count) / Math.max(submissionsLastMonth[0].count, 1)) * 100
    }

    // Top performing content (using articles table and joining with pageViews)
    const topArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        status: articles.status,
        publishedDate: articles.publishedDate,
        views: articles.views
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.views))
      .limit(10)

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers[0].count,
        activeUsers: activeUsers[0].count,
        totalSubmissions: totalSubmissions[0].count,
        pendingReviews: pendingReviews[0].count,
        publishedArticles: publishedArticles[0].count,
        totalVolumes: totalVolumes[0].count,
        totalIssues: totalIssues[0].count,
        monthlyGrowth
      },
      trends: {
        userGrowth,
        submissionTrends,
        roleDistribution,
        reviewStats
      },
      systemHealth,
      topContent: topArticles,
      timeframe,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error generating dashboard analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
