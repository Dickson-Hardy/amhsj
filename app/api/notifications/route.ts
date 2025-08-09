import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const unreadOnly = searchParams.get("unread") === "true"

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)

    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false))
    }

    const userNotifications = await query

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/notifications" })
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, isRead } = await request.json()

    await db.update(notifications).set({ isRead }).where(eq(notifications.id, notificationId))

    return NextResponse.json({ success: true })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/notifications PATCH" })
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 })
  }
}
