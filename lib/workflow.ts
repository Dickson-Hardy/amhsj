// lib/workflow.ts

import { db } from "./db"
import { 
  submissions, 
  articles, 
  reviews, 
  users, 
  notifications, 
  reviewerProfiles, 
  editorProfiles,
  editorAssignments,
  recommendedReviewers,
  reviewInvitations
} from "./db/schema"
import { eq, and, sql, inArray, not } from "drizzle-orm"
import { sendReviewInvitation, sendWorkflowNotification, sendEmail } from "./email"
import { emailTemplates } from "./email-templates"
import { v4 as uuidv4 } from "uuid"

// Workflow status types
export type WorkflowStatus = 
  | "draft"
  | "submitted" 
  | "technical_check"
  | "under_review"
  | "revision_requested"
  | "revision_submitted"
  | "accepted"
  | "rejected"
  | "published"
  | "withdrawn"

export type ReviewStatus = 
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "overdue"

export type ReviewRecommendation = 
  | "accept"
  | "minor_revision"
  | "major_revision"
  | "reject"

// Workflow state machine configuration
export const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  draft: ["submitted", "withdrawn"],
  submitted: ["technical_check", "rejected", "withdrawn"],
  technical_check: ["under_review", "rejected", "revision_requested"],
  under_review: ["revision_requested", "accepted", "rejected"],
  revision_requested: ["revision_submitted", "withdrawn"],
  revision_submitted: ["technical_check", "accepted", "rejected"],
  accepted: ["published"],
  rejected: [],
  published: [],
  withdrawn: []
}

// Reviewer assignment criteria
interface ReviewerCriteria {
  expertise: string[]
  excludeConflicts: string[]
  maxWorkload: number
  minQualityScore: number
}

// Workflow history entry
interface WorkflowHistoryEntry {
  status: WorkflowStatus
  timestamp: Date
  userId: string
  notes?: string
  systemGenerated?: boolean
}

/**
 * Create system notification for workflow events
 */
async function createSystemNotification(
  userId: string, 
  type: string, 
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    await db.insert(notifications).values({
      id: uuidv4(),
      userId,
      title,
      message,
      type,
      relatedId,
      isRead: false,
      createdAt: new Date()
    })
  } catch (error) {
    console.error("Failed to create system notification:", error)
  }
}

/**
 * Intelligent reviewer assignment based on expertise, availability, and workload
 */
export class ReviewerAssignmentService {
  /**
   * Find suitable reviewers for an article
   */
  async findSuitableReviewers(
    articleId: string, 
    criteria: ReviewerCriteria,
    excludeUsers: string[] = []
  ): Promise<{ id: string; email: string; name: string; score: number }[]> {
    try {
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
        with: {
          author: true
        }
      })

      if (!article) {
        throw new Error("Article not found")
      }

