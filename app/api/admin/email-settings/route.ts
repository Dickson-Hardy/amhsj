import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const emailSettings = await request.json()
    
    // Save email settings to database
    await saveEmailSettings(emailSettings)
    
    // Log the settings change
    await logEmailSettingsChange(session.user?.email || '', emailSettings)
    
    return NextResponse.json({
      success: true,
      message: "Email settings updated successfully"
    })
    
  } catch (error) {
    console.error("Error saving email settings:", error)
    return NextResponse.json(
      { error: "Failed to save email settings" },
      { status: 500 }
    )
  }
}

async function saveEmailSettings(emailSettings: any) {
  try {
    // In a real implementation, save to your database:
    // await prisma.emailSettings.upsert({
    //   where: { id: 'default' },
    //   update: {
    //     submissionConfirmations: emailSettings.submissionConfirmations,
    //     reviewAssignments: emailSettings.reviewAssignments,
    //     publicationNotifications: emailSettings.publicationNotifications,
    //     updatedAt: new Date()
    //   },
    //   create: {
    //     id: 'default',
    //     submissionConfirmations: emailSettings.submissionConfirmations ?? true,
    //     reviewAssignments: emailSettings.reviewAssignments ?? true,
    //     publicationNotifications: emailSettings.publicationNotifications ?? true,
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   }
    // })
    
    console.log("Email settings saved:", emailSettings)
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Error saving email settings:', error)
    throw new Error('Failed to save email settings to database')
  }
}

async function logEmailSettingsChange(adminEmail: string, settings: any) {
  try {
    // In a real implementation, log the change:
    // await prisma.adminLog.create({
    //   data: {
    //     action: 'EMAIL_SETTINGS_UPDATED',
    //     performedBy: adminEmail,
    //     details: JSON.stringify(settings),
    //     timestamp: new Date()
    //   }
    // })
    
    console.log(`Email settings change logged by ${adminEmail}:`, settings)
  } catch (error) {
    console.error('Error logging email settings change:', error)
  }
}
