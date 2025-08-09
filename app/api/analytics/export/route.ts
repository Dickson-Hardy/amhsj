// app/api/analytics/export/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Analytics } from "@/lib/analytics"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d'
    const format = searchParams.get('format') || 'csv'

    // Get comprehensive analytics data
    const journalStats = await Analytics.getJournalStats()
    const userStats = await Analytics.getUserStats(range)
    const submissionStats = await Analytics.getSubmissionStats(range)
    const reviewStats = await Analytics.getReviewStats(range)
    const pageViews = await Analytics.getPageViews(range)

    if (format === 'csv') {
      // Generate CSV format
      const csvData = generateCSV({
        journalStats,
        userStats,
        submissionStats,
        reviewStats,
        pageViews,
        range
      })

      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="journal-analytics-${range}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON format
      const jsonData = {
        exportDate: new Date().toISOString(),
        timeRange: range,
        journalStats,
        userStats,
        submissionStats,
        reviewStats,
        pageViews
      }

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="journal-analytics-${range}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

  } catch (error) {
    console.error("Analytics export error:", error)
    return NextResponse.json(
      { error: "Failed to export analytics data" },
      { status: 500 }
    )
  }
}

function generateCSV(data: any): string {
  const {
    journalStats,
    userStats,
    submissionStats,
    reviewStats,
    pageViews,
    range
  } = data

  let csv = `Journal Analytics Export - ${range}\n`
  csv += `Export Date: ${new Date().toISOString()}\n\n`

  // Journal Overview
  csv += "JOURNAL OVERVIEW\n"
  csv += "Metric,Value\n"
  csv += `Total Users,${journalStats.totalUsers}\n`
  csv += `Total Articles,${journalStats.totalArticles}\n`
  csv += `Published Articles,${journalStats.publishedArticles}\n`
  csv += `Total Page Views,${journalStats.totalViews}\n`
  csv += `Pending Reviews,${journalStats.pendingReviews}\n`
  csv += `Average Review Time (days),${journalStats.averageReviewTime}\n\n`

  // User Statistics
  csv += "USER STATISTICS\n"
  csv += "Date,New Users\n"
  userStats.newUsers.forEach((item: any) => {
    csv += `${item.date},${item.count}\n`
  })
  csv += `\nUser Growth (%),${userStats.userGrowth}\n`
  csv += `Active Users,${userStats.activeUsers}\n\n`

  // Submission Statistics
  csv += "SUBMISSION STATISTICS\n"
  csv += "Month,Submissions\n"
  submissionStats.submissions.forEach((item: any) => {
    csv += `${item.month},${item.count}\n`
  })
  csv += `\nSubmission Trend (%),${submissionStats.submissionTrend}\n\n`

  // Category Distribution
  csv += "CATEGORY DISTRIBUTION\n"
  csv += "Category,Count\n"
  submissionStats.topCategories.forEach((item: any) => {
    csv += `"${item.category}",${item.count}\n`
  })
  csv += "\n"

  // Review Statistics
  csv += "REVIEW STATISTICS\n"
  csv += "Average Review Time (days),Completion Rate (%)\n"
  csv += `${reviewStats.averageReviewTime},${reviewStats.completionRate}\n\n`

  // Reviewer Performance
  csv += "REVIEWER PERFORMANCE\n"
  csv += "Reviewer,Completed Reviews,Average Time (days)\n"
  reviewStats.reviewerPerformance.forEach((item: any) => {
    csv += `"${item.reviewer}",${item.completed},${item.average_time}\n`
  })
  csv += "\n"

  // Page Views
  csv += "PAGE VIEWS\n"
  csv += "Page,Views,Unique Visitors\n"
  pageViews.forEach((item: any) => {
    csv += `"${item.path}",${item.views},${item.unique_visitors}\n`
  })

  return csv
}
