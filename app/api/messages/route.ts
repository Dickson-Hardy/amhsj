import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logError } from "@/lib/logger"
import { db } from "@/lib/db"
import { messages, conversations, users } from "@/lib/db/schema"
import { eq, and, sql, desc } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const conversationId = url.searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    // Fetch messages for the specific conversation
    const conversationMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        attachments: messages.attachments,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderEmail: users.email,
        senderRole: users.role,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          sql`participants @> '[{"id": "${session.user.id}"}]'::jsonb`
        )
      )
      .limit(1)

    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 403 })
    }

    // Format messages for the frontend
    const formattedMessages = conversationMessages.map(msg => ({
      id: msg.id,
      from: {
        id: msg.senderId,
        name: msg.senderName,
        role: msg.senderRole,
        email: msg.senderEmail
      },
      content: msg.content,
      attachments: msg.attachments || [],
      isRead: msg.isRead,
      timestamp: msg.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/messages GET" })
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, content, attachments } = await request.json()

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: "Conversation ID and content are required" }, { status: 400 })
    }

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          sql`participants @> '[{"id": "${session.user.id}"}]'::jsonb`
        )
      )
      .limit(1)

    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 403 })
    }

    // Insert the new message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
        attachments: attachments || [],
        isRead: false,
      })
      .returning()

    // Update the conversation's last activity
    await db
      .update(conversations)
      .set({
        lastActivity: new Date(),
        lastMessageId: newMessage.id,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      messageId: newMessage.id,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/messages POST" })
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
