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

    // Verify user has access to this conversation (simplified check for now)
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1)

    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
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
      timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
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

    const body = await request.json()
    
    // Check if this is a conversation-based message (existing system)
    if (body.conversationId) {
      const { conversationId, content, attachments } = body

      if (!conversationId || !content?.trim()) {
        return NextResponse.json({ error: "Conversation ID and content are required" }, { status: 400 })
      }

      logger.info("Sending message to conversation:", conversationId, "Content:", content.trim())

      // Verify user has access to this conversation (simplified check for now)
      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1)

      if (conversation.length === 0) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      logger.info("Found conversation:", conversation[0])

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
    } else {
      // New direct message system (for general messages)
      const { recipientType, subject, content, submissionId } = body

      if (!subject?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "Subject and content are required" }, { status: 400 })
      }

      // Determine recipient based on type
      let recipientId = ""
      let recipientName = ""
      
      if (recipientType === 'admin') {
        // Find an admin user
        const admin = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(eq(users.role, "admin"))
          .limit(1)
        if (admin.length) {
          recipientId = admin[0].id
          recipientName = admin[0].name || "Administrator"
        }
      } else if (recipientType === 'editor') {
        // Find an editor user
        const editor = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(sql`role IN ('editor-in-chief', 'managing-editor', 'section-editor')`)
          .limit(1)
        if (editor.length) {
          recipientId = editor[0].id
          recipientName = editor[0].name || "Editor"
        }
      } else if (recipientType === 'support') {
        // Find support/admin user for technical issues
        const support = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(eq(users.role, "admin"))
          .limit(1)
        if (support.length) {
          recipientId = support[0].id
          recipientName = "Technical Support"
        }
      }

      if (!recipientId) {
        return NextResponse.json({ error: "Could not find appropriate recipient" }, { status: 400 })
      }

      // Create a conversation first
      const [newConversation] = await db
        .insert(conversations)
        .values({
          subject,
          type: "general",
          relatedId: submissionId || null,
          relatedTitle: submissionId ? `Submission ${submissionId}` : subject,
          participants: [
            { id: session.user.id, name: session.user.name || "User", role: session.user.role || "user" }
          ],
          lastActivity: new Date(),
        })
        .returning()

      // Create the message
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId: newConversation.id,
          senderId: session.user.id,
          content: content.trim(),
          attachments: [],
          isRead: false,
        })
        .returning()

      // Update conversation with last message
      await db
        .update(conversations)
        .set({
          lastMessageId: newMessage.id,
        })
        .where(eq(conversations.id, newConversation.id))

      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
        conversationId: newConversation.id,
        messageId: newMessage.id,
      })
    }
  } catch (error) {
    logError(error as Error, { endpoint: "/api/messages POST" })
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
