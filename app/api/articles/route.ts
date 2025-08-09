import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { articles } from "@/lib/db/schema"
import { eq, desc, ilike, and } from "drizzle-orm"
import { z } from "zod"

const createArticleSchema = z.object({
  title: z.string().min(10),
  abstract: z.string().min(100),
  keywords: z.array(z.string()).min(3),
  category: z.string(),
  authorId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const year = searchParams.get("year")
    const featured = searchParams.get("featured") === "true"
    const current = searchParams.get("current") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = db.select().from(articles)
    const conditions = []

    // Only show published articles
    conditions.push(eq(articles.status, "published"))

    if (search) {
      conditions.push(ilike(articles.title, `%${search}%`))
    }
    if (category && category !== "all") {
      conditions.push(eq(articles.category, category))
    }
    if (year && year !== "all") {
      // Add year filtering logic
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    let orderBy = desc(articles.publishedDate)
    
    // Handle featured articles (high impact/views)
    if (featured) {
      orderBy = desc(articles.views)
    }
    
    // Handle current issue (most recent)
    if (current) {
      orderBy = desc(articles.publishedDate)
    }

    const result = await query.orderBy(orderBy).limit(limit).offset(offset) as any[]

    return NextResponse.json({ success: true, articles: result })
  } catch (error) {
    console.error("Articles fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createArticleSchema.parse(body)

    const [newArticle] = await db
      .insert(articles)
      .values({
        ...validatedData,
        status: "submitted",
        submittedDate: new Date(),
      })
      .returning()

    return NextResponse.json({ success: true, article: newArticle })
  } catch (error) {
    console.error("Article creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 400 })
  }
}
