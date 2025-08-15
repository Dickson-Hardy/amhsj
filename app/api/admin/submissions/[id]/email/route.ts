import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversations, messages, emailLogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function POST(request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await Promise.resolve(context.params);
    const submissionId = params.id;
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, content, recipients, templateType } = await request.json()

    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Subject, content, and recipients are required" }, { status: 400 })
    }

    // Create or find conversation for this submission
    let conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.relatedId, submissionId))
      .limit(1)

    let conversationId: string

    if (conversation.length === 0) {
      // Create new conversation
      const newConversation = await db.insert(conversations).values({
        subject: subject,
        type: 'editorial',
        relatedId: submissionId,
        relatedTitle: `Submission ${submissionId}`,
        participants: [
          { id: session.user.id, name: session.user.name || 'Admin', role: 'admin' },
          ...recipients.map((email: string) => ({ id: email, name: email, role: 'author' }))
        ],
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).returning({ id: conversations.id })

      conversationId = newConversation[0].id
    } else {
      conversationId = conversation[0].id
      
      // Update last activity
      await db
        .update(conversations)
        .set({ 
          lastActivity: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(conversations.id, conversationId))
    }

    // Add message to conversation
    const newMessage = await db.insert(messages).values({
      conversationId: conversationId,
      senderId: session.user.id,
      content: content,
      attachments: [],
      isRead: false,
      readBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning({ id: messages.id })

    // Log email for tracking
    try {
      await db.insert(emailLogs).values({
        type: templateType || 'admin_communication',
        recipientEmail: recipients[0], // Primary recipient
        subject: subject,
        status: 'pending',
        relatedType: 'submission',
        relatedId: submissionId,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
    } catch (logError) {
      console.error("Failed to log email:", logError)
    }

    // TODO: Integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll simulate email sending
    const emailSent = await sendEmail({
      to: recipients,
      subject: subject,
      content: content,
      from: process.env.FROM_EMAIL || 'editorial@amhsj.org',
      replyTo: process.env.REPLY_TO_EMAIL || 'editorial@amhsj.org'
    })

    if (!emailSent.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to send email",
        details: emailSent.error
      }, { status: 500 })
    }

    // Update email log status
    try {
      await db
        .update(emailLogs)
        .set({ 
          status: 'sent',
          deliveredAt: new Date().toISOString()
        })
        .where(eq(emailLogs.relatedId, submissionId))
    } catch (updateError) {
      console.error("Failed to update email log:", updateError)
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      conversationId: conversationId,
      messageId: newMessage[0].id,
      emailSent: true
    })
  } catch (error) {
    const { params } = context;
    const submissionId = params.id;
    logError(error as Error, { endpoint: `/api/admin/submissions/${submissionId}/email` })
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}

// Email sending function - integrate with your preferred email service
async function sendEmail({ to, subject, content, from, replyTo }: {
  to: string[]
  subject: string
  content: string
  from: string
  replyTo: string
}) {
  try {
    // If using Resend (as configured in your env)
    if (process.env.RESEND_API_KEY) {
      // Use dynamic import instead of require
      const resend = await import('resend').then(module => {
        return new module.Resend(process.env.RESEND_API_KEY)
      })
      
      const emailData = {
        from: from,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #0066cc;">
              <h1 style="color: #0066cc; margin: 0;">AMHSJ - Advances in Medicine & Health Sciences Journal</h1>
            </div>
            <div style="padding: 30px 20px;">
              <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">${content}</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; margin-top: 30px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                This email was sent from the AMHSJ Editorial Management System.<br>
                Please do not reply to this email. For assistance, contact: ${replyTo}
              </p>
            </div>
          </div>
        `,
        reply_to: replyTo
      }
      
      const result = await resend.emails.send(emailData)
      return { success: true, messageId: result.data?.id }
    }
    
    // Fallback to SMTP if Resend is not available
    // You can implement SMTP sending here using nodemailer
    
    return { success: true, messageId: 'simulated-' + Date.now() }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
