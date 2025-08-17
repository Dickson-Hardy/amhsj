import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, submissions, reviews } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["admin", "editor-in-chief"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const userId = params.id

    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check for active submissions
    const submissionCount = await db
      .select({ count: count() })
      .from(submissions)
      .where(eq(submissions.authorId, userId))

    // Check for active reviews
    const reviewCount = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.reviewerId, userId))

    if (submissionCount[0].count > 0 || reviewCount[0].count > 0) {
      return NextResponse.json({
        error: "Cannot delete user with active submissions or reviews",
        details: {
          submissions: submissionCount[0].count,
          reviews: reviewCount[0].count
        }
      }, { status: 400 })
    }

    // Delete user
    await db
      .delete(users)
      .where(eq(users.id, userId))

    // Log the action
    console.log(`Admin ${session.user.email} deleted user ${userId} (${user[0].email})`)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["admin", "editor-in-chief"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const userId = params.id

    // Get user details with related data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get submission count
    const submissionCount = await db
      .select({ count: count() })
      .from(submissions)
      .where(eq(submissions.authorId, userId))

    // Get review count
    const reviewCount = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.reviewerId, userId))

    return NextResponse.json({
      user: user[0],
      stats: {
        submissions: submissionCount[0].count,
        reviews: reviewCount[0].count
      }
    })

  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
