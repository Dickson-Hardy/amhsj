import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { eq, and, desc } from "drizzle-orm"
import { issues, articles, volumes } from "@/lib/db/schema"

export async function GET() {
  try {
    // Get the current issue setting
    const currentIssueSetting = await db
      .select()
      .from(issues)
      .where(eq(issues.isCurrent, true))
      .limit(1)

    if (currentIssueSetting.length === 0) {
      // If no current issue is set, get the latest published issue
      const latestIssue = await db
        .select({
          id: issues.id,
          title: issues.title,
          number: issues.number,
          description: issues.description,
          publishedAt: issues.publishedAt,
          coverImageUrl: issues.coverImageUrl,
          volumeId: issues.volumeId,
          volume: {
            id: volumes.id,
            year: volumes.year,
            number: volumes.number,
          }
        })
        .from(issues)
        .leftJoin(volumes, eq(issues.volumeId, volumes.id))
        .where(eq(issues.isPublished, true))
        .orderBy(desc(issues.publishedAt))
        .limit(1)

      if (latestIssue.length === 0) {
        return NextResponse.json({
          success: true,
          issue: null,
          articles: [],
        })
      }

      const issue = latestIssue[0]
      
      // Get articles for this issue
      const issueArticles = await db
        .select({
          id: articles.id,
          title: articles.title,
          abstract: articles.abstract,
          authors: articles.authors,
          publishedAt: articles.publishedAt,
          doi: articles.doi,
          pdfUrl: articles.pdfUrl,
        })
        .from(articles)
        .where(and(
          eq(articles.issueId, issue.id),
          eq(articles.isPublished, true)
        ))
        .orderBy(articles.pageStart)

      return NextResponse.json({
        success: true,
        issue: {
          id: issue.id,
          title: issue.title,
          number: issue.number,
          description: issue.description,
          publishedAt: issue.publishedAt,
          coverImageUrl: issue.coverImageUrl,
          volumeInfo: issue.volume ? `Vol. ${issue.volume.number} (${issue.volume.year})` : '',
        },
        articles: issueArticles,
      })
    }

    // Get the current issue details
    const currentIssue = await db
      .select({
        id: issues.id,
        title: issues.title,
        number: issues.number,
        description: issues.description,
        publishedAt: issues.publishedAt,
        coverImageUrl: issues.coverImageUrl,
        volumeId: issues.volumeId,
        volume: {
          id: volumes.id,
          year: volumes.year,
          number: volumes.number,
        }
      })
      .from(issues)
      .leftJoin(volumes, eq(issues.volumeId, volumes.id))
      .where(eq(issues.id, currentIssueSetting[0].id))
      .limit(1)

    if (currentIssue.length === 0) {
      return NextResponse.json({
        success: true,
        issue: null,
        articles: [],
      })
    }

    const issue = currentIssue[0]

    // Get articles for this issue
    const issueArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        abstract: articles.abstract,
        authors: articles.authors,
        publishedAt: articles.publishedAt,
        doi: articles.doi,
        pdfUrl: articles.pdfUrl,
      })
      .from(articles)
      .where(and(
        eq(articles.issueId, issue.id),
        eq(articles.isPublished, true)
      ))
      .orderBy(articles.pageStart)

    return NextResponse.json({
      success: true,
      issue: {
        id: issue.id,
        title: issue.title,
        number: issue.number,
        description: issue.description,
        publishedAt: issue.publishedAt,
        coverImageUrl: issue.coverImageUrl,
        volumeInfo: issue.volume ? `Vol. ${issue.volume.number} (${issue.volume.year})` : '',
      },
      articles: issueArticles,
    })

  } catch (error) {
    console.error("Error fetching current issue data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch current issue data",
      },
      { status: 500 }
    )
  }
}
