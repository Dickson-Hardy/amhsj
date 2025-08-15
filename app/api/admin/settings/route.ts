import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await loadJournalSettings()
    
    return NextResponse.json({
      success: true,
      data: settings
    })
    
  } catch (error) {
    console.error("Error loading settings:", error)
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    )
  }
}

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

async function loadJournalSettings() {
  try {
    const result = await db.execute(sql`
      SELECT settings_data FROM journal_settings WHERE id = 'default'
    `)
    
    if (result.length > 0) {
      return JSON.parse((result[0] as any).settings_data)
    }
    
    // Return default settings if none found
    return {
      journalName: "Academic Medical Journal of Health Sciences",
      issn: "2789-4567",
      description: "A peer-reviewed medical journal focused on health sciences research and clinical practice.",
      reviewPeriod: 21,
      minimumReviewers: 2,
      enableOpenAccess: true,
      enableSubmissions: true,
      requireOrcid: false,
      emailNotifications: true
    }
  } catch (error) {
    console.error('Error loading journal settings:', error)
    // Return default settings on error
    return {
      journalName: "Academic Medical Journal of Health Sciences", 
      issn: "2789-4567",
      description: "A peer-reviewed medical journal focused on health sciences research and clinical practice.",
      reviewPeriod: 21,
      minimumReviewers: 2,
      enableOpenAccess: true,
      enableSubmissions: true,
      requireOrcid: false,
      emailNotifications: true
    }
  }
}

async function saveJournalSettings(settings: any) {
  try {
    // Save to database using raw SQL for flexibility
    await db.execute(sql`
      INSERT INTO journal_settings (id, settings_data, review_period_days, minimum_reviewers, updated_at)
      VALUES ('default', ${JSON.stringify(settings)}, ${settings.reviewPeriod || 21}, ${settings.minimumReviewers || 2}, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        settings_data = ${JSON.stringify(settings)},
        review_period_days = ${settings.reviewPeriod || 21},
        minimum_reviewers = ${settings.minimumReviewers || 2},
        updated_at = NOW()
    `)
    
    console.log("Settings saved to database:", settings)
  } catch (error) {
    console.error('Error saving journal settings:', error)
    throw new Error('Failed to save settings to database')
  }
}

async function logSettingsChange(adminEmail: string, settings: any) {
  try {
    // Log to database - create admin_logs table if needed
    await db.execute(sql`
      INSERT INTO admin_logs (action, performed_by, details, created_at)
      VALUES ('SETTINGS_UPDATED', ${adminEmail}, ${JSON.stringify(settings)}, NOW())
    `)
    
    console.log(`Settings change logged by ${adminEmail}:`, settings)
  } catch (error) {
    console.error('Error logging settings change:', error)
    // Don't fail the request if logging fails
  }
}
