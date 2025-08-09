import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@vercel/postgres'
import { handleError } from '@/lib/modern-error-handler'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark all notifications as read for the user
    const { rowCount } = await sql`
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE user_id = ${session.user.id} AND is_read = false
    `

    return NextResponse.json({
      success: true,
      message: `Marked ${rowCount} notifications as read`
    })

  } catch (error) {
    handleError(error, { 
      component: 'notifications-api', 
      action: 'mark_all_as_read'
    })
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}
