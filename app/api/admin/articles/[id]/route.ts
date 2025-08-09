import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const articleId = params.id

    // Verify article exists and get details before deletion
    const article = await getArticleById(articleId)
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      )
    }

    // Delete article from database
    await deleteArticleById(articleId)
    
    // Log the deletion action
    await logArticleDeletion(session.user?.email || '', articleId, article.title)
    
    return NextResponse.json({
      success: true,
      message: "Article deleted successfully"
    })
    
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    )
  }
}

async function getArticleById(articleId: string) {
  try {
    // In a real implementation, fetch from your database:
    // const article = await prisma.article.findUnique({
    //   where: { id: articleId },
    //   include: {
    //     author: true,
    //     reviews: true,
    //     files: true
    //   }
    // })
    
    // Mock implementation
    const mockArticle = {
      id: articleId,
      title: `Article ${articleId}`,
      author: 'Dr. Sample Author',
      status: 'published',
      createdAt: new Date().toISOString()
    }
    
    return mockArticle
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function deleteArticleById(articleId: string) {
  try {
    // In a real implementation, delete from your database:
    // 1. Delete related reviews
    // await prisma.review.deleteMany({
    //   where: { articleId: articleId }
    // })
    
    // 2. Delete related files
    // await prisma.articleFile.deleteMany({
    //   where: { articleId: articleId }
    // })
    
    // 3. Delete the article
    // await prisma.article.delete({
    //   where: { id: articleId }
    // })
    
    console.log(`Article ${articleId} deleted from database`)
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Error deleting article from database:', error)
    throw new Error('Failed to delete article from database')
  }
}

async function logArticleDeletion(adminEmail: string, articleId: string, articleTitle: string) {
  try {
    // In a real implementation, log the action:
    // await prisma.adminLog.create({
    //   data: {
    //     action: 'ARTICLE_DELETED',
    //     performedBy: adminEmail,
    //     details: `Deleted article: "${articleTitle}" (ID: ${articleId})`,
    //     relatedId: articleId,
    //     timestamp: new Date()
    //   }
    // })
    
    console.log(`Article deletion logged by ${adminEmail}: "${articleTitle}" (${articleId})`)
  } catch (error) {
    console.error('Error logging article deletion:', error)
  }
}
