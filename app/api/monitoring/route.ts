/**
 * Performance & Security Monitoring API
 * Enterprise monitoring endpoints for system health and security
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { advancedMonitoringSystem } from '@/lib/advanced-monitoring'
import { securitySystem } from '@/lib/security-hardening'
import { performanceOptimizer } from '@/lib/performance-optimizer'
import cacheSystem from '@/lib/advanced-cache'

// Input validation schemas
const MonitoringQuerySchema = z.object({
  timeframe: z.enum(['1h', '24h', '7d', '30d']).optional().default('24h'),
  metric: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
})

const PerformanceMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  connectionType: z.string().optional(),
  deviceType: z.string().optional(),
})

const SecurityEventQuerySchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  eventType: z.string().optional(),
  resolved: z.boolean().optional(),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const endpoint = searchParams.get('endpoint')

    switch (endpoint) {
      case 'dashboard':
        return handleDashboardRequest(req)
      
      case 'performance':
        return handlePerformanceRequest(req)
      
      case 'security':
        return handleSecurityRequest(req)
      
      case 'cache':
        return handleCacheRequest(req)
      
      case 'system-health':
        return handleSystemHealthRequest(req)

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const endpoint = searchParams.get('endpoint')
    const body = await req.json()

    switch (endpoint) {
      case 'performance-metric':
        return handlePerformanceMetricSubmission(req, body)
      
      case 'clear-cache':
        return handleCacheClear(req, body)
      
      case 'purge-cdn':
        return handleCDNPurge(req, body)

      case 'resolve-alert':
        return handleAlertResolution(req, body)

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Monitoring API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Dashboard data handler
async function handleDashboardRequest(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = MonitoringQuerySchema.parse(Object.fromEntries(searchParams))

    const dashboardData = await advancedMonitoringSystem.getDashboardData()
    const securityReport = await securitySystem.getSecurityReport(query.timeframe)
    const performanceReport = await performanceOptimizer.generatePerformanceReport()
    const cacheStats = await cacheSystem.getStats()

    return NextResponse.json({
      success: true,
      data: {
        timestamp: Date.now(),
        monitoring: dashboardData,
        security: securityReport,
        performance: performanceReport,
        cache: cacheStats,
        overview: {
          systemHealth: dashboardData.systemHealth,
          activeAlerts: dashboardData.activeAlerts?.length || 0,
          criticalIssues: securityReport.criticalEvents || 0,
          avgResponseTime: dashboardData.kpis?.avgResponseTime || 0,
          errorRate: dashboardData.kpis?.errorRate || 0,
          cacheHitRate: calculateCacheHitRate(cacheStats),
        }
      }
    })
  } catch (error) {
    console.error('Dashboard request error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}

// Performance monitoring handler
async function handlePerformanceRequest(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = MonitoringQuerySchema.parse(Object.fromEntries(searchParams))

    const now = Date.now()
    const timeframeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[query.timeframe]

    const startTime = now - timeframeMs
    const metrics = await advancedMonitoringSystem.getMetrics(
      query.metric || '*',
      startTime,
      now
    )

    const performanceReport = await performanceOptimizer.generatePerformanceReport()

    return NextResponse.json({
      success: true,
      data: {
        timeframe: query.timeframe,
        metrics: metrics.slice(0, query.limit),
        report: performanceReport,
        summary: {
          totalMetrics: metrics.length,
          timeRange: { start: startTime, end: now },
          avgResponseTime: calculateAverageResponseTime(metrics),
          slowestEndpoints: getSlowsestEndpoints(metrics),
          performanceTrends: calculatePerformanceTrends(metrics),
        }
      }
    })
  } catch (error) {
    console.error('Performance request error:', error)
    return NextResponse.json(
      { error: 'Failed to load performance data' },
      { status: 500 }
    )
  }
}

// Security monitoring handler
async function handleSecurityRequest(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = SecurityEventQuerySchema.parse(Object.fromEntries(searchParams))

    const securityReport = await securitySystem.getSecurityReport('24h')
    const activeAlerts = await advancedMonitoringSystem.getActiveAlerts()

    // Filter security-related alerts
    const securityAlerts = activeAlerts.filter(alert => 
      alert.source.includes('security') || alert.source.includes('auth')
    )

    return NextResponse.json({
      success: true,
      data: {
        report: securityReport,
        alerts: securityAlerts.slice(0, query.limit),
        summary: {
          totalEvents: securityReport.totalEvents || 0,
          criticalEvents: securityReport.criticalEvents || 0,
          unresolvedEvents: securityReport.unresolvedEvents || 0,
          topThreats: identifyTopThreats(securityReport),
          securityScore: calculateSecurityScore(securityReport),
        }
      }
    })
  } catch (error) {
    console.error('Security request error:', error)
    return NextResponse.json(
      { error: 'Failed to load security data' },
      { status: 500 }
    )
  }
}

// Cache monitoring handler
async function handleCacheRequest(req: NextRequest) {
  try {
    const cacheStats = await cacheSystem.getStats()

    return NextResponse.json({
      success: true,
      data: {
        stats: cacheStats,
        summary: {
          hitRate: calculateCacheHitRate(cacheStats),
          memoryUsage: cacheStats.memory.used / cacheStats.memory.max,
          redisConnected: cacheStats.redis.connected,
          totalOperations: cacheStats.hits + cacheStats.misses,
          efficiency: calculateCacheEfficiency(cacheStats),
        },
        recommendations: generateCacheRecommendations(cacheStats),
      }
    })
  } catch (error) {
    console.error('Cache request error:', error)
    return NextResponse.json(
      { error: 'Failed to load cache data' },
      { status: 500 }
    )
  }
}

// System health handler
async function handleSystemHealthRequest(req: NextRequest) {
  try {
    const dashboardData = await advancedMonitoringSystem.getDashboardData()
    const systemHealth = dashboardData.systemHealth

    if (!systemHealth) {
      return NextResponse.json(
        { error: 'System health data unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        health: systemHealth,
        status: evaluateSystemStatus(systemHealth),
        alerts: generateHealthAlerts(systemHealth),
        recommendations: generateHealthRecommendations(systemHealth),
      }
    })
  } catch (error) {
    console.error('System health request error:', error)
    return NextResponse.json(
      { error: 'Failed to load system health data' },
      { status: 500 }
    )
  }
}

// Performance metric submission handler
async function handlePerformanceMetricSubmission(req: NextRequest, body: any) {
  try {
    const session = await auth()
    const metric = PerformanceMetricSchema.parse(body)

    await advancedMonitoringSystem.recordMetric(
      metric.name,
      metric.value,
      'gauge',
      {
        url: metric.url,
        userAgent: metric.userAgent,
        connectionType: metric.connectionType,
        deviceType: metric.deviceType,
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Performance metric recorded',
    })
  } catch (error) {
    console.error('Performance metric submission error:', error)
    return NextResponse.json(
      { error: 'Failed to record performance metric' },
      { status: 500 }
    )
  }
}

// Cache clear handler
async function handleCacheClear(req: NextRequest, body: any) {
  try {
    const session = await auth()
    if (!['admin', 'editor'].includes(session!.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { pattern, tags } = body
    const cleared = await cacheSystem.clear(pattern, tags)

    return NextResponse.json({
      success: true,
      message: `Cache cleared: ${cleared} entries`,
      cleared,
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

// CDN purge handler
async function handleCDNPurge(req: NextRequest, body: any) {
  try {
    const session = await auth()
    if (!['admin'].includes(session!.user.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { urls } = body
    if (!Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'URLs must be an array' },
        { status: 400 }
      )
    }

    const result = await performanceOptimizer.purgeCache(urls)

    return NextResponse.json({
      success: result.success,
      message: `CDN cache purged for ${result.purged} URLs`,
      purged: result.purged,
    })
  } catch (error) {
    console.error('CDN purge error:', error)
    return NextResponse.json(
      { error: 'Failed to purge CDN cache' },
      { status: 500 }
    )
  }
}

// Alert resolution handler
async function handleAlertResolution(req: NextRequest, body: any) {
  try {
    const session = await auth()
    const { alertId, resolution } = body

    // In a real implementation, update the alert status
    console.log(`Alert ${alertId} resolved by ${session!.user.id}: ${resolution}`)

    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully',
    })
  } catch (error) {
    console.error('Alert resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateCacheHitRate(stats: any): number {
  const total = stats.hits + stats.misses
  return total > 0 ? stats.hits / total : 0
}

function calculateAverageResponseTime(metrics: any[]): number {
  const responseTimes = metrics
    .filter(m => m.name === 'http_request_duration')
    .map(m => m.value)
  
  return responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0
}

function getSlowsestEndpoints(metrics: any[]): any[] {
  const endpointTimes = metrics
    .filter(m => m.name === 'http_request_duration')
    .reduce((acc, m) => {
      const path = m.tags?.path || 'unknown'
      if (!acc[path]) acc[path] = []
      acc[path].push(m.value)
      return acc
    }, {} as Record<string, number[]>)

  return Object.entries(endpointTimes)
    .map(([path, times]) => ({
      path,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      maxTime: Math.max(...times),
      requestCount: times.length,
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 10)
}

function calculatePerformanceTrends(metrics: any[]): any {
  // Simple trend calculation - implement more sophisticated analysis in production
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)

  const recentMetrics = metrics.filter(m => m.timestamp > oneHourAgo)
  const olderMetrics = metrics.filter(m => m.timestamp <= oneHourAgo)

  const recentAvg = calculateAverageResponseTime(recentMetrics)
  const olderAvg = calculateAverageResponseTime(olderMetrics)

  const trend = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0

  return {
    recentAverage: recentAvg,
    previousAverage: olderAvg,
    trendPercentage: trend * 100,
    improving: trend < 0,
  }
}

function identifyTopThreats(securityReport: any): string[] {
  const threats: string[] = []
  
  if (securityReport.eventsByType) {
    const sorted = Object.entries(securityReport.eventsByType)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
    
    threats.push(...sorted.map(([type]) => type))
  }

  return threats
}

function calculateSecurityScore(securityReport: any): number {
  // Simple security scoring - implement more sophisticated scoring in production
  let score = 100

  if (securityReport.criticalEvents > 0) score -= securityReport.criticalEvents * 20
  if (securityReport.unresolvedEvents > 10) score -= 10
  if (securityReport.totalEvents > 100) score -= 5

  return Math.max(score, 0)
}

function calculateCacheEfficiency(stats: any): number {
  const hitRate = calculateCacheHitRate(stats)
  const errorRate = stats.errors / (stats.hits + stats.misses + stats.errors)
  
  return hitRate * (1 - errorRate)
}

function generateCacheRecommendations(stats: any): string[] {
  const recommendations: string[] = []
  const hitRate = calculateCacheHitRate(stats)

  if (hitRate < 0.7) {
    recommendations.push('Cache hit rate is below 70% - consider adjusting cache strategies')
  }

  if (stats.memory.used / stats.memory.max > 0.9) {
    recommendations.push('Memory usage is high - consider increasing cache size or reducing TTL')
  }

  if (stats.errors > stats.hits * 0.1) {
    recommendations.push('High error rate detected - check Redis connectivity and configuration')
  }

  return recommendations
}

function evaluateSystemStatus(health: any): string {
  if (health.memory.usage > 0.9 || health.cpu.usage > 0.9) {
    return 'critical'
  }
  
  if (health.memory.usage > 0.8 || health.cpu.usage > 0.8) {
    return 'warning'
  }

  return 'healthy'
}

function generateHealthAlerts(health: any): any[] {
  const alerts: any[] = []

  if (health.memory.usage > 0.85) {
    alerts.push({
      type: 'memory',
      severity: health.memory.usage > 0.95 ? 'critical' : 'warning',
      message: `Memory usage: ${(health.memory.usage * 100).toFixed(1)}%`,
    })
  }

  if (health.cpu.usage > 0.8) {
    alerts.push({
      type: 'cpu',
      severity: health.cpu.usage > 0.9 ? 'critical' : 'warning',
      message: `CPU usage: ${(health.cpu.usage * 100).toFixed(1)}%`,
    })
  }

  return alerts
}

function generateHealthRecommendations(health: any): string[] {
  const recommendations: string[] = []

  if (health.memory.usage > 0.8) {
    recommendations.push('Consider scaling up memory or optimizing memory usage')
  }

  if (health.cpu.usage > 0.8) {
    recommendations.push('Consider scaling up CPU or optimizing CPU-intensive operations')
  }

  if (health.application.uptime < 3600) {
    recommendations.push('System was recently restarted - monitor for stability')
  }

  return recommendations
}
