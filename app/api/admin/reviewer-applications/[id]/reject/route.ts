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
    const { reason } = await req.json()
    
    // 1. Update the application status in database
    const updateResult = await updateApplicationStatus(applicationId, 'rejected', reason)
    if (!updateResult.success) {
      return NextResponse.json({ message: updateResult.error }, { status: 500 })
    }
    
    // 2. Send rejection email to the applicant with reason
    await sendRejectionEmail(updateResult.application, reason)
    
    // 3. Log the rejection for record keeping
    await logApplicationAction(applicationId, 'rejected', session.user?.email, reason)
    
    console.log(`Reviewer application ${applicationId} rejected by ${session.user?.email}`)
    
    return NextResponse.json({ 
      success: true, 
      message: "Reviewer application rejected" 
    })
    
  } catch (error) {
    console.error("Error rejecting reviewer application:", error)
    return NextResponse.json({ 
      message: "Failed to reject application" 
    }, { status: 500 })
  }
}

async function updateApplicationStatus(applicationId: string, status: string, reason?: string) {
  try {
    // In a real implementation, this would update your database
    // For example, with Prisma:
    // const application = await prisma.reviewerApplication.update({
    //   where: { id: applicationId },
    //   data: { 
    //     status: status,
    //     rejectionReason: reason,
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
      status: status,
      rejectionReason: reason
    }
    
    return { success: true, application: mockApplication }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { success: false, error: 'Failed to update application status' }
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

async function sendRejectionEmail(application: any, reason?: string) {
  try {
    // In a real implementation, this would use your email service
    // For example, with Resend, SendGrid, or Nodemailer:
    // await emailService.send({
    //   to: application.email,
    //   subject: "Reviewer Application Update - AMHSJ",
    //   html: generateRejectionEmailHTML(application, reason)
    // })
    
    const emailContent = {
      to: application.email,
      subject: "Reviewer Application Update - AMHSJ",
      body: `
        Dear ${application.firstName} ${application.lastName},
        
        Thank you for your interest in becoming a reviewer for the African Medical and Health Sciences Journal.
        
        After careful consideration by our editorial team, we are unable to approve your reviewer application at this time.
        
        ${reason ? `Reason: ${reason}` : ''}
        
        This decision does not reflect on your qualifications or expertise. We receive many excellent applications and must balance our reviewer pool across specialties and experience levels.
        
        You are welcome to reapply in the future as our needs evolve and we expand our reviewer network.
        
        Thank you for your interest in supporting medical research in Africa.
        
        Best regards,
        AMHSJ Editorial Team
        African Medical and Health Sciences Journal
      `
    }
    
    console.log('Rejection email would be sent:', emailContent)
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Error sending rejection email:', error)
  }
}
