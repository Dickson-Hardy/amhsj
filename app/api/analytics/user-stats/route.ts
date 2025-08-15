import { NextRequest, NextResponse } from "next/server"
import { Analytics } from "@/lib/analytics"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Users can only access their own analytics, unless they're admin/editor
    if (userId !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'editor') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const targetUserId = userId || session.user.id
    const result = await Analytics.getUserAnalytics(targetUserId)
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to fetch user analytics" 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      analytics: result.analytics
    })
  } catch (error) {
    console.error("User analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user analytics" },
      { status: 500 }
    )
  }
}
