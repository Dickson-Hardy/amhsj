import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { articles, users } from "@/lib/db/schema"
import { desc, eq, ilike } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const includeDOI = searchParams.get("include_doi") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = db
      .select({
        id: articles.id,
        title: articles.title,
        category: articles.category,
        status: articles.status,
        submittedDate: articles.submittedDate,
        publishedDate: articles.publishedDate,
        views: articles.views,
        downloads: articles.downloads,
        doi: articles.doi,
        doiRegistered: articles.doiRegistered,
        doiRegisteredAt: articles.doiRegisteredAt,
        volume: articles.volume,
        issue: articles.issue,
        pages: articles.pages,
        author: users.name,
        authorEmail: users.email,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))

    if (search) {
      query = query.where(ilike(articles.title, `%${search}%`))
    }

    if (status && status !== "all") {
      query = query.where(eq(articles.status, status))
    }

    const articleList = await query.orderBy(desc(articles.submittedDate)).limit(limit).offset(offset)

    // If DOI info is requested, fetch additional author details
    let enrichedArticles = articleList
    if (includeDOI) {
      enrichedArticles = await Promise.all(
        articleList.map(async (article) => {
          const fullArticle = await db.query.articles.findFirst({
            where: eq(articles.id, article.id),
            with: {
              authors: true
            }
          })
          
          return {
            ...article,
            authors: fullArticle?.authors || []
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      articles: enrichedArticles,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/admin/articles" })
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 })
  }
}
