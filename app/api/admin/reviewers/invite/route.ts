import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, reviewerProfiles, userApplications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { sendEmail } from "@/lib/email-hybrid"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["admin", "editor-in-chief"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { email, name, affiliation, expertise } = await request.json()

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create invitation token
    const invitationToken = nanoid(32)
    
    // Create user application record with proper fields
    const application = await db
      .insert(userApplications)
      .values({
        userId: nanoid(), // Temporary ID until user registers
        requestedRole: "reviewer",
        currentRole: "guest",
        status: "invited",
        applicationData: {
          email,
          name,
          affiliation: affiliation || "",
          expertise: expertise || [],
          invitationToken,
          invitedBy: session.user.id
        },
        reviewedBy: session.user.id
      })
      .returning()

    // Send invitation email
    const invitationLink = `${process.env.NEXTAUTH_URL}/auth/signup?token=${invitationToken}&type=reviewer`
    
    try {
      await sendEmail({
        to: email,
        subject: "Invitation to Join AMHSJ as a Reviewer",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #1e40af;">Invitation to Join AMHSJ Medical Journal</h2>
            
            <p>Dear ${name},</p>
            
            <p>You have been invited to join the American Medical High School Journal (AMHSJ) as a peer reviewer. We believe your expertise would be valuable to our journal's mission of promoting high-quality medical research.</p>
            
            <p><strong>Your invitation details:</strong></p>
            <ul>
              <li>Name: ${name}</li>
              <li>Email: ${email}</li>
              ${affiliation ? `<li>Affiliation: ${affiliation}</li>` : ''}
              ${expertise && expertise.length > 0 ? `<li>Areas of Expertise: ${expertise.join(", ")}</li>` : ''}
            </ul>
            
            <p>To accept this invitation and create your reviewer account, please click the link below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
            </div>
            
            <p>This invitation will expire in 7 days. If you have any questions, please contact us at admin@amhsj.com.</p>
            
            <p>Best regards,<br>The AMHSJ Editorial Team</p>
            
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;">
            <p style="font-size: 12px; color: #666;">This is an automated email from the American Medical High School Journal. Please do not reply to this email.</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError)
      // Continue anyway - admin can manually send invitation
    }

    // Log the action
    console.log(`Admin ${session.user.email} invited reviewer: ${email}`)

    return NextResponse.json({
      success: true,
      application: application[0],
      invitationLink,
      message: `Invitation sent to ${email}`
    })

  } catch (error) {
    console.error("Error inviting reviewer:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