      // Get reviewers with matching expertise and availability
      const availableReviewers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          expertise: users.expertise,
          currentLoad: reviewerProfiles.currentReviewLoad,
          maxReviews: reviewerProfiles.maxReviewsPerMonth,
          qualityScore: reviewerProfiles.qualityScore,
          completedReviews: reviewerProfiles.completedReviews,
          lateReviews: reviewerProfiles.lateReviews,
          lastReviewDate: reviewerProfiles.lastReviewDate
        })
        .from(users)
        .innerJoin(reviewerProfiles, eq(users.id, reviewerProfiles.userId))
        .where(and(
          eq(users.role, "reviewer"),
          eq(users.isActive, true),
          eq(reviewerProfiles.isActive, true),
          eq(reviewerProfiles.availabilityStatus, "available"),
          sql`${reviewerProfiles.currentReviewLoad} < ${reviewerProfiles.maxReviewsPerMonth}`,
          sql`${reviewerProfiles.qualityScore} >= ${criteria.minQualityScore}`,
          not(inArray(users.id, [...excludeUsers, article.authorId, ...criteria.excludeConflicts].filter((id): id is string => !!id)))
        ))

      // Score and rank reviewers
      const scoredReviewers = availableReviewers
        .map(reviewer => {
          const expertiseMatch = this.calculateExpertiseMatch(
            reviewer.expertise as string[] || [], 
            criteria.expertise
          )
          const workloadScore = this.calculateWorkloadScore(
            reviewer.currentLoad || 0,
            reviewer.maxReviews || 3
          )
          const qualityScore = (reviewer.qualityScore || 0) / 100
          const reliabilityScore = this.calculateReliabilityScore(
            reviewer.completedReviews || 0,
            reviewer.lateReviews || 0
          )
          const recencyScore = this.calculateRecencyScore(reviewer.lastReviewDate)

          const totalScore = (
            expertiseMatch * 0.4 +
            workloadScore * 0.2 +
            qualityScore * 0.2 +
            reliabilityScore * 0.15 +
            recencyScore * 0.05
          )

          return {
            id: reviewer.id,
            email: reviewer.email,
            name: reviewer.name,
            score: Math.round(totalScore * 100) / 100
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Return top 10 candidates

      return scoredReviewers
    } catch (error) {
      console.error("Error finding suitable reviewers:", error)
      throw error
    }
  }

  private calculateExpertiseMatch(reviewerExpertise: string[], articleKeywords: string[]): number {
    if (!reviewerExpertise.length || !articleKeywords.length) return 0
    
    const matches = reviewerExpertise.filter(expertise => 
      articleKeywords.some(keyword => 
        keyword.toLowerCase().includes(expertise.toLowerCase()) ||
        expertise.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    
    return matches.length / Math.max(reviewerExpertise.length, articleKeywords.length)
  }

  private calculateWorkloadScore(currentLoad: number, maxLoad: number): number {
    return 1 - (currentLoad / maxLoad)
  }

  private calculateReliabilityScore(completed: number, late: number): number {
    if (completed === 0) return 0.5 // Neutral for new reviewers
    return completed / (completed + late * 2) // Late reviews count double
  }

  private calculateRecencyScore(lastReviewDate: Date | null): number {
    if (!lastReviewDate) return 1 // New reviewers get max score
    
    const daysSinceLastReview = Math.floor(
      (Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Optimal range is 30-90 days
    if (daysSinceLastReview < 30) return 0.7
    if (daysSinceLastReview > 180) return 0.3
    return 1
  }

  /**
   * Enhanced reviewer assignment that considers author recommendations
   * Follows these steps:
   * 1. Retrieve author-recommended reviewers
   * 2. Validate and score recommended reviewers
   * 3. Find additional qualified reviewers from the system
   * 4. Rank all potential reviewers by expertise and qualifications
   * 5. Select the top 2-3 reviewers from the ranked list, including both recommended and system-found reviewers
   */
  async assignReviewersWithRecommendations(
    articleId: string,
    editorId: string,
    targetReviewerCount: number = 3,
    deadline: Date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
  ): Promise<{
    success: boolean;
    assignedReviewers: string[];
    recommendedUsed: number;
    systemFound: number;
    errors: string[];
    workflow: {
      step1_recommendedRetrieved: number;
      step2_recommendedValidated: number;
      step3_systemCandidates: number;
      step4_totalRanked: number;
      step5_finalSelected: number;
    };
  }> {
    const errors: string[] = []
    const assignedReviewers: string[] = []
    let recommendedUsedCount = 0
    let systemFoundCount = 0

    try {
      // Step 1: Retrieve author-recommended reviewers
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
        with: { author: true }
      })

      if (!article) {
        throw new Error("Article not found")
      }

      const recommendedReviewers = await db
        .select()
        .from(recommendedReviewers)
        .where(eq(recommendedReviewers.articleId, articleId))

      console.log(`Step 1: Retrieved ${recommendedReviewers.length} author-recommended reviewers`)

      // Step 2: Validate and score recommended reviewers
      const validatedRecommended = []
      for (const recommended of recommendedReviewers) {
        // Check if recommended reviewer exists in our system
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, recommended.email),
          with: { reviewerProfile: true }
        })

        if (existingUser && existingUser.role === "reviewer" && existingUser.isActive) {
          // Existing reviewer - can be directly assigned
          const score = await this.scoreRecommendedReviewer(existingUser, article)
          validatedRecommended.push({
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            score: score,
            source: 'recommended_existing',
            recommendedData: recommended
          })
        } else {
          // New reviewer - needs invitation
          const score = this.scoreNewRecommendedReviewer(recommended, article)
          validatedRecommended.push({
            id: `new_${recommended.id}`,
            email: recommended.email,
            name: recommended.name,
            score: score,
            source: 'recommended_new',
            recommendedData: recommended
          })
        }
      }

      console.log(`Step 2: Validated ${validatedRecommended.length} recommended reviewers`)

      // Step 3: Find additional qualified reviewers from the system
      const excludeIds = [
        article.authorId,
        ...validatedRecommended.filter(r => r.source === 'recommended_existing').map(r => r.id)
      ]

      const criteria = {
        expertise: article.keywords || [],
        minQualityScore: 70,
        excludeConflicts: excludeIds
      }

      const systemCandidates = await this.findSuitableReviewers(articleId, criteria, excludeIds)
      
      console.log(`Step 3: Found ${systemCandidates.length} system candidate reviewers`)

      // Step 4: Rank all potential reviewers by expertise and qualifications
      const allCandidates = [
        ...validatedRecommended.map(r => ({
          ...r,
          // Boost score for recommended reviewers (author knows their expertise)
          score: r.score * 1.2 // 20% boost for being author-recommended
        })),
        ...systemCandidates.map(r => ({
          ...r,
          source: 'system_found'
        }))
      ].sort((a, b) => b.score - a.score)

      console.log(`Step 4: Ranked ${allCandidates.length} total reviewers`)

      // Step 5: Select the top reviewers (mix of recommended and system-found)
      const selectedReviewers = []
      let recommendedSelected = 0
      let systemSelected = 0

      // First, try to select at least 1-2 recommended reviewers if they score well
      for (const candidate of allCandidates) {
        if (selectedReviewers.length >= targetReviewerCount) break

        if ((candidate.source === 'recommended_existing' || candidate.source === 'recommended_new') &&
            recommendedSelected < 2 && candidate.score >= 0.6) {
          selectedReviewers.push(candidate)
          recommendedSelected++
        }
      }

      // Then fill remaining slots with best available reviewers
      for (const candidate of allCandidates) {
        if (selectedReviewers.length >= targetReviewerCount) break
        
        if (!selectedReviewers.find(s => s.id === candidate.id)) {
          selectedReviewers.push(candidate)
          if (candidate.source === 'system_found') {
            systemSelected++
          } else if (recommendedSelected < 2) {
            recommendedSelected++
          }
        }
      }

      console.log(`Step 5: Selected ${selectedReviewers.length} final reviewers (${recommendedSelected} recommended, ${systemSelected} system-found)`)

      // Assign the selected reviewers
      for (const reviewer of selectedReviewers) {
        try {
          if (reviewer.source === 'recommended_new') {
            // Handle new reviewer invitation
            await this.inviteNewReviewer(reviewer.recommendedData, articleId, editorId, deadline)
            assignedReviewers.push(reviewer.id)
            recommendedUsedCount++
          } else if (reviewer.source === 'recommended_existing' || reviewer.source === 'system_found') {
            // Assign existing reviewer
            await this.assignExistingReviewer(reviewer.id, articleId, editorId, deadline)
            assignedReviewers.push(reviewer.id)
            
            if (reviewer.source === 'recommended_existing') {
              recommendedUsedCount++
            } else {
              systemFoundCount++
            }
          }
        } catch (error) {
          errors.push(`Failed to assign reviewer ${reviewer.name}: ${error}`)
        }
      }

      // Update article with assigned reviewers
      if (assignedReviewers.length > 0) {
        const currentReviewers = article.reviewerIds as string[] || []
        const updatedReviewers = [...new Set([...currentReviewers, ...assignedReviewers.filter(id => !id.startsWith('new_'))])]
        
        await db
          .update(articles)
          .set({
            reviewerIds: updatedReviewers,
            status: "under_review",
            updatedAt: new Date()
          })
          .where(eq(articles.id, articleId))
      }

      return {
        success: assignedReviewers.length > 0,
        assignedReviewers,
        recommendedUsed: recommendedUsedCount,
        systemFound: systemFoundCount,
        errors,
        workflow: {
          step1_recommendedRetrieved: recommendedReviewers.length,
          step2_recommendedValidated: validatedRecommended.length,
          step3_systemCandidates: systemCandidates.length,
          step4_totalRanked: allCandidates.length,
          step5_finalSelected: selectedReviewers.length
        }
      }

    } catch (error) {
      console.error("Error assigning reviewers with recommendations:", error)
      return {
        success: false,
        assignedReviewers,
        recommendedUsed: recommendedUsedCount,
        systemFound: systemFoundCount,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        workflow: {
          step1_recommendedRetrieved: 0,
          step2_recommendedValidated: 0,
          step3_systemCandidates: 0,
          step4_totalRanked: 0,
          step5_finalSelected: 0
        }
      }
    }
  }

  /**
   * Score a recommended reviewer who exists in the system
   */
  private async scoreRecommendedReviewer(reviewer: any, article: any): Promise<number> {
    const expertiseMatch = this.calculateExpertiseMatch(
      reviewer.expertise as string[] || [],
      article.keywords || []
    )
    
    const profile = reviewer.reviewerProfile
    const workloadScore = profile ? this.calculateWorkloadScore(
      profile.currentReviewLoad || 0,
      profile.maxReviewsPerMonth || 3
    ) : 0.5

    const qualityScore = profile ? (profile.qualityScore || 70) / 100 : 0.7
    const reliabilityScore = profile ? this.calculateReliabilityScore(
      profile.completedReviews || 0,
      profile.lateReviews || 0
    ) : 0.5

    return (
      expertiseMatch * 0.5 +      // Higher weight for expertise since author recommended
      workloadScore * 0.2 +
      qualityScore * 0.2 +
      reliabilityScore * 0.1
    )
  }

  /**
   * Score a new recommended reviewer (not in system)
   */
  private scoreNewRecommendedReviewer(recommendedData: any, article: any): Promise<number> {
    // Base score for author recommendation
    let score = 0.7

    // Check expertise match if provided
    if (recommendedData.expertise) {
      const expertiseKeywords = recommendedData.expertise.toLowerCase().split(',').map((k: string) => k.trim())
      const articleKeywords = (article.keywords || []).map((k: string) => k.toLowerCase())
      
      const matches = expertiseKeywords.filter((exp: string) =>
        articleKeywords.some((keyword: string) =>
          keyword.includes(exp) || exp.includes(keyword)
        )
      )
      
      if (matches.length > 0) {
        score += 0.2 // Boost for expertise match
      }
    }

    // Boost for having institutional affiliation
    if (recommendedData.affiliation && recommendedData.affiliation.length > 20) {
      score += 0.1
    }

    return Promise.resolve(Math.min(score, 1.0))
  }

  /**
   * Invite a new reviewer who is not in the system
   */
  private async inviteNewReviewer(
    recommendedData: any,
    articleId: string,
    editorId: string,
    deadline: Date
  ): Promise<void> {
    // Mark the recommended reviewer as contacted
    await db
      .update(recommendedReviewers)
      .set({
        status: 'contacted',
        contactAttempts: 1,
        notes: 'Invited to review manuscript',
        updatedAt: new Date()
      })
      .where(eq(recommendedReviewers.id, recommendedData.id))

    // Send invitation email (implementation would go here)
    console.log(`Sending invitation to new reviewer: ${recommendedData.name} (${recommendedData.email})`)
  }

  /**
   * Assign an existing reviewer in the system
   */
  private async assignExistingReviewer(
    reviewerId: string,
    articleId: string,
    editorId: string,
    deadline: Date
  ): Promise<void> {
    // Create review invitation record
    const invitationId = uuidv4()
    await db.insert(reviewInvitations).values({
      id: invitationId,
      articleId,
      reviewerId,
      status: 'pending',
      dueDate: deadline,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Update reviewer workload
    await db
      .update(reviewerProfiles)
      .set({
        currentReviewLoad: sql`${reviewerProfiles.currentReviewLoad} + 1`,
        lastAssignedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(reviewerProfiles.userId, reviewerId))

    console.log(`Assigned existing reviewer: ${reviewerId}`)
  }

  /**
   * Original assign reviewers function (kept for backward compatibility)
   */
  async assignReviewers(
    articleId: string, 
    reviewerIds: string[], 
    editorId: string,
    deadline: Date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days default
  ): Promise<{ success: boolean; assignedReviewers: string[]; errors: string[] }> {
    const errors: string[] = []
    const assignedReviewers: string[] = []

    try {
      // Validate article exists
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
        with: { author: true }
      })

      if (!article) {
        throw new Error("Article not found")
      }

      // Validate editor exists and has permission
      const editor = await db.query.users.findFirst({
        where: eq(users.id, editorId)
      })

      if (!editor || !["editor", "admin"].includes(editor.role)) {
        throw new Error("Invalid editor or insufficient permissions")
      }

      for (const reviewerId of reviewerIds) {
        try {
          // Validate reviewer
          const reviewer = await db.query.users.findFirst({
            where: eq(users.id, reviewerId),
            with: {
              reviewerProfile: true
            }
          })

          if (!reviewer || reviewer.role !== "reviewer") {
            errors.push(`Invalid reviewer: ${reviewerId}`)
            continue
          }

          // Check for conflicts of interest
          if (reviewer.id === article.authorId) {
            errors.push(`Cannot assign author as reviewer: ${reviewer.name}`)
            continue
          }

          // Check workload
          const profile = reviewer.reviewerProfile
          // Type guard for reviewerProfile (cast to any to avoid never type)
          const isReviewerProfile = (p: any): p is { currentReviewLoad: number; maxReviewsPerMonth: number } =>
            p && typeof p.currentReviewLoad === 'number' && typeof p.maxReviewsPerMonth === 'number';
          const profileAny = reviewer.reviewerProfile as any;
          if (isReviewerProfile(profileAny) && profileAny.currentReviewLoad >= profileAny.maxReviewsPerMonth) {
            errors.push(`Reviewer ${reviewer.name} has reached maximum workload`)
            continue
          }

          // Create review assignment
          const reviewId = uuidv4()
          await db.insert(reviews).values({
            id: reviewId,
            articleId,
            reviewerId,
            status: "pending",
            createdAt: new Date()
          })

          // Update reviewer workload
          if (profile) {
            await db
              .update(reviewerProfiles)
              .set({
                currentReviewLoad: sql`${reviewerProfiles.currentReviewLoad} + 1`,
                updatedAt: new Date()
              })
              .where(eq(reviewerProfiles.userId, reviewerId))
          }

          // Send review invitation
          await sendReviewInvitation(
            reviewer.email,
            reviewer.name,
            article.title,
            article.abstract,
            deadline,
            reviewId
          )

          // Create notification
          await createSystemNotification(
            reviewerId,
            "REVIEW_ASSIGNED",
            "New Review Assignment",
            `You have been assigned to review: "${article.title}"`,
            articleId
          )

          assignedReviewers.push(reviewerId)

        } catch (error) {
          errors.push(`Failed to assign reviewer ${reviewerId}: ${error}`)
        }
      }

      // Update article with assigned reviewers
      if (assignedReviewers.length > 0) {
        const currentReviewers = article.reviewerIds as string[] || []
        const updatedReviewers = [...new Set([...currentReviewers, ...assignedReviewers])]
        
        await db
          .update(articles)
          .set({
            reviewerIds: updatedReviewers,
            status: "under_review",
            updatedAt: new Date()
          })
          .where(eq(articles.id, articleId))

        // Update submission status
        await db
          .update(submissions)
          .set({
            status: "under_review",
            updatedAt: new Date()
          })
          .where(eq(submissions.articleId, articleId))
      }

      return {
        success: assignedReviewers.length > 0,
        assignedReviewers,
        errors
      }

    } catch (error) {
      console.error("Error assigning reviewers:", error)
      throw error
    }
  }

  async getRecommendedReviewers(articleId: string) {
    try {
      // Get recommended reviewers from database
      const recommended = await db
        .select()
        .from(recommendedReviewers)
        .where(eq(recommendedReviewers.articleId, articleId))

      return recommended
    } catch (error) {
      console.error('Error getting recommended reviewers:', error, { operation: 'getRecommendedReviewers', articleId })
      return []
    }
  }
}

