import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logAdminAction } from "@/lib/admin-logger"

export async function PUT(
  req: NextRequest,
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

    const { role } = await req.json()
    const userId = params.id

    // Validate role
    const validRoles = ["admin", "editor", "reviewer", "author", "user"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      )
    }

    // Prevent self-demotion from admin
    if (session.user.id === userId && session.user.role === "admin" && role !== "admin") {
      return NextResponse.json(
        { error: "Cannot remove admin role from yourself" },
        { status: 400 }
      )
    }

    // Get current user data for logging
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (currentUser.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Update user role
    const updatedUser = await db
      .update(users)
      .set({ 
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning()

    // Log the action
    await logAdminAction({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      action: 'UPDATE_USER_ROLE',
      resourceType: 'user',
      resourceId: userId,
      details: `Changed role from ${currentUser[0].role} to ${role} for user ${currentUser[0].email}`,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    })

    console.log(`Admin ${session.user.email} updated user ${userId} role to ${role}`)

    return NextResponse.json({
      success: true,
      user: updatedUser[0],
      message: `User role updated to ${role}`
    })

  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
