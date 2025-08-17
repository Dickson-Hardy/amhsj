import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, reviewerInvitations } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET() {
  try {
    // Get reviewers invited for special issue
    const specialIssueReviewers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        expertise: users.expertise,
        invitationStatus: reviewerInvitations.status,
      })
      .from(users)
      .leftJoin(reviewerInvitations, eq(users.id, reviewerInvitations.reviewerId))
      .where(inArray(users.role, ['reviewer', 'section_editor']))

    const formattedReviewers = specialIssueReviewers.map(reviewer => ({
      id: reviewer.id,
      name: `${reviewer.firstName} ${reviewer.lastName}`,
      email: reviewer.email,
      expertise: reviewer.expertise ? reviewer.expertise.split(',') : [],
      invitationStatus: reviewer.invitationStatus || 'not_invited',
      assignedSubmissions: [], // Would need to query reviewer assignments
      specialIssueRelevance: 8.5, // Would calculate based on expertise matching
      responseTime: 12, // Would calculate from actual response data
    }))

    return NextResponse.json(formattedReviewers)
  } catch (error) {
    console.error('Error fetching guest editor reviewers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    )
  }
}