/**
 * Article submission workflow management
 */
export class ArticleSubmissionService {
  /**
   * Submit article for review
   */
  async submitArticle(
    articleData: {
      title: string
      abstract: string
      content?: string
      keywords: string[]
      category: string
      files?: { url: string; type: string; name: string; fileId: string }[]
      authors: {
        firstName: string
        lastName: string
        email: string
        orcid?: string
        institution: string
        department: string
        country: string
        affiliation: string
        isCorrespondingAuthor: boolean
      }[]
      recommendedReviewers?: {
        name: string
        email: string
        affiliation: string
        expertise?: string
      }[]
    },
    authorId: string
  ): Promise<{ success: boolean; article?: any; submissionId?: string; message: string }> {
    try {
      // Validate required fields
      if (!articleData.title?.trim()) {
        return { success: false, message: "Title is required" }
      }
      if (!articleData.abstract?.trim()) {
        return { success: false, message: "Abstract is required" }
      }
      if (!articleData.category?.trim()) {
        return { success: false, message: "Category is required" }
      }

      // Validate authors array
      if (!articleData.authors || articleData.authors.length === 0) {
        return { success: false, message: "At least one author is required" }
      }

      // Validate that exactly one corresponding author is designated
      const correspondingAuthors = articleData.authors.filter(author => author.isCorrespondingAuthor)
      if (correspondingAuthors.length !== 1) {
        return { success: false, message: "Exactly one corresponding author must be designated" }
      }

      // Validate all authors have required fields
      for (const author of articleData.authors) {
        if (!author.firstName || !author.lastName || !author.email || 
            !author.institution || !author.department || !author.country || !author.affiliation) {
          return { success: false, message: "All authors must have complete information (name, email, institution, department, country, affiliation)" }
        }
      }

      // Validate author
      const author = await db.query.users.findFirst({
        where: eq(users.id, authorId)
      })

      if (!author) {
        return { success: false, message: "Author not found" }
      }

      // Create article
      const articleId = uuidv4()
      const submissionId = uuidv4()

      await db.insert(articles).values({
        id: articleId,
        title: articleData.title.trim(),
        abstract: articleData.abstract.trim(),
        content: articleData.content?.trim() || "",
        keywords: articleData.keywords,
        category: articleData.category,
        status: "submitted",
        authorId,
        coAuthors: articleData.authors,
        files: articleData.files || [],
        submittedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Create submission record
      await db.insert(submissions).values({
        id: submissionId,
        articleId,
        authorId,
        status: "submitted",
        statusHistory: [{
          status: "submitted",
          timestamp: new Date(),
          userId: authorId,
          systemGenerated: false
        }],
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Save recommended reviewers if provided
      if (articleData.recommendedReviewers && articleData.recommendedReviewers.length > 0) {
        const reviewersToInsert = articleData.recommendedReviewers.map(reviewer => ({
          id: uuidv4(),
          articleId,
          name: reviewer.name.trim(),
          email: reviewer.email.trim().toLowerCase(),
          affiliation: reviewer.affiliation.trim(),
          expertise: reviewer.expertise?.trim() || null,
          suggestedBy: authorId,
          status: "suggested" as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        await db.insert(recommendedReviewers).values(reviewersToInsert)
      }

      // Find suitable editor for initial assignment
      const suitableEditor = await this.findSuitableEditor(articleData.category)
      
      if (suitableEditor) {
        await db
          .update(articles)
          .set({
            editorId: suitableEditor.id,
            status: "technical_check",
            updatedAt: new Date()
          })
          .where(eq(articles.id, articleId))

        // Update submission status
        await this.updateSubmissionStatus(
          submissionId,
          "technical_check",
          "system",
          "Automatically assigned to editor"
        )

        // Notify editor
        await sendWorkflowNotification(
          suitableEditor.email,
          suitableEditor.name,
          "New Submission Assigned",
          `A new article "${articleData.title}" has been assigned to you for editorial review.`,
          { articleId, submissionId }
        )

        // Create notification
        await createSystemNotification(
          suitableEditor.id,
          "SUBMISSION_ASSIGNED",
          "New Editorial Assignment",
          `New submission assigned: "${articleData.title}"`,
          articleId
        )
      }

      // Notify author of successful submission
      await sendWorkflowNotification(
        author.email,
        author.name,
        "Submission Received",
        `Your article "${articleData.title}" has been successfully submitted and is now under review.`,
        { articleId, submissionId }
      )

      // Create notification for author
      await createSystemNotification(
        authorId,
        "SUBMISSION_RECEIVED",
        "Submission Received",
        `Your article "${articleData.title}" has been successfully submitted`,
        articleId
      )

      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId)
      })

      return {
        success: true,
        article,
        submissionId,
        message: "Article submitted successfully"
      }

    } catch (error) {
      console.error("Error submitting article:", error)
      return {
        success: false,
        message: "Failed to submit article. Please try again."
      }
    }
  }

  /**
   * Find suitable editor for a submission
   */
  private async findSuitableEditor(category: string): Promise<{ id: string; email: string; name: string } | null> {
    try {
      const editors = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          currentWorkload: editorProfiles.currentWorkload,
          maxWorkload: editorProfiles.maxWorkload,
          assignedSections: editorProfiles.assignedSections
        })
        .from(users)
        .innerJoin(editorProfiles, eq(users.id, editorProfiles.userId))
        .where(and(
          inArray(users.role, ["editor", "admin"]),
          eq(users.isActive, true),
          eq(editorProfiles.isActive, true),
          eq(editorProfiles.isAcceptingSubmissions, true),
          sql`${editorProfiles.currentWorkload} < ${editorProfiles.maxWorkload}`
        ))

      if (!editors.length) return null

      // Find editor with matching section and lowest workload
      const matchingEditors = editors.filter(editor => {
        const sections = editor.assignedSections as string[] || []
        return sections.includes(category) || sections.includes("general")
      })

      const suitableEditors = matchingEditors.length > 0 ? matchingEditors : editors
      
      // Sort by workload (lowest first)
      suitableEditors.sort((a, b) => (a.currentWorkload || 0) - (b.currentWorkload || 0))

      return suitableEditors[0] || null

    } catch (error) {
      console.error("Error finding suitable editor:", error)
      return null
    }
  }

  /**
   * Update submission status with history tracking
   */
  async updateSubmissionStatus(
    submissionId: string,
    newStatus: WorkflowStatus,
    userId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, submissionId)
      })

