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

    // Basic sanitization and normalization
    const role = (registrationData.role || "author").toLowerCase()
    if (!['author', 'reviewer', 'editor'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const toStringArray = (val: unknown): string[] | undefined => {
      if (!val) return undefined
      if (Array.isArray(val)) return val.map(v => String(v)).filter(Boolean)
      return [String(val)].filter(Boolean)
    }

    const safeQualifications = Array.isArray(registrationData.qualifications)
      ? registrationData.qualifications.map(q => ({
          degree: String(q.degree ?? ""),
          institution: String(q.institution ?? ""),
          year: Number(q.year ?? new Date().getFullYear()),
          field: String(q.field ?? "")
        }))
      : undefined

    const safePublications = Array.isArray(registrationData.publications)
      ? registrationData.publications.map(p => ({
          title: String(p.title ?? ""),
          journal: String(p.journal ?? ""),
          year: Number(p.year ?? new Date().getFullYear()),
          doi: p.doi ? String(p.doi) : undefined,
          role: p.role as any
        }))
      : undefined

    const safeReferences = Array.isArray(registrationData.references)
      ? registrationData.references.map(r => ({
          name: String(r.name ?? ""),
          email: String(r.email ?? ""),
          affiliation: String(r.affiliation ?? ""),
          relationship: String(r.relationship ?? "")
        }))
      : undefined

    const normalized: RegistrationData = {
      ...registrationData,
      role: role as any,
      researchInterests: toStringArray(registrationData.researchInterests),
      expertise: toStringArray(registrationData.expertise),
      specializations: toStringArray((registrationData as any).specializations),
      languagesSpoken: toStringArray(registrationData.languagesSpoken),
      qualifications: safeQualifications,
      publications: safePublications,
      references: safeReferences,
    }

    // Validate required fields
    if (!normalized.email || !normalized.password || !normalized.name || !normalized.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalized.email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(normalized.password!, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Calculate profile completeness
    const profileCompleteness = calculateProfileCompleteness(normalized)

    // Execute all DB writes in a transaction for consistency
    let newUserArr
    try {
      newUserArr = await db.transaction(async (tx) => {
        const inserted = await tx
          .insert(users)
          .values({
            email: normalized.email!,
            password: hashedPassword,
            name: normalized.name!,
            role: normalized.role!,
            affiliation: normalized.affiliation,
            orcid: normalized.orcid,
            researchInterests: normalized.researchInterests && normalized.researchInterests.length > 0 ? normalized.researchInterests : [],
            expertise: normalized.expertise && normalized.expertise.length > 0 ? normalized.expertise : [],
            specializations: normalized.specializations && normalized.specializations.length > 0 ? normalized.specializations : [],
            languagesSpoken: normalized.languagesSpoken && normalized.languagesSpoken.length > 0 ? normalized.languagesSpoken : [],
            isVerified: false,
            emailVerificationToken: verificationToken,
            profileCompleteness,
            applicationStatus: normalized.role === "author" ? "approved" : "pending",
            isActive: true,
          })
          .returning()

  const createdUser = inserted[0]
  await handleRoleSpecificRegistrationTx(tx as any, createdUser.id, normalized.role!, normalized)
        return inserted
      })
    } catch (txErr) {
      // Fallback: sequential writes without a transaction (for drivers without tx support)
      console.warn("Transaction not supported or failed; falling back to sequential writes:", txErr)
      const inserted = await db
        .insert(users)
        .values({
          email: normalized.email!,
          password: hashedPassword,
          name: normalized.name!,
          role: normalized.role!,
          affiliation: normalized.affiliation,
          orcid: normalized.orcid,
          researchInterests: normalized.researchInterests && normalized.researchInterests.length > 0 ? normalized.researchInterests : [],
          expertise: normalized.expertise && normalized.expertise.length > 0 ? normalized.expertise : [],
          specializations: normalized.specializations && normalized.specializations.length > 0 ? normalized.specializations : [],
          languagesSpoken: normalized.languagesSpoken && normalized.languagesSpoken.length > 0 ? normalized.languagesSpoken : [],
          isVerified: false,
          emailVerificationToken: verificationToken,
          profileCompleteness,
          applicationStatus: normalized.role === "author" ? "approved" : "pending",
          isActive: true,
        })
        .returning()

      const createdUser = inserted[0]
  await handleRoleSpecificRegistration(createdUser.id, normalized.role!, normalized)
      newUserArr = inserted
    }

    const [newUser] = newUserArr

    // Send verification email (best-effort)
    const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.origin}`
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalized.email!)}`
    try {
      await sendEmailVerification(normalized.email!, normalized.name!, verificationUrl)
    } catch (e) {
      console.warn("Email verification send failed, continuing registration:", e)
    }

    return NextResponse.json(
      { 
        message: getRegistrationMessage(normalized.role!),
        userId: newUser.id,
        requiresApproval: normalized.role !== "author"
      },
      { status: 201 }
    )
  } catch (error: any) {
    const code = (error as any)?.code || (error as any)?.original?.code
    const msg = (error as any)?.message || "Internal server error"
    console.error("Registration error:", { message: msg, code, stack: (error as any)?.stack })
    // Map common Postgres errors to friendly responses
    if (code === '23505') {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }
    if (code === '22P02' || code === '22001') {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

// Transaction-scoped version to ensure all writes are part of the same transaction
async function handleRoleSpecificRegistrationTx(
  tx: any,
  userId: string,
  role: string,
  registrationData: RegistrationData
) {
  if (role === "reviewer") {
    await tx.insert(reviewerProfiles).values({
      userId,
      maxReviewsPerMonth: registrationData.maxReviewsPerMonth || 3,
      availabilityStatus: registrationData.availabilityStatus || "available",
    })

    await tx.insert(userApplications).values({
      userId,
      requestedRole: "reviewer",
      currentRole: "author",
      applicationData: buildApplicationData(registrationData),
      status: "pending",
    })

    if (registrationData.qualifications?.length) {
      for (const qual of registrationData.qualifications) {
        await tx.insert(userQualifications).values({
          userId,
          type: "degree",
          title: qual.degree,
          institution: qual.institution,
          endDate: new Date(qual.year, 0, 1),
          description: qual.field,
        })
      }
    }

    if (registrationData.publications?.length) {
      for (const pub of registrationData.publications) {
        await tx.insert(userPublications).values({
          userId,
          title: pub.title,
          journal: pub.journal,
          year: pub.year,
          doi: pub.doi,
          authorRole: pub.role,
        })
      }
    }

    if (registrationData.references?.length) {
      for (const ref of registrationData.references) {
        await tx.insert(userReferences).values({
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
    await tx.insert(editorProfiles).values({
      userId,
      editorType: "associate",
      assignedSections: registrationData.specializations || [],
      editorialExperience: registrationData.editorialExperience 
        ? JSON.stringify(registrationData.editorialExperience)
        : null,
      maxWorkload: 10,
    })

    await tx.insert(userApplications).values({
      userId,
      requestedRole: "editor",
      currentRole: "author",
      applicationData: buildApplicationData(registrationData),
      status: "pending",
    })

    if (registrationData.qualifications?.length) {
      for (const qual of registrationData.qualifications) {
        await tx.insert(userQualifications).values({
          userId,
          type: "degree",
          title: qual.degree,
          institution: qual.institution,
          endDate: new Date(qual.year, 0, 1),
          description: qual.field,
        })
      }
    }

    if (registrationData.publications?.length) {
      for (const pub of registrationData.publications) {
        await tx.insert(userPublications).values({
          userId,
          title: pub.title,
          journal: pub.journal,
          year: pub.year,
          doi: pub.doi,
          authorRole: pub.role,
        })
      }
    }

    if (registrationData.references?.length) {
      for (const ref of registrationData.references) {
        await tx.insert(userReferences).values({
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

function buildApplicationData(data: RegistrationData) {
  // Keep only JSON-serializable, relevant fields for the applicationData JSONB column
  return {
    role: data.role,
    expertise: data.expertise || [],
    specializations: (data as any).specializations || [],
    languagesSpoken: data.languagesSpoken || [],
    qualifications: data.qualifications || [],
    publications: data.publications || [],
    references: data.references || [],
    editorialExperience: data.editorialExperience || [],
    academicBackground: (data as any).academicBackground,
    previousEditorialRoles: (data as any).previousEditorialRoles || [],
    orcid: data.orcid,
    affiliation: data.affiliation,
    researchInterests: data.researchInterests || [],
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
