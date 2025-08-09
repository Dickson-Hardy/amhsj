import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EditorialWorkflow } from "@/lib/workflow"
import { articleSubmissionSchema } from "@/lib/validations"
import { logError, logInfo } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = articleSubmissionSchema.parse(body)

    const result = await EditorialWorkflow.submitArticle(validatedData, session.user.id)

    if (result.success) {
      logInfo("Article submitted", {
        articleId: result.article.id,
        authorId: session.user.id,
        title: result.article.title,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    logError(error as Error, { endpoint: "/api/workflow/submit" })
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 })
  }
}
