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

    const userId = session.user.id

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
      })
      .from(conversations)
      .where(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(${conversations.participants}) AS participant
          WHERE participant->>'id' = ${userId}
        )`
      )
      .orderBy(desc(conversations.lastActivity))

    // For each conversation, get the last message and unread count
    const conversationIds = userConversations.map(c => c.id)
    
    let lastMessages: Record<string, string> = {}
    let unreadCounts: Record<string, number> = {}
    
    if (conversationIds.length > 0) {
      // Get last messages
      const lastMessageResults = await db
        .select({
          conversationId: messages.conversationId,
          content: messages.content,
        })
        .from(messages)
        .where(inArray(messages.conversationId, conversationIds))
        .orderBy(desc(messages.createdAt))
      
      // Group by conversation ID to get the latest message for each
      const messagesByConversation: Record<string, string> = {}
      lastMessageResults.forEach(msg => {
        if (msg.conversationId && !messagesByConversation[msg.conversationId]) {
          messagesByConversation[msg.conversationId] = msg.content
        }
      })
      lastMessages = messagesByConversation

      // Get unread counts
      const unreadResults = await db
        .select({
          conversationId: messages.conversationId,
          count: sql<number>`count(*)::int`
        })
        .from(messages)
        .where(
          and(
            inArray(messages.conversationId, conversationIds),
            sql`sender_id != ${userId}`,
            or(
              sql`is_read = false`,
              sql`is_read IS NULL`
            )
          )
        )
        .groupBy(messages.conversationId)
      
      unreadCounts = unreadResults.reduce((acc, result) => {
        if (result.conversationId) {
          acc[result.conversationId] = result.count
        }
        return acc
      }, {} as Record<string, number>)
    }

    // Format the response to match the expected interface
    const formattedConversations = userConversations.map(conv => ({
      id: conv.id,
      participants: conv.participants || [],
      subject: conv.subject,
      lastMessage: lastMessages[conv.id] || "No messages yet",
      lastActivity: conv.lastActivity?.toISOString() || new Date().toISOString(),
      unreadCount: unreadCounts[conv.id] || 0,
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
