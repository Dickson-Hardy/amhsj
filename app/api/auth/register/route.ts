import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, userApplications, userQualifications, userPublications, userReferences, reviewerProfiles, editorProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { sendEmailVerification } from "@/lib/email-hybrid"
import crypto from "crypto"
import { 
  RegistrationData
} from "@/types/registration"

export async function POST(request: NextRequest) {
  try {
    const rawData: RegistrationData = await request.json()

    // Normalize data structure - handle both nested and flat formats
    let registrationData: RegistrationData
    
    if (rawData.basicInfo) {
      // Handle nested structure from enhanced signup page
      registrationData = {
        name: rawData.basicInfo.name,
        email: rawData.basicInfo.email,
        password: rawData.basicInfo.password,
        affiliation: rawData.basicInfo.affiliation,
        orcid: rawData.basicInfo.orcid,
        role: rawData.basicInfo.role,
        researchInterests: rawData.basicInfo.researchInterests,
        // Merge role-specific data
        ...rawData.roleSpecificData
      }
    } else {
      // Handle flat structure from simple signup page
      registrationData = rawData
    }

    // Validate required fields
    if (!registrationData.email || !registrationData.password || !registrationData.name || !registrationData.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, registrationData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registrationData.password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Calculate profile completeness
    const profileCompleteness = calculateProfileCompleteness(registrationData)

    // Create user with enhanced fields
    const [newUser] = await db
      .insert(users)
      .values({
        email: registrationData.email,
        password: hashedPassword,
        name: registrationData.name,
        role: registrationData.role,
        affiliation: registrationData.affiliation,
        orcid: registrationData.orcid,
        researchInterests: Array.isArray(registrationData.researchInterests) && registrationData.researchInterests.length > 0 
          ? registrationData.researchInterests 
          : null,
        expertise: Array.isArray(registrationData.expertise) && registrationData.expertise.length > 0 
          ? registrationData.expertise 
          : null,
        specializations: Array.isArray(registrationData.specializations) && registrationData.specializations.length > 0 
          ? registrationData.specializations 
          : null,
        languagesSpoken: Array.isArray(registrationData.languagesSpoken) && registrationData.languagesSpoken.length > 0 
          ? registrationData.languagesSpoken 
          : null,
        isVerified: false,
        emailVerificationToken: verificationToken,
        profileCompleteness,
        applicationStatus: registrationData.role === "author" ? "approved" : "pending",
        isActive: true,
      })
      .returning()

    // Handle role-specific registration
    await handleRoleSpecificRegistration(newUser.id, registrationData.role, registrationData)

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}&email=${registrationData.email}`
    await sendEmailVerification(registrationData.email, registrationData.name, verificationUrl)

    return NextResponse.json(
      { 
        message: getRegistrationMessage(registrationData.role),
        userId: newUser.id,
        requiresApproval: registrationData.role !== "author"
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleRoleSpecificRegistration(
  userId: string, 
  role: string, 
  registrationData: RegistrationData
) {
  if (role === "reviewer") {
    // Create reviewer profile
    await db.insert(reviewerProfiles).values({
      userId,
      maxReviewsPerMonth: registrationData.maxReviewsPerMonth || 3,
      availabilityStatus: registrationData.availabilityStatus || "available",
    })

    // Create application record
    await db.insert(userApplications).values({
      userId,
      requestedRole: "reviewer",
      currentRole: "author",
      applicationData: registrationData,
      status: "pending",
    })

    // Add qualifications
    if (registrationData.qualifications?.length) {
      for (const qual of registrationData.qualifications) {
        await db.insert(userQualifications).values({
          userId,
          type: "degree",
          title: qual.degree,
          institution: qual.institution,
          endDate: new Date(qual.year, 0, 1),
          description: qual.field,
        })
      }
    }

    // Add publications
    if (registrationData.publications?.length) {
      for (const pub of registrationData.publications) {
        await db.insert(userPublications).values({
          userId,
          title: pub.title,
          journal: pub.journal,
          year: pub.year,
          doi: pub.doi,
          authorRole: pub.role,
        })
      }
    }

    // Add references
    if (registrationData.references?.length) {
      for (const ref of registrationData.references) {
        await db.insert(userReferences).values({
          userId,
          referenceName: ref.name,
          referenceEmail: ref.email,
          referenceAffiliation: ref.affiliation,
          relationship: ref.relationship,
        })
      }
    }
  }

  if (role === "editor") {
    // Create editor profile
    await db.insert(editorProfiles).values({
      userId,
      editorType: "associate", // Default type
      assignedSections: registrationData.specializations || [],
      editorialExperience: registrationData.editorialExperience 
        ? JSON.stringify(registrationData.editorialExperience)
        : null,
      maxWorkload: 10, // Default workload
    })

    // Create application record
    await db.insert(userApplications).values({
      userId,
      requestedRole: "editor",
      currentRole: "author",
      applicationData: registrationData,
      status: "pending",
    })

    // Add qualifications
    if (registrationData.qualifications?.length) {
      for (const qual of registrationData.qualifications) {
        await db.insert(userQualifications).values({
          userId,
          type: "degree",
          title: qual.degree,
          institution: qual.institution,
          endDate: new Date(qual.year, 0, 1),
          description: qual.field,
        })
      }
    }

    // Add publications
    if (registrationData.publications?.length) {
      for (const pub of registrationData.publications) {
        await db.insert(userPublications).values({
          userId,
          title: pub.title,
          journal: pub.journal,
          year: pub.year,
          doi: pub.doi,
          authorRole: pub.role,
        })
      }
    }

    // Add references
    if (registrationData.references?.length) {
      for (const ref of registrationData.references) {
        await db.insert(userReferences).values({
          userId,
          referenceName: ref.name,
          referenceEmail: ref.email,
          referenceAffiliation: ref.affiliation,
          relationship: ref.relationship,
        })
      }
    }
  }
}

function calculateProfileCompleteness(data: RegistrationData): number {
  let score = 0

  // Basic info (40%)
  if (data.name) score += 10
  if (data.email) score += 10
  if (data.affiliation) score += 10
  if (data.researchInterests?.length) score += 10

  // Additional info (30%)
  if (data.orcid) score += 10
  if (data.expertise?.length) score += 10
  if (data.languagesSpoken?.length) score += 10

  // Role-specific data (30%)
  if (data.role === "reviewer" || data.role === "editor") {
    if (data.qualifications?.length) score += 10
    if (data.publications?.length) score += 10
    if (data.references?.length) score += 10
  } else {
    score += 30 // Authors get full score for role-specific
  }

  return Math.min(score, 100)
}

function getRegistrationMessage(role: string): string {
  switch (role) {
    case "reviewer":
      return "Reviewer application submitted successfully. Please check your email for verification. Your application will be reviewed by our editorial team."
    case "editor":
      return "Editor application submitted successfully. Please check your email for verification. Your application will be reviewed by our editorial board."
    default:
      return "User created successfully. Please check your email for verification."
  }
}
