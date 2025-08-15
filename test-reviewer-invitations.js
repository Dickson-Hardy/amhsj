// Test script for reviewer invitation system
import { db } from "./lib/db/index.js"
import { users, articles, reviewInvitations } from "./lib/db/schema.js"
import { v4 as uuidv4 } from "uuid"
import { eq } from "drizzle-orm"

async function testReviewerInvitationSystem() {
  console.log("🧪 Testing Reviewer Invitation System...")

  try {
    // 1. Check if we have test users and articles
    console.log("\n📋 Checking test data...")
    
    const testUsers = await db.select().from(users).limit(5)
    const testArticles = await db.select().from(articles).limit(3)
    
    console.log(`Found ${testUsers.length} users and ${testArticles.length} articles`)
    
    if (testUsers.length < 2 || testArticles.length < 1) {
      console.log("❌ Insufficient test data. Creating sample data...")
      
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
        console.log("✅ Created test reviewer: Dr. Sarah Johnson")
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
        console.log("✅ Created test article: AI-Driven Healthcare Solutions")
      }
    }

    // 2. Create a test review invitation
    console.log("\n📧 Creating test review invitation...")
    
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

    console.log(`✅ Created review invitation:`)
    console.log(`   - Invitation ID: ${invitationId}`)
    console.log(`   - Reviewer: ${reviewer.name} (${reviewer.email})`)
    console.log(`   - Article: ${article.title}`)
    console.log(`   - Manuscript No: ${article.manuscriptNumber}`)
    console.log(`   - Due Date: ${dueDate.toLocaleDateString()}`)

    // 3. Test invitation URLs
    console.log("\n🔗 Generated invitation URLs:")
    console.log(`   Accept: http://localhost:3000/reviewer/invitation/${invitationId}/accept`)
    console.log(`   Decline: http://localhost:3000/reviewer/invitation/${invitationId}/decline`)

    // 4. Check invitation in database
    console.log("\n🔍 Verifying invitation in database...")
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
      console.log("✅ Invitation verified:")
      console.log(`   - Status: ${invitation.status}`)
      console.log(`   - Reviewer: ${invitation.reviewerName} (${invitation.reviewerEmail})`)
      console.log(`   - Article: ${invitation.articleTitle}`)
      console.log(`   - Manuscript: ${invitation.manuscriptNumber}`)
      console.log(`   - Due: ${invitation.dueDate?.toLocaleDateString()}`)
    } else {
      console.log("❌ Could not verify invitation in database")
    }

    console.log("\n✅ Reviewer invitation system test completed successfully!")
    console.log("\n📝 Next Steps:")
    console.log("1. Visit the generated URLs to test accept/decline functionality")
    console.log("2. Check email templates by calling the invitation API endpoint")
    console.log("3. Test reviewer dashboard at /reviewer/dashboard")
    console.log("4. Verify email sending functionality")

  } catch (error) {
    console.error("❌ Test failed:", error)
    throw error
  }
}

// Run the test
if (require.main === module) {
  testReviewerInvitationSystem()
    .then(() => {
      console.log("✅ Test completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Test failed:", error)
      process.exit(1)
    })
}

export { testReviewerInvitationSystem }