      if (!submission) {
        return { success: false, message: "Submission not found" }
      }

      // Validate status transition
      const currentStatus = submission.status as WorkflowStatus
      const allowedTransitions = WORKFLOW_TRANSITIONS[currentStatus]
      
      if (!allowedTransitions.includes(newStatus)) {
        return {
          success: false,
          message: `Invalid status transition from ${currentStatus} to ${newStatus}`
        }
      }

      // Update submission with status history
      const currentHistory = submission.statusHistory as WorkflowHistoryEntry[] || []
      const newHistoryEntry: WorkflowHistoryEntry = {
        status: newStatus,
        timestamp: new Date(),
        userId,
        notes,
        systemGenerated: userId === "system"
      }

      await db
        .update(submissions)
        .set({
          status: newStatus,
          statusHistory: [...currentHistory, newHistoryEntry],
          updatedAt: new Date()
        })
        .where(eq(submissions.id, submissionId))

      // Update corresponding article status
      if (submission.articleId) {
        await db
          .update(articles)
          .set({
            status: newStatus,
            updatedAt: new Date()
          })
          .where(eq(articles.id, submission.articleId))
      }

      return { success: true, message: "Status updated successfully" }

    } catch (error) {
      console.error("Error updating submission status:", error)
      return { success: false, message: "Failed to update status" }
    }
  }

  async getArticleDetails(articleId: string) {
    try {
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
        with: {
          authors: true,
          submission: true
        }
      })

      return article
    } catch (error) {
      console.error('Error getting article details:', error, { operation: 'getArticleDetails', articleId })
      return null
    }
  }
}

