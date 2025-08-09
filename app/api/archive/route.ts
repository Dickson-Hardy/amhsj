/**
 * Archive Management API Routes
 * Handles volume/issue creation, publication, and management
 */

import { NextRequest, NextResponse } from 'next/server'
import ArchiveManagementService from '@/lib/archive-management'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { logError, logInfo } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'volumes':
        return await handleGetVolumes(request)
      
      case 'issues':
        return await handleGetIssues(request)
      
      case 'statistics':
        return await handleGetStatistics(request)
      
      case 'archive':
        return await handleGetArchive(request)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    logError(error as Error, { context: 'archive-management-api-get' })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has editor or admin role
    if (!['editor', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'create-volume':
        return await handleCreateVolume(body)
      
      case 'create-issue':
        return await handleCreateIssue(body)
      
      case 'publish-volume':
        return await handlePublishVolume(body)
      
      case 'publish-issue':
        return await handlePublishIssue(body)
      
      case 'assign-article':
        return await handleAssignArticle(body)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    logError(error as Error, { context: 'archive-management-api-post' })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle getting volumes
 */
async function handleGetVolumes(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

  const volumes = await ArchiveManagementService.getVolumes({
    status,
    limit,
    offset
  })

  return NextResponse.json({
    success: true,
    volumes
  })
}

/**
 * Handle getting issues for a volume
 */
async function handleGetIssues(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const volumeId = searchParams.get('volumeId')
  
  if (!volumeId) {
    return NextResponse.json(
      { success: false, error: 'Volume ID is required' },
      { status: 400 }
    )
  }

  const status = searchParams.get('status') || undefined
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

  const issues = await ArchiveManagementService.getIssues(volumeId, {
    status,
    limit,
    offset
  })

  return NextResponse.json({
    success: true,
    issues
  })
}

/**
 * Handle getting archive statistics
 */
async function handleGetStatistics(request: NextRequest) {
  const statistics = await ArchiveManagementService.getArchiveStatistics()

  return NextResponse.json({
    success: true,
    statistics
  })
}

/**
 * Handle getting archive with filtering
 */
async function handleGetArchive(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const filters = {
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    volume: searchParams.get('volume') || undefined,
    issue: searchParams.get('issue') || undefined,
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
  }

  const result = await ArchiveManagementService.getArchive(filters)

  return NextResponse.json({
    success: true,
    ...result
  })
}

/**
 * Handle creating a new volume
 */
async function handleCreateVolume(data: {
  number: string
  year: number
  title?: string
  description?: string
  coverImage?: string
  metadata?: Record<string, any>
}) {
  const { number, year, title, description, coverImage, metadata } = data

  if (!number || !year) {
    return NextResponse.json(
      { success: false, error: 'Volume number and year are required' },
      { status: 400 }
    )
  }

  const result = await ArchiveManagementService.createVolume({
    number,
    year,
    title,
    description,
    coverImage,
    metadata
  })

  return NextResponse.json(result, {
    status: result.success ? 200 : 400
  })
}

/**
 * Handle creating a new issue
 */
async function handleCreateIssue(data: {
  volumeId: string
  number: string
  title?: string
  description?: string
  coverImage?: string
  specialIssue?: boolean
  guestEditors?: string[]
  metadata?: Record<string, any>
}) {
  const { volumeId, number, title, description, coverImage, specialIssue, guestEditors, metadata } = data

  if (!volumeId || !number) {
    return NextResponse.json(
      { success: false, error: 'Volume ID and issue number are required' },
      { status: 400 }
    )
  }

  const result = await ArchiveManagementService.createIssue({
    volumeId,
    number,
    title,
    description,
    coverImage,
    specialIssue,
    guestEditors,
    metadata
  })

  return NextResponse.json(result, {
    status: result.success ? 200 : 400
  })
}

/**
 * Handle publishing a volume
 */
async function handlePublishVolume(data: { volumeId: string }) {
  const { volumeId } = data

  if (!volumeId) {
    return NextResponse.json(
      { success: false, error: 'Volume ID is required' },
      { status: 400 }
    )
  }

  const result = await ArchiveManagementService.publishVolume(volumeId)

  return NextResponse.json(result, {
    status: result.success ? 200 : 400
  })
}

/**
 * Handle publishing an issue
 */
async function handlePublishIssue(data: { issueId: string }) {
  const { issueId } = data

  if (!issueId) {
    return NextResponse.json(
      { success: false, error: 'Issue ID is required' },
      { status: 400 }
    )
  }

  const result = await ArchiveManagementService.publishIssue(issueId)

  return NextResponse.json(result, {
    status: result.success ? 200 : 400
  })
}

/**
 * Handle assigning an article to an issue
 */
async function handleAssignArticle(data: { articleId: string; issueId: string }) {
  const { articleId, issueId } = data

  if (!articleId || !issueId) {
    return NextResponse.json(
      { success: false, error: 'Article ID and Issue ID are required' },
      { status: 400 }
    )
  }

  const result = await ArchiveManagementService.assignArticleToIssue(articleId, issueId)

  return NextResponse.json(result, {
    status: result.success ? 200 : 400
  })
}
