import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { aiAssessmentService } from "@/lib/ai-assessment"
import { externalIntegrationsService } from "@/lib/external-integrations"
import { apiRateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

// Request validation schemas
const AssessManuscriptSchema = z.object({
  manuscriptId: z.string(),
  content: z.object({
    title: z.string(),
    abstract: z.string(),
    content: z.string(),
    keywords: z.array(z.string()),
    references: z.array(z.string()),
    methodology: z.string().optional(),
    dataAvailability: z.string().optional(),
    ethicsStatement: z.string().optional()
  })
})

const PlagiarismCheckSchema = z.object({
  manuscriptId: z.string(),
  content: z.string()
})

const ReviewerMatchSchema = z.object({
  manuscriptId: z.string(),
  keywords: z.array(z.string()),
  category: z.string(),
  excludeIds: z.array(z.string()).optional()
})

const ImpactPredictionSchema = z.object({
  content: z.object({
    title: z.string(),
    abstract: z.string(),
    content: z.string(),
    keywords: z.array(z.string()),
    references: z.array(z.string())
  }),
  authorMetrics: z.object({
    hIndex: z.number().optional(),
    totalCitations: z.number().optional(),
    recentPublications: z.number().optional(),
    averageCitations: z.number().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await apiRateLimit.isAllowed(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: "Rate limit exceeded"
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      })
    }

    const session = await auth()
    if (!session || !["admin", "editor", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - AI features require elevated permissions"
      }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action

    switch (action) {
      case "assess-manuscript":
        return await handleManuscriptAssessment(body, session.user.id)
      case "check-plagiarism":
        return await handlePlagiarismCheck(body, session.user.id)
      case "find-reviewers":
        return await handleReviewerMatching(body, session.user.id)
      case "predict-impact":
        return await handleImpactPrediction(body, session.user.id)
      case "get-assessment":
        return await handleGetAssessment(body, session.user.id)
      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action"
        }, { status: 400 })
    }
  } catch (error) {
    logger.error("AI API error", { error })
    return NextResponse.json({
      success: false,
      error: "AI service temporarily unavailable"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const manuscriptId = searchParams.get("manuscriptId")

    switch (action) {
      case "get-assessment":
        if (!manuscriptId) {
          return NextResponse.json({
            success: false,
            error: "Manuscript ID required"
          }, { status: 400 })
        }
        return await handleGetAssessment({ manuscriptId }, session.user.id)
      
      case "get-assessments":
        return await handleGetAssessments(session.user.id, session.user.role)
      
      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action"
        }, { status: 400 })
    }
  } catch (error) {
    logger.error("AI API GET error", { error })
    return NextResponse.json({
      success: false,
      error: "AI service temporarily unavailable"
    }, { status: 500 })
  }
}

async function handleManuscriptAssessment(body: any, userId: string) {
  try {
    const validatedData = AssessManuscriptSchema.parse(body)
    
    // Check if user has permission to assess this manuscript
    const hasPermission = await checkManuscriptPermission(
      validatedData.manuscriptId, 
      userId
    )
    
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: "No permission to assess this manuscript"
      }, { status: 403 })
    }

    logger.info("Starting AI manuscript assessment", { 
      manuscriptId: validatedData.manuscriptId,
      userId 
    })

    const assessment = await aiAssessmentService.assessManuscriptQuality(
      validatedData.manuscriptId,
      validatedData.content
    )

    return NextResponse.json({
      success: true,
      data: assessment
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Invalid request data",
        details: error.errors
      }, { status: 400 })
    }

    logger.error("Manuscript assessment failed", { error, userId })
    return NextResponse.json({
      success: false,
      error: "Assessment failed"
    }, { status: 500 })
  }
}

