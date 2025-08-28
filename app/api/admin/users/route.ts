import { NextRequest, NextResponse } from "next/server"
import * as crypto from "crypto"
import { requireAuth, ROLES } from "@/lib/api-utils"
import { 
  createApiResponse, 
  createErrorResponse, 
  parseQueryParams,
  createPaginatedResponse,
  withErrorHandler,
  handleDatabaseError
} from "@/lib/api-utils"
import { db } from "@/lib/db"
import { users, submissions, reviews } from "@/lib/db/schema"
import { desc, ilike, eq, count, sql, and } from "drizzle-orm"
import { logger } from "@/lib/logger"

async function getUsers(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    // Authenticate and authorize
    const session = await requireAuth(request, [ROLES.ADMIN])
    
    logger.api("Admin users request initiated", {
      userId: session.user.id,
      userRole: session.user.role,
      requestId,
      endpoint: "/api/admin/users"
    })

    // Parse query parameters
    const { page, limit, search } = parseQueryParams(request)
    const role = request.nextUrl.searchParams.get("role")
    const offset = (page - 1) * limit

    // Build query conditions
    const conditions = []
    
    if (search) {
      conditions.push(ilike(users.name, `%${search}%`))
    }

    if (role && role !== "all") {
      conditions.push(eq(users.role, role))
    }

    // Get users with pagination
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

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const totalUsers = totalCountResult[0]?.count || 0

    // Get stats for all users
    const stats = {
      totalUsers,
      activeUsers: userList.filter(u => u.isActive === true).length,
      pendingUsers: userList.filter(u => u.isVerified === false).length,
      adminUsers: userList.filter(u => u.role === ROLES.ADMIN).length,
      editorUsers: userList.filter(u => u.role === ROLES.ASSOCIATE_EDITOR).length,
      reviewerUsers: userList.filter(u => u.role === ROLES.REVIEWER).length,
      authorUsers: userList.filter(u => u.role === ROLES.AUTHOR).length
    }

    // Get submission and review counts for each user
    const usersWithCounts = await Promise.all(
      userList.map(async (user) => {
        try {
          const [submissionCount, reviewCount] = await Promise.all([
            db.select({ count: count() })
              .from(submissions)
              .where(sql`${submissions.authorId} = ${user.id}`),
            db.select({ count: count() })
              .from(reviews)
              .where(sql`${reviews.reviewerId} = ${user.id}`)
          ])

          return {
            ...user,
            submissionsCount: submissionCount[0]?.count || 0,
            reviewsCount: reviewCount[0]?.count || 0,
            joinDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'Unknown',
            lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString().split('T')[0] : 'Never'
          }
        } catch (error) {
          logger.error("Failed to get user counts", {
            userId: user.id,
            error: error instanceof Error ? error.message : String(error),
            requestId
          })
          
          return {
            ...user,
            submissionsCount: 0,
            reviewsCount: 0,
            joinDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'Unknown',
            lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString().split('T')[0] : 'Never'
          }
        }
      })
    )

    logger.api("Admin users request completed", {
      userId: session.user.id,
      userCount: usersWithCounts.length,
      totalUsers,
      requestId
    })

    return createPaginatedResponse(
      usersWithCounts,
      { page, limit, total: totalUsers },
      "Users retrieved successfully",
      requestId
    )

  } catch (error) {
    if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
      throw error
    }
    
    return handleDatabaseError(error)
  }
}

export const GET = withErrorHandler(getUsers)
