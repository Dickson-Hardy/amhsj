import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
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
    const userId = params.id

    // Validate status and convert to isActive boolean
    const validStatuses = ["active", "inactive"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status specified. Use 'active' or 'inactive'" },
        { status: 400 }
      )
    }

    const isActive = status === "active"

    // Prevent self-deactivation
    if (session.user.id === userId && !isActive) {
      return NextResponse.json(
        { error: "Cannot deactivate yourself" },
        { status: 400 }
      )
    }

    // Update user status
    const updatedUser = await db
      .update(users)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning()

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Log the action
    console.log(`Admin ${session.user.email} updated user ${userId} status to ${status}`)

    return NextResponse.json({
      success: true,
      user: updatedUser[0],
      message: `User status updated to ${status}`
    })

  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
