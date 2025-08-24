import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, editorProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logError } from "@/lib/logger"
import { ProfileCompletenessService } from "@/lib/profile-completeness"

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
        bio: users.bio,
        orcid: users.orcid,
        orcidVerified: users.orcidVerified,
        specializations: users.specializations,
        expertise: users.expertise,
        researchInterests: users.researchInterests,
        languagesSpoken: users.languagesSpoken,
        profileCompleteness: users.profileCompleteness,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
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

    // Calculate real-time profile completeness
    const completenessResult = await ProfileCompletenessService.getUserProfileCompleteness(session.user.id)
    
    // Update the profile completeness in the database if it's different
    if (completenessResult.score !== (user.profileCompleteness || 0)) {
      await ProfileCompletenessService.updateProfileCompleteness(session.user.id)
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
        profileCompleteness: completenessResult.score, // Use real-time calculation
        editorProfile,
        primarySection,
        availableSections: editorProfile?.assignedSections || [primarySection],
        // Add completeness details
        completenessDetails: {
          score: completenessResult.score,
          missingFields: completenessResult.missingFields,
          recommendations: completenessResult.recommendations,
          isComplete: completenessResult.isComplete,
          canSubmitArticles: completenessResult.isComplete
        }
      },
    })
  } catch (error) {
    logError(error as Error, { endpoint: `/api/user/profile` })
    return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      affiliation,
      bio,
      orcid,
      expertise,
      specializations,
      researchInterests,
      languagesSpoken,
      profileCompleteness
    } = body

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }

    // Update user profile
    const updatedProfile = await db
      .update(users)
      .set({
        name: name.trim(),
        affiliation: affiliation?.trim() || null,
        bio: bio?.trim() || null,
        orcid: orcid?.trim() || null,
        expertise: expertise || [],
        specializations: specializations || [],
        researchInterests: researchInterests || [],
        languagesSpoken: languagesSpoken || [],
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        affiliation: users.affiliation,
        bio: users.bio,
        orcid: users.orcid,
        orcidVerified: users.orcidVerified,
        specializations: users.specializations,
        expertise: users.expertise,
        researchInterests: users.researchInterests,
        languagesSpoken: users.languagesSpoken,
        profileCompleteness: users.profileCompleteness,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })

    // Update profile completeness after profile changes
    const newCompleteness = await ProfileCompletenessService.updateProfileCompleteness(session.user.id)

    if (!updatedProfile.length) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedProfile[0],
        profileCompleteness: newCompleteness
      },
      message: "Profile updated successfully",
      completenessUpdated: true,
      newScore: newCompleteness
    })
  } catch (error) {
    logError(error as Error, { endpoint: `/api/user/profile`, action: 'update' })
    return NextResponse.json({ success: false, error: "Failed to update user profile" }, { status: 500 })
  }
}
