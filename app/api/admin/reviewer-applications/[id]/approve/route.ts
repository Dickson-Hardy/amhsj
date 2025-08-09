import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const applicationId = params.id
    
    // 1. Update the application status in database
    const updateResult = await updateApplicationStatus(applicationId, 'approved')
    if (!updateResult.success) {
      return NextResponse.json({ message: updateResult.error }, { status: 500 })
    }
    
    // 2. Update the user's role to 'reviewer'
    const userUpdateResult = await updateUserRole(updateResult.application.email, 'reviewer')
    if (!userUpdateResult.success) {
      console.warn('Failed to update user role:', userUpdateResult.error)
    }
    
    // 3. Send approval email to the applicant
    await sendApprovalEmail(updateResult.application)
    
    // 4. Add them to reviewer database/list
    await addToReviewerDatabase(updateResult.application)
    
    // 5. Log the approval action
    await logApplicationAction(applicationId, 'approved', session.user?.email)
    
    console.log(`Reviewer application ${applicationId} approved by ${session.user?.email}`)
    
    return NextResponse.json({ 
      success: true, 
      message: "Reviewer application approved successfully" 
    })
    
  } catch (error) {
    console.error("Error approving reviewer application:", error)
    return NextResponse.json({ 
      message: "Failed to approve application" 
    }, { status: 500 })
  }
}

async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    // In a real implementation, this would update your database
    // For example, with Prisma:
    // const application = await prisma.reviewerApplication.update({
    //   where: { id: applicationId },
    //   data: { 
    //     status: status,
    //     approvedAt: new Date(),
    //     updatedAt: new Date()
    //   },
    //   include: { user: true }
    // })
    
    // Mock implementation
    const mockApplication = {
      id: applicationId,
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@university.edu",
      primarySpecialty: "Cardiology",
      institution: "University Medical Center",
      status: status
    }
    
    return { success: true, application: mockApplication }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { success: false, error: 'Failed to update application status' }
  }
}

async function updateUserRole(userEmail: string, newRole: string) {
  try {
    // In a real implementation, this would update the user's role in your database
    // For example, with Prisma:
    // const user = await prisma.user.update({
    //   where: { email: userEmail },
    //   data: { role: newRole }
    // })
    
    console.log(`Updated user ${userEmail} role to ${newRole}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error: 'Failed to update user role' }
  }
}

async function addToReviewerDatabase(application: any) {
  try {
    // In a real implementation, this would add reviewer-specific data
    // For example, with Prisma:
    // await prisma.reviewer.create({
    //   data: {
    //     userId: application.userId,
    //     specialties: application.secondarySpecialties,
    //     primarySpecialty: application.primarySpecialty,
    //     availability: 'active',
    //     maxReviewsPerMonth: parseInt(application.reviewFrequency.split('-')[1] || '6'),
    //     languageProficiency: application.languageProficiency,
    //     conflictInstitutions: application.conflictInstitutions
    //   }
    // })
    
    console.log(`Added ${application.firstName} ${application.lastName} to reviewer database`)
  } catch (error) {
    console.error('Error adding to reviewer database:', error)
  }
}

async function logApplicationAction(applicationId: string, action: string, adminEmail?: string, notes?: string) {
  try {
    // In a real implementation, this would log to your database
    // For example, with Prisma:
    // await prisma.applicationLog.create({
    //   data: {
    //     applicationId: applicationId,
    //     action: action,
    //     performedBy: adminEmail,
    //     notes: notes,
    //     timestamp: new Date()
    //   }
    // })
    
    console.log(`Action logged: ${action} on application ${applicationId} by ${adminEmail}`)
    if (notes) console.log(`Notes: ${notes}`)
  } catch (error) {
    console.error('Error logging application action:', error)
  }
}

async function sendApprovalEmail(application: any) {
  try {
    // In a real implementation, this would use your email service
    // For example, with Resend, SendGrid, or Nodemailer:
    // await emailService.send({
    //   to: application.email,
    //   subject: "Reviewer Application Approved - Welcome to AMHSJ",
    //   html: generateApprovalEmailHTML(application)
    // })
    
    const emailContent = {
      to: application.email,
      subject: "Reviewer Application Approved - Welcome to AMHSJ",
      body: `
        Dear ${application.firstName} ${application.lastName},
        
        Congratulations! Your application to become a reviewer for the African Medical and Health Sciences Journal has been approved.
        
        Welcome to our expert reviewer network! As a specialist in ${application.primarySpecialty} from ${application.institution}, you bring valuable expertise to our editorial process.
        
        What happens next:
        
        1. You will receive access to our reviewer portal within 24 hours
        2. Our editorial team will send you reviewer guidelines and best practices
        3. You'll receive information about our review process and timeline expectations
        4. Your first review assignment may come within the next few weeks, depending on submissions in your area of expertise
        
        Your commitment to advancing medical science in Africa is greatly appreciated. Together, we can maintain the highest standards of research publication and contribute to improving healthcare outcomes across the continent.
        
        If you have any questions, please don't hesitate to contact our editorial office.
        
        Welcome aboard!
        
        Best regards,
        AMHSJ Editorial Team
        African Medical and Health Sciences Journal
        
        ---
        Next Steps:
        - Check your email for reviewer portal access
        - Review our submission guidelines at: ${process.env.NEXTAUTH_URL}/reviewer/guidelines
        - Update your profile preferences in the reviewer portal
      `
    }
    
    console.log('Approval email would be sent:', emailContent)
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Error sending approval email:', error)
  }
}