/**
 * Review management service
 */
export class ReviewManagementService {
  /**
   * Submit a review
   */
  async submitReview(
    reviewId: string,
    reviewData: {
      recommendation: ReviewRecommendation
      comments: string
      confidentialComments?: string
      rating?: number
    },
    reviewerId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate review exists and belongs to reviewer
      const review = await db.query.reviews.findFirst({
        where: and(
          eq(reviews.id, reviewId),
          eq(reviews.reviewerId, reviewerId)
        ),
        with: {
          article: true,
          reviewer: true
        }
      })

      if (!review) {
        return { success: false, message: "Review not found or access denied" }
      }

      if (review.status === "completed") {
        return { success: false, message: "Review already completed" }
      }

      // Update review
      await db
        .update(reviews)
        .set({
          status: "completed",
          recommendation: reviewData.recommendation,
          comments: reviewData.comments,
          confidentialComments: reviewData.confidentialComments,
          rating: reviewData.rating,
          submittedAt: new Date()
        })
        .where(eq(reviews.id, reviewId))

      // Update reviewer workload and stats
      await db
        .update(reviewerProfiles)
        .set({
          currentReviewLoad: sql`${reviewerProfiles.currentReviewLoad} - 1`,
          completedReviews: sql`${reviewerProfiles.completedReviews} + 1`,
          lastReviewDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(reviewerProfiles.userId, reviewerId))

      // Check if all reviews are complete
      const allReviews = await db.query.reviews.findMany({
        where: review.articleId ? eq(reviews.articleId, review.articleId) : undefined
      })

      const completedReviews = allReviews.filter(r => r.status === "completed")
      const allReviewsComplete = allReviews.length > 0 && completedReviews.length === allReviews.length

      if (allReviewsComplete) {
        // Update article status based on review recommendations
        const recommendations = completedReviews.map(r => r.recommendation)
        const newStatus = this.determineArticleStatusFromReviews(recommendations)

        if (review.articleId) {
          await db
            .update(articles)
            .set({
              status: newStatus,
              updatedAt: new Date()
            })
            .where(eq(articles.id, review.articleId))
        }

        // Notify editor and author
        const article = review.article as { editorId?: string; authorId?: string; title?: string; id?: string } | undefined
        if (article && article.editorId) {
          await createSystemNotification(
            article.editorId,
            "REVIEWS_COMPLETE",
            "All Reviews Completed",
            `All reviews completed for: "${article.title ?? ''}"`,
            article.id ?? ''
          )
        }

        if (article && article.authorId) {
          await createSystemNotification(
            article.authorId,
            "REVIEWS_COMPLETE",
            "Reviews Completed",
            `Reviews have been completed for your submission: "${article.title ?? ''}"`,
            article.id ?? ''
          )
        }
      }

      // Notify editor of review completion
      const article = review.article as { editorId?: string; title?: string; id?: string } | undefined
      if (article && article.editorId) {
        await createSystemNotification(
          article.editorId,
          "REVIEW_SUBMITTED",
          "Review Submitted",
          `A review has been submitted for: "${article.title ?? ''}"`,
          article.id ?? ''
        )
      }

      return { success: true, message: "Review submitted successfully" }

    } catch (error) {
      console.error("Error submitting review:", error)
      return { success: false, message: "Failed to submit review" }
    }
  }

