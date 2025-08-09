import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SystemHealthService, CustomAnalyticsService } from "@/lib/monitoring-production"
import { logError } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can access system health
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      )
    }

    const health = await SystemHealthService.checkSystemHealth()
    
    return NextResponse.json({
      success: true,
      data: health
    })
  } catch (error: any) {
    logError(error, { context: 'GET /api/monitoring/health' })
    
    return NextResponse.json({
      success: false,
      error: "Failed to check system health"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Health check endpoint - no authentication required for uptime monitoring
    const { searchParams } = new URL(request.url)
    const simple = searchParams.get('simple') === 'true'

    if (simple) {
      // Simple health check for load balancers
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
      })
    }

    const health = await SystemHealthService.checkSystemHealth()
    
    return NextResponse.json({
      success: true,
      data: {
        status: health.status,
        timestamp: health.timestamp,
        responseTime: health.metrics.responseTime
      }
    })
  } catch (error: any) {
    logError(error, { context: 'POST /api/monitoring/health' })
    
    return NextResponse.json({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 })
  }
}