async function handlePlagiarismCheck(body: any, userId: string) {
  try {
    const validatedData = PlagiarismCheckSchema.parse(body)
    
    const hasPermission = await checkManuscriptPermission(
      validatedData.manuscriptId, 
      userId
    )
    
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: "No permission to check plagiarism for this manuscript"
      }, { status: 403 })
    }

    logger.info("Starting plagiarism check", { 
      manuscriptId: validatedData.manuscriptId,
      userId 
    })

    const result = await aiAssessmentService.checkPlagiarism(
      validatedData.manuscriptId,
      validatedData.content
    )

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Invalid request data",
        details: error.errors
      }, { status: 400 })
    }

    logger.error("Plagiarism check failed", { error, userId })
    return NextResponse.json({
      success: false,
      error: "Plagiarism check failed"
    }, { status: 500 })
  }
}

async function handleReviewerMatching(body: any, userId: string) {
  try {
    const validatedData = ReviewerMatchSchema.parse(body)
    
    const hasPermission = await checkManuscriptPermission(
      validatedData.manuscriptId, 
      userId
    )
    
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: "No permission to find reviewers for this manuscript"
      }, { status: 403 })
    }

    logger.info("Finding optimal reviewers", { 
      manuscriptId: validatedData.manuscriptId,
      userId,
      keywordCount: validatedData.keywords.length
    })

    const reviewers = await aiAssessmentService.findOptimalReviewers(
      validatedData.manuscriptId,
      validatedData.keywords,
      validatedData.category,
      validatedData.excludeIds
    )

    return NextResponse.json({
      success: true,
      data: {
        reviewers,
        totalFound: reviewers.length,
        searchCriteria: {
          keywords: validatedData.keywords,
          category: validatedData.category
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Invalid request data",
        details: error.errors
      }, { status: 400 })
    }

    logger.error("Reviewer matching failed", { error, userId })
    return NextResponse.json({
      success: false,
      error: "Reviewer matching failed"
    }, { status: 500 })
  }
}

async function handleImpactPrediction(body: any, userId: string) {
  try {
    const validatedData = ImpactPredictionSchema.parse(body)

    logger.info("Predicting research impact", { userId })

    const prediction = await aiAssessmentService.predictResearchImpact(
      validatedData.content,
      validatedData.authorMetrics
    )

    return NextResponse.json({
      success: true,
      data: prediction
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Invalid request data",
        details: error.errors
      }, { status: 400 })
    }

    logger.error("Impact prediction failed", { error, userId })
    return NextResponse.json({
      success: false,
      error: "Impact prediction failed"
    }, { status: 500 })
  }
}

async function handleGetAssessment(body: any, userId: string) {
  try {
    const { manuscriptId } = body

    if (!manuscriptId) {
      return NextResponse.json({
        success: false,
        error: "Manuscript ID required"
      }, { status: 400 })
    }

    const hasPermission = await checkManuscriptPermission(manuscriptId, userId)
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: "No permission to view assessment for this manuscript"
      }, { status: 403 })
    }

    // Get the most recent assessment
    const assessment = await aiAssessmentService.getAssessment(manuscriptId)

    if (!assessment) {
      return NextResponse.json({
        success: false,
        error: "No assessment found for this manuscript"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: assessment
    })
  } catch (error) {
    logger.error("Failed to get assessment", { error, userId })
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve assessment"
    }, { status: 500 })
  }
}

async function handleGetAssessments(userId: string, userRole: string) {
  try {
    // Only admins and editors can view all assessments
    if (!["admin", "editor"].includes(userRole)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 })
    }

    // Get recent assessments with manuscript info
    const assessments = await aiAssessmentService.getRecentAssessments(50)

    return NextResponse.json({
      success: true,
      data: {
        assessments,
        total: assessments.length
      }
    })
  } catch (error) {
    logger.error("Failed to get assessments", { error, userId })
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve assessments"
    }, { status: 500 })
  }
}

async function checkManuscriptPermission(manuscriptId: string, userId: string): Promise<boolean> {
  try {
    // Implementation would check if user has permission to access the manuscript
    // This could be based on:
    // - User is the author
    // - User is assigned as reviewer
    // - User is editor/admin
    // - Manuscript is in user's area of expertise
    
    // For now, return true for demo purposes
    // In production, implement proper permission checking
    return true
  } catch (error) {
    logger.error("Permission check failed", { error, manuscriptId, userId })
    return false
  }
}
