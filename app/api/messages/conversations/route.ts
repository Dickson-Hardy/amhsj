import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logError } from "@/lib/logger"
import { db } from "@/lib/db"
import { conversations, messages, users } from "@/lib/db/schema"
import { eq, or, desc, and, inArray, sql } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch conversations where the user is a participant
    const userConversations = await db
      .select({
        id: conversations.id,
        subject: conversations.subject,
        type: conversations.type,
        relatedTitle: conversations.relatedTitle,
        participants: conversations.participants,
        lastActivity: conversations.lastActivity,
        createdAt: conversations.createdAt,
        lastMessageContent: sql<string>`(
          SELECT content 
          FROM messages 
          WHERE conversation_id = ${conversations.id} 
          ORDER BY created_at DESC 
          LIMIT 1
        )`,
        unreadCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM messages 
          WHERE conversation_id = ${conversations.id} 
          AND sender_id != ${session.user.id}
          AND (read_by IS NULL OR NOT (read_by @> '[{"userId": "${session.user.id}"}]'::jsonb))
        )`
      })
      .from(conversations)
      .where(
        sql`participants @> '[{"id": "${session.user.id}"}]'::jsonb`
      )
      .orderBy(desc(conversations.lastActivity))

    // Format the response to match the expected interface
    const formattedConversations = userConversations.map(conv => ({
      id: conv.id,
      participants: conv.participants || [],
      subject: conv.subject,
      lastMessage: conv.lastMessageContent || "No messages yet",
      lastActivity: conv.lastActivity.toISOString(),
      unreadCount: conv.unreadCount,
      type: conv.type as "review" | "submission" | "editorial",
      relatedTitle: conv.relatedTitle
    }))

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/messages/conversations" })
    return NextResponse.json({ success: false, error: "Failed to fetch conversations" }, { status: 500 })
  }
}
