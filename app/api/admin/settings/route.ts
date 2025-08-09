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

    const settings = await request.json()
    
    // Save settings to database
    await saveJournalSettings(settings)
    
    // Log the settings change
    await logSettingsChange(session.user?.email || '', settings)
    
    return NextResponse.json({
      success: true,
      message: "Settings saved successfully"
    })
    
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}

async function saveJournalSettings(settings: any) {
  try {
    // In a real implementation, save to your database:
    // await prisma.journalSettings.upsert({
    //   where: { id: 'default' },
    //   update: {
    //     reviewPeriodDays: settings.reviewPeriod,
    //     minimumReviewers: settings.minimumReviewers,
    //     updatedAt: new Date()
    //   },
    //   create: {
    //     id: 'default',
    //     reviewPeriodDays: settings.reviewPeriod,
    //     minimumReviewers: settings.minimumReviewers,
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   }
    // })
    
    console.log("Settings saved:", settings)
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Error saving journal settings:', error)
    throw new Error('Failed to save settings to database')
  }
}

async function logSettingsChange(adminEmail: string, settings: any) {
  try {
    // In a real implementation, log the change:
    // await prisma.adminLog.create({
    //   data: {
    //     action: 'SETTINGS_UPDATED',
    //     performedBy: adminEmail,
    //     details: JSON.stringify(settings),
    //     timestamp: new Date()
    //   }
    // })
    
    console.log(`Settings change logged by ${adminEmail}:`, settings)
  } catch (error) {
    console.error('Error logging settings change:', error)
  }
}
