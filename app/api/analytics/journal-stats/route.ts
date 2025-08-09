import { NextRequest, NextResponse } from "next/server"
import { Analytics } from "@/lib/analytics"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin or editor
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const stats = await Analytics.getJournalStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch journal statistics" },
      { status: 500 }
    )
  }
}
