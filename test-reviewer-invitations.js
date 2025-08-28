// Test script for reviewer invitation system
import { APP_CONFIG } from "@/lib/constants";
import { APP_CONFIG } from "@/lib/constants";
import { APP_CONFIG } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { db } from "./lib/db/index.js"
import { users, articles, reviewInvitations } from "./lib/db/schema.js"
import { v4 as uuidv4 } from "uuid"
import { eq } from "drizzle-orm"

async function testReviewerInvitationSystem() {
  logger.info("🧪 Testing Reviewer Invitation System...")

  try {
    // 1. Check if we have test users and articles
    logger.info("\n📋 Checking test data...")
    
    const testUsers = await db.select().from(users).limit(5)
    const testArticles = await db.select().from(articles).limit(3)
    
    logger.info(`Found ${testUsers.length} users and ${testArticles.length} articles`)
    
    if (testUsers.length < 2 || testArticles.length < 1) {
      logger.info("❌ Insufficient test data. Creating sample data...")
      
      // Create test reviewer if needed
      if (testUsers.length < 2) {
        const reviewerId = uuidv4()
        await db.insert(users).values({
          id: reviewerId,
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@university.edu",
          role: "reviewer",
          department: "Computer Science",
          institution: "Tech University",
          country: "United States",
          expertise: ["Artificial Intelligence", "Machine Learning", "Healthcare Technology"],
          isActive: true,
        })
        logger.info("✅ Created test reviewer: Dr. Sarah Johnson")
      }
      
      // Create test article if needed
      if (testArticles.length < 1) {
        const articleId = uuidv4()
        await db.insert(articles).values({
          id: articleId,
          title: "AI-Driven Healthcare Solutions in Rural Settings",
          abstract: "This study explores the implementation of artificial intelligence technologies in rural healthcare settings, examining both opportunities and challenges.",
          keywords: ["artificial intelligence", "healthcare", "rural medicine", "technology implementation"],
          manuscriptNumber: `AMJHS-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          status: "under_review",
          submittedAt: new Date(),
          authorId: testUsers[0]?.id || uuidv4(),
        })
        logger.info("✅ Created test article: AI-Driven Healthcare Solutions")
      }
    }

    // 2. Create a test review invitation
    logger.info("\n📧 Creating test review invitation...")
    
    const refreshedUsers = await db.select().from(users).limit(5)
    const refreshedArticles = await db.select().from(articles).limit(3)
    
    const reviewer = refreshedUsers.find(u => u.role === "reviewer") || refreshedUsers[1]
    const article = refreshedArticles[0]
    
    if (!reviewer || !article) {
      throw new Error("Could not find reviewer or article for test")
    }

    const invitationId = uuidv4()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 21) // 21 days from now

    await db.insert(reviewInvitations).values({
      id: invitationId,
      articleId: article.id,
      reviewerId: reviewer.id,
      status: "pending",
      dueDate: dueDate,
      createdAt: new Date(),
    })

    logger.info(`✅ Created review invitation:`)
    logger.info(`   - Invitation ID: ${invitationId}`)
    logger.info(`   - Reviewer: ${reviewer.name} (${reviewer.email})`)
    logger.info(`   - Article: ${article.title}`)
    logger.info(`   - Manuscript No: ${article.manuscriptNumber}`)
    logger.info(`   - Due Date: ${dueDate.toLocaleDateString()}`)

    // 3. Test invitation URLs
    logger.info("\n🔗 Generated invitation URLs:")
    logger.info(`   Accept: http://process.env.NEXT_PUBLIC_APP_URL || "http://process.env.NEXT_PUBLIC_APP_URL || "http://process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"""/reviewer/invitation/${invitationId}/accept`)
    logger.info(`   Decline: http://process.env.NEXT_PUBLIC_APP_URL || "http://process.env.NEXT_PUBLIC_APP_URL || "http://process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"""/reviewer/invitation/${invitationId}/decline`)

    // 4. Check invitation in database
    logger.info("\n🔍 Verifying invitation in database...")
    const createdInvitation = await db
      .select({
        id: reviewInvitations.id,
        status: reviewInvitations.status,
        reviewerName: users.name,
        reviewerEmail: users.email,
        articleTitle: articles.title,
        manuscriptNumber: articles.manuscriptNumber,
        dueDate: reviewInvitations.dueDate,
      })
      .from(reviewInvitations)
      .innerJoin(users, eq(reviewInvitations.reviewerId, users.id))
      .innerJoin(articles, eq(reviewInvitations.articleId, articles.id))
      .where(eq(reviewInvitations.id, invitationId))
      .limit(1)

    if (createdInvitation.length > 0) {
      const invitation = createdInvitation[0]
      logger.info("✅ Invitation verified:")
      logger.info(`   - Status: ${invitation.status}`)
      logger.info(`   - Reviewer: ${invitation.reviewerName} (${invitation.reviewerEmail})`)
      logger.info(`   - Article: ${invitation.articleTitle}`)
      logger.info(`   - Manuscript: ${invitation.manuscriptNumber}`)
      logger.info(`   - Due: ${invitation.dueDate?.toLocaleDateString()}`)
    } else {
      logger.info("❌ Could not verify invitation in database")
    }

    logger.info("\n✅ Reviewer invitation system test completed successfully!")
    logger.info("\n📝 Next Steps:")
    logger.info("1. Visit the generated URLs to test accept/decline functionality")
    logger.info("2. Check email templates by calling the invitation API endpoint")
    logger.info("3. Test reviewer dashboard at /reviewer/dashboard")
    logger.info("4. Verify email sending functionality")

  } catch (error) {
    logger.error("❌ Test failed:", error)
    throw error
  }
}

// Run the test
if (require.main === module) {
  testReviewerInvitationSystem()
    .then(() => {
      logger.info("✅ Test completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      logger.error("❌ Test failed:", error)
      process.exit(1)
    })
}

export { testReviewerInvitationSystem }