  private determineArticleStatusFromReviews(recommendations: (string | null)[]): WorkflowStatus {
    const validRecommendations = recommendations.filter(r => r) as string[]
    
    if (validRecommendations.includes("reject")) {
      return "rejected"
    }
    
    if (validRecommendations.includes("major_revision")) {
      return "revision_requested"
    }
    
    if (validRecommendations.includes("minor_revision")) {
      return "revision_requested"
    }
    
    if (validRecommendations.every(r => r === "accept")) {
      return "accepted"
    }

    return "technical_check" // Default if unclear
  }

  /**
   * Handle review deadline monitoring
   */
  async checkOverdueReviews(): Promise<void> {
    try {
      const overdueDate = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 21 days ago

      const overdueReviews = await db
        .select({
          id: reviews.id,
          articleId: reviews.articleId,
          reviewerId: reviews.reviewerId,
          createdAt: reviews.createdAt
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.reviewerId, users.id))
        .where(and(
          eq(reviews.status, "pending"),
          sql`${reviews.createdAt} < ${overdueDate}`
        ))

      for (const review of overdueReviews) {
        // Update review status to overdue
        await db
          .update(reviews)
          .set({ status: "overdue" })
          .where(eq(reviews.id, review.id))

        // Update reviewer stats
        await db
          .update(reviewerProfiles)
          .set({
            lateReviews: sql`${reviewerProfiles.lateReviews} + 1`,
            updatedAt: new Date()
          })
          .where(review.reviewerId ? eq(reviewerProfiles.userId, review.reviewerId) : undefined)

        // Send reminder notification
        const reviewer = await db.query.users.findFirst({
          where: review.reviewerId ? eq(users.id, review.reviewerId) : undefined
        })

        if (reviewer) {
          await createSystemNotification(
            reviewer.id,
            "REVIEW_OVERDUE",
            "Review Overdue",
            "You have an overdue review. Please submit it as soon as possible.",
            review.articleId ?? undefined
          )
        }
      }

    } catch (error) {
      console.error("Error checking overdue reviews:", error)
    }
  }
}

