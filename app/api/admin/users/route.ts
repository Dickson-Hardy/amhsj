import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, submissions, reviews } from "@/lib/db/schema"
import { desc, ilike, eq, count, sql, and } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "editor-in-chief"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Build query conditions
    const conditions = []
    
    if (search) {
      conditions.push(ilike(users.name, `%${search}%`))
    }

    if (role && role !== "all") {
      conditions.push(eq(users.role, role))
    }

    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLoginAt: users.lastActiveAt
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)

    // Get stats for all users
    const totalUsers = userList.length
    const activeUsers = userList.filter(u => u.isActive === true).length
    const pendingUsers = userList.filter(u => u.isVerified === false).length
    const adminUsers = userList.filter(u => u.role === 'admin').length
    const editorUsers = userList.filter(u => u.role === 'editor').length
    const reviewerUsers = userList.filter(u => u.role === 'reviewer').length
    const authorUsers = userList.filter(u => u.role === 'author').length

    // Get submission and review counts for each user
    const usersWithCounts = await Promise.all(
      userList.map(async (user) => {
        const submissionCount = await db
          .select({ count: count() })
          .from(submissions)
          .where(sql`${submissions.authorId} = ${user.id}`)

        const reviewCount = await db
          .select({ count: count() })
          .from(reviews)
          .where(sql`${reviews.reviewerId} = ${user.id}`)

        return {
          ...user,
          submissionsCount: submissionCount[0]?.count || 0,
          reviewsCount: reviewCount[0]?.count || 0,
          joinDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'Unknown',
          lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString().split('T')[0] : 'Never'
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: usersWithCounts,
      stats: {
        totalUsers,
        activeUsers,
        pendingUsers,
        adminUsers,
        editorUsers,
        reviewerUsers,
        authorUsers
      }
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/admin/users" })
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}
