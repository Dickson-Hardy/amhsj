import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, editorProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const userProfile = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        affiliation: users.affiliation,
        specializations: users.specializations,
        expertise: users.expertise,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!userProfile.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userProfile[0]
    let editorProfile = null

    // Get editor profile if user is an editor
    const allowedRoles = ["section-editor", "managing-editor", "editor-in-chief", "admin"]
    if (allowedRoles.includes(user.role || "")) {
      const editorProfileResult = await db
        .select({
          editorType: editorProfiles.editorType,
          assignedSections: editorProfiles.assignedSections,
          currentWorkload: editorProfiles.currentWorkload,
          maxWorkload: editorProfiles.maxWorkload,
          isAcceptingSubmissions: editorProfiles.isAcceptingSubmissions,
        })
        .from(editorProfiles)
        .where(eq(editorProfiles.userId, session.user.id))
        .limit(1)

      if (editorProfileResult.length) {
        editorProfile = editorProfileResult[0]
      }
    }

    // Determine user's primary section
    let primarySection = "General"
    if (editorProfile?.assignedSections && editorProfile.assignedSections.length > 0) {
      primarySection = editorProfile.assignedSections[0]
    } else if (user.specializations && user.specializations.length > 0) {
      primarySection = user.specializations[0]
    } else if (user.expertise && user.expertise.length > 0) {
      primarySection = user.expertise[0]
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        editorProfile,
        primarySection,
        availableSections: editorProfile?.assignedSections || [primarySection],
      },
    })
  } catch (error) {
    logError(error as Error, { endpoint: `/api/user/profile` })
    return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 })
  }
}