/**
 * Main workflow orchestration service
 */
export class EditorialWorkflow {
  private reviewerService = new ReviewerAssignmentService()
  private submissionService = new ArticleSubmissionService()
  private reviewService = new ReviewManagementService()

  /**
   * Legacy method for compatibility
   */
  async updateSubmissionWorkflow(
    submissionId: string,
    reviewer: { id: string; email: string },
    emailTemplate: string,
    newStatus: string,
    userId: string,
  ) {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    })

    if (!submission) {
      throw new Error(`Submission with id ${submissionId} not found.`)
    }

    // Fetch article and deadline for review invitation
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, submission.articleId!),
    })
    // Fallbacks for missing data
    const articleTitle = article?.title || "Article"
    const articleAbstract = article?.abstract || ""
    // Generate a deadline (e.g., 2 weeks from now)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 14)
    // Generate a reviewId (simulate, as this is legacy)
    const reviewId = `${submissionId}-legacy-review` // or fetch from DB if available

    // Send notifications (all required args)
    await sendReviewInvitation(
      reviewer.email,
      reviewer.id, // reviewerName (should be reviewer.name, but legacy type)
      articleTitle,
      articleAbstract,
      deadline,
      reviewId
    )
    await createSystemNotification(
      reviewer.id, 
      "REVIEW_ASSIGNED",
      "Review Assignment",
      "You have been assigned a new review",
      submissionId
    )

    // Update status with history
    await this.submissionService.updateSubmissionStatus(
      submissionId,
      newStatus as WorkflowStatus,
      userId
    )
  }

  // Export service instances for direct access
  get reviewerAssignment() { return this.reviewerService }
  get submission() { return this.submissionService }
  get review() { return this.reviewService }

  // Editor Assignment Functions
  async createEditorAssignment(
    articleId: string,
    editorId: string,
    assignedBy?: string,
    assignmentReason?: string,
    systemGenerated: boolean = true
  ): Promise<{ success: boolean; assignmentId?: string; message: string }> {
    try {
      // Validate article exists
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
        with: {
          authorId: true
        }
      })

      if (!article) {
        return { success: false, message: "Article not found" }
      }

      // Validate editor exists and has editor role
      const editor = await db.query.users.findFirst({
        where: eq(users.id, editorId)
      })

      if (!editor) {
        return { success: false, message: "Editor not found" }
      }

      if (!["editor", "chief_editor", "associate_editor"].includes(editor.role)) {
        return { success: false, message: "User is not an editor" }
      }

      // Check for existing pending assignment
      const existingAssignment = await db.query.editorAssignments.findFirst({
        where: and(
          eq(editorAssignments.articleId, articleId),
          eq(editorAssignments.editorId, editorId),
          eq(editorAssignments.status, "pending")
        )
      })

      if (existingAssignment) {
        return { success: false, message: "Assignment already exists for this editor" }
      }

      // Create assignment with 3-day deadline
      const assignmentId = uuidv4()
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 3)

      await db.insert(editorAssignments).values({
        id: assignmentId,
        articleId,
        editorId,
        assignedBy,
        assignedAt: new Date(),
        deadline,
        status: "pending",
        assignmentReason,
        systemGenerated,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Send assignment email
      try {
        const emailContent = emailTemplates.editorAssignment(
          editor.name,
          article.title,
          article.coAuthors ? article.coAuthors.map((author: any) => `${author.firstName} ${author.lastName}`) : [],
          article.abstract,
          assignmentId,
          `${process.env.NEXT_PUBLIC_BASE_URL}/editor/assignment/${assignmentId}`,
          deadline.toISOString()
        )

        await sendEmail({
          to: editor.email,
          subject: emailContent.subject,
          html: emailContent.html,
        })
      } catch (emailError) {
        console.error("Failed to send assignment email:", emailError)
        // Don't fail the assignment creation for email errors
      }

      // Create notification
      await this.createSystemNotification(
        editorId,
        "EDITOR_ASSIGNMENT",
        "New Editorial Assignment",
        `You have been assigned to review "${article.title}"`,
        assignmentId
      )

      return { 
        success: true, 
        assignmentId, 
        message: "Editor assignment created successfully" 
      }

    } catch (error) {
      console.error("Error creating editor assignment:", error)
      return { success: false, message: "Failed to create editor assignment" }
    }
  }

  async assignEditorToArticle(
    articleId: string,
    assignmentReason?: string
  ): Promise<{ success: boolean; message: string; assignmentId?: string }> {
    try {
      // Get article details
      const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId)
      })

      if (!article) {
        return { success: false, message: "Article not found" }
      }

      // Find suitable editor
      const suitableEditor = await this.findSuitableEditor(article.category)

      if (!suitableEditor) {
        return { 
          success: false, 
          message: "No suitable editor found for this category" 
        }
      }

      // Create the assignment
      const result = await this.createEditorAssignment(
        articleId,
        suitableEditor.id,
        "system", // system-generated assignment
        assignmentReason || `Automatically assigned based on expertise in ${article.category}`,
        true
      )

      return result

    } catch (error) {
      console.error("Error assigning editor to article:", error)
      return { success: false, message: "Failed to assign editor" }
    }
  }

  async expireOldAssignments(): Promise<number> {
    try {
      const result = await db
        .update(editorAssignments)
        .set({
          status: "expired",
          updatedAt: new Date()
        })
        .where(and(
          eq(editorAssignments.status, "pending"),
          sql`${editorAssignments.deadline} < NOW()`
        ))

      return result.rowCount || 0
    } catch (error) {
      console.error("Error expiring old assignments:", error)
      return 0
    }
  }

  // Legacy exports for compatibility
  assignReviewers = this.reviewerService.assignReviewers.bind(this.reviewerService)
  submitArticle = this.submissionService.submitArticle.bind(this.submissionService)
}

// Export singleton instance
export const workflowManager = new EditorialWorkflow()

// Export individual services for testing and direct use
export const reviewerAssignmentService = workflowManager.reviewerAssignment
export const articleSubmissionService = workflowManager.submission
export const reviewManagementService = workflowManager.review
