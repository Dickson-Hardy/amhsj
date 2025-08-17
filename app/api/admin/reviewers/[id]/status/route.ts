import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, reviewerProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(
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

    const { status } = await request.json()
    const reviewerId = params.id

    // Validate status and convert to isActive boolean
    const validStatuses = ["active", "inactive"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status specified. Use 'active' or 'inactive'" },
        { status: 400 }
      )
    }

    const isActive = status === "active"

    // Update reviewer status
    const updatedUser = await db
      .update(users)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(users.id, reviewerId))
      .returning()

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: "Reviewer not found" },
        { status: 404 }
      )
    }

    // If activating reviewer, ensure they have a reviewer profile
    if (isActive) {
      const existingProfile = await db
        .select()
        .from(reviewerProfiles)
        .where(eq(reviewerProfiles.userId, reviewerId))
        .limit(1)

      if (existingProfile.length === 0) {
        await db.insert(reviewerProfiles).values({
          userId: reviewerId,
          maxReviewsPerMonth: 3,
          currentReviewLoad: 0,
          completedReviews: 0,
          lateReviews: 0,
          qualityScore: 0,
          isActive: true
        })
      }
    }

    // Log the action
    console.log(`Admin ${session.user.email} updated reviewer ${reviewerId} status to ${status}`)

    return NextResponse.json({
      success: true,
      user: updatedUser[0],
      message: `Reviewer status updated to ${status}`
    })

  } catch (error) {
    console.error("Error updating reviewer status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
