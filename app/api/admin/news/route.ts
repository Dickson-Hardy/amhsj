import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { news } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { logError, logInfo } from "@/lib/logger"
import { v4 as uuidv4 } from "uuid"

// GET - Fetch all news items (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    // Fetch all news items (including unpublished)
    const newsItems = await db.select({
      id: news.id,
      title: news.title,
      content: news.content,
      excerpt: news.excerpt,
      type: news.type,
      category: news.category,
      authorName: news.authorName,
      publishedAt: news.publishedAt,
      isPublished: news.isPublished,
      slug: news.slug,
      tags: news.tags,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt
    }).from(news)
    .orderBy(desc(news.createdAt))

    return NextResponse.json({
      success: true,
      news: newsItems
    })

  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/news' })
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch news items" 
    }, { status: 500 })
  }
}

// POST - Create new news item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, excerpt, type, category, authorName, isPublished, tags } = body

    // Validate required fields
    if (!title || !content || !excerpt) {
      return NextResponse.json({
        success: false,
        error: "Title, content, and excerpt are required"
      }, { status: 400 })
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)

    // Create news item
    const [newNewsItem] = await db.insert(news).values({
      id: uuidv4(),
      title,
      content,
      excerpt,
      type: type || 'announcement',
      category: category || '',
      authorName: authorName || 'Editorial Team',
      publishedAt: isPublished ? new Date() : null,
      isPublished: isPublished || false,
      slug,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    logInfo('News item created', { 
      newsId: newNewsItem.id, 
      title, 
      type,
      createdBy: session.user.id 
    })

    return NextResponse.json({
      success: true,
      news: newNewsItem
    })

  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/news POST' })
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create news item" 
    }, { status: 500 })
  }
}
