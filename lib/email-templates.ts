export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const emailTemplates = {
  // Authentication Templates
  emailVerification: (name: string, verificationUrl: string): EmailTemplate => ({
    subject: "AMHSJ - Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .warning { background: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AMHSJ</div>
            <p>Advancing Modern Hardware & Software Journal</p>
          </div>
          <div class="content">
            <h2>Welcome to AMHSJ, ${name}!</h2>
            <p>Thank you for registering with the Advancing Modern Hardware & Software Journal. To complete your registration and access all platform features, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create an account with AMHSJ, please ignore this email.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
            
            <p>Best regards,<br>The AMHSJ Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to AMHSJ, ${name}!\n\nPlease verify your email address by visiting: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe AMHSJ Team`,
  }),

  passwordReset: (name: string, resetUrl: string): EmailTemplate => ({
    subject: "AMHSJ - Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .warning { background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 AMHSJ</div>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password for your AMHSJ account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
            
            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Enabling two-factor authentication</li>
              <li>Not sharing your login credentials</li>
            </ul>
            
            <p>Best regards,<br>The AMHSJ Security Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>This is an automated security message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request\n\nHello ${name},\n\nReset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe AMHSJ Security Team`,
  }),

  // Submission Templates
  submissionReceived: (authorName: string, articleTitle: string, submissionId: string): EmailTemplate => ({
    subject: `AMHSJ - Submission Received: ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Submission Received - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .info-box { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .timeline { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✅ AMHSJ</div>
            <p>Submission Successfully Received</p>
          </div>
          <div class="content">
            <h2>Thank you for your submission!</h2>
            <p>Dear ${authorName},</p>
            <p>We have successfully received your manuscript submission to the Advancing Modern Hardware & Software Journal (AMHSJ).</p>
            
            <div class="info-box">
              <h3>Submission Details</h3>
              <p><strong>Article Title:</strong> ${articleTitle}</p>
              <p><strong>Submission ID:</strong> ${submissionId}</p>
              <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Status:</strong> Under Initial Review</p>
            </div>
            
            <div class="timeline">
              <h3>What Happens Next?</h3>
              <ol>
                <li><strong>Initial Review (3-5 days):</strong> Editorial team reviews for scope and technical requirements</li>
                <li><strong>Peer Review Assignment (1-2 weeks):</strong> Manuscript assigned to expert reviewers</li>
                <li><strong>Peer Review Process (4-6 weeks):</strong> Comprehensive review by domain experts</li>
                <li><strong>Editorial Decision (1-2 weeks):</strong> Final decision based on reviews</li>
              </ol>
            </div>
            
            <p>You can track your submission status anytime by logging into your AMHSJ dashboard. We will notify you at each stage of the review process.</p>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please do not submit your manuscript to other journals while under review</li>
              <li>Any correspondence should reference your Submission ID: ${submissionId}</li>
              <li>You will receive updates via email at each stage</li>
            </ul>
            
            <p>Thank you for choosing AMHSJ for your research publication.</p>
            
            <p>Best regards,<br>AMHSJ Editorial Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Questions? Contact us at editorial@amhsj.org</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Submission Received - AMHSJ\n\nDear ${authorName},\n\nYour manuscript "${articleTitle}" has been successfully submitted.\n\nSubmission ID: ${submissionId}\nStatus: Under Initial Review\n\nYou will be notified of the review progress.\n\nBest regards,\nAMHSJ Editorial Team`,
  }),

  reviewerAssignment: (
    reviewerName: string,
    articleTitle: string,
    authorName: string,
    deadline: string,
    reviewUrl: string,
  ): EmailTemplate => ({
    subject: `AMHSJ - Review Assignment: ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Review Assignment - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .info-box { background: #faf5ff; border: 1px solid #a855f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .deadline-box { background: #fef3cd; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📝 AMHSJ</div>
            <p>Peer Review Assignment</p>
          </div>
          <div class="content">
            <h2>Review Assignment Request</h2>
            <p>Dear Dr. ${reviewerName},</p>
            <p>Thank you for your continued support of AMHSJ. We would like to invite you to review a manuscript that falls within your area of expertise.</p>
            
            <div class="info-box">
              <h3>Manuscript Details</h3>
              <p><strong>Title:</strong> ${articleTitle}</p>
              <p><strong>Author:</strong> ${authorName}</p>
              <p><strong>Field:</strong> Hardware & Software Engineering</p>
              <p><strong>Review Type:</strong> Double-blind peer review</p>
            </div>
            
            <div class="deadline-box">
              <h3>⏰ Review Deadline</h3>
              <p><strong>${deadline}</strong></p>
              <p>Please complete your review by this date to maintain our publication timeline.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" class="button">Access Manuscript for Review</a>
            </div>
            
            <p><strong>Review Guidelines:</strong></p>
            <ul>
              <li>Evaluate technical soundness and methodology</li>
              <li>Assess novelty and significance of contributions</li>
              <li>Check clarity of presentation and writing quality</li>
              <li>Verify reproducibility of results</li>
              <li>Provide constructive feedback for improvement</li>
            </ul>
            
            <p><strong>Confidentiality:</strong> This manuscript is confidential and should not be shared or discussed with others. Please maintain the integrity of the peer review process.</p>
            
            <p>If you are unable to complete this review, please let us know as soon as possible so we can arrange an alternative reviewer.</p>
            
            <p>Thank you for your valuable contribution to the scientific community.</p>
            
            <p>Best regards,<br>AMHSJ Editorial Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Questions about the review process? Contact us at editorial@amhsj.org</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Review Assignment - AMHSJ\n\nDear Dr. ${reviewerName},\n\nYou have been assigned to review: "${articleTitle}" by ${authorName}\n\nDeadline: ${deadline}\n\nAccess the manuscript: ${reviewUrl}\n\nThank you for your contribution.\n\nBest regards,\nAMHSJ Editorial Team`,
  }),

  reviewSubmitted: (authorName: string, articleTitle: string, submissionId: string): EmailTemplate => ({
    subject: `AMHSJ - Review Completed: ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Review Completed - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .status-box { background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📋 AMHSJ</div>
            <p>Review Process Update</p>
          </div>
          <div class="content">
            <h2>Review Completed</h2>
            <p>Dear ${authorName},</p>
            <p>We are writing to inform you that the peer review process for your manuscript has been completed.</p>
            
            <div class="status-box">
              <h3>Submission Status Update</h3>
              <p><strong>Article Title:</strong> ${articleTitle}</p>
              <p><strong>Submission ID:</strong> ${submissionId}</p>
              <p><strong>Current Status:</strong> Under Editorial Review</p>
              <p><strong>Next Step:</strong> Editorial decision based on reviewer feedback</p>
            </div>
            
            <p>Our editorial team is now reviewing the feedback from our expert reviewers. You can expect to receive the editorial decision along with reviewer comments within the next 1-2 weeks.</p>
            
            <p><strong>Possible Outcomes:</strong></p>
            <ul>
              <li><strong>Accept:</strong> Manuscript accepted for publication</li>
              <li><strong>Minor Revisions:</strong> Small changes required before acceptance</li>
              <li><strong>Major Revisions:</strong> Significant revisions needed with re-review</li>
              <li><strong>Reject:</strong> Manuscript not suitable for publication in current form</li>
            </ul>
            
            <p>We appreciate your patience during this process and your contribution to advancing research in hardware and software engineering.</p>
            
            <p>Best regards,<br>AMHSJ Editorial Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Track your submission status in your dashboard</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Review Completed - AMHSJ\n\nDear ${authorName},\n\nThe peer review for "${articleTitle}" (ID: ${submissionId}) has been completed.\n\nStatus: Under Editorial Review\nExpected Decision: 1-2 weeks\n\nBest regards,\nAMHSJ Editorial Team`,
  }),

  editorialDecision: (
    authorName: string,
    articleTitle: string,
    decision: string,
    comments: string,
    submissionId: string,
  ): EmailTemplate => ({
    subject: `AMHSJ - Editorial Decision: ${decision.toUpperCase()} - ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Editorial Decision - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: ${decision === "accept" ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" : decision === "reject" ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" : "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"}; color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .decision-box { background: ${decision === "accept" ? "#f0fdf4" : decision === "reject" ? "#fef2f2" : "#fffbeb"}; border: 1px solid ${decision === "accept" ? "#10b981" : decision === "reject" ? "#ef4444" : "#f59e0b"}; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .comments-box { background: #f8f9fa; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${decision === "accept" ? "🎉" : decision === "reject" ? "📋" : "✏️"} AMHSJ</div>
            <p>Editorial Decision</p>
          </div>
          <div class="content">
            <h2>Editorial Decision</h2>
            <p>Dear ${authorName},</p>
            <p>Thank you for submitting your manuscript to the Advancing Modern Hardware & Software Journal. After careful consideration and peer review, we have reached an editorial decision.</p>
            
            <div class="decision-box">
              <h3>Decision: ${decision.toUpperCase().replace("_", " ")}</h3>
              <p><strong>Article Title:</strong> ${articleTitle}</p>
              <p><strong>Submission ID:</strong> ${submissionId}</p>
              <p><strong>Decision Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${
              comments
                ? `
            <div class="comments-box">
              <h3>Editorial Comments</h3>
              <p>${comments}</p>
            </div>
            `
                : ""
            }
            
            ${
              decision === "accept"
                ? `
              <p><strong>Congratulations!</strong> Your manuscript has been accepted for publication in AMHSJ. Our production team will contact you shortly regarding the final publication process.</p>
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Copyright agreement and final manuscript preparation</li>
                <li>DOI assignment and indexing</li>
                <li>Publication in the next available issue</li>
              </ul>
            `
                : decision === "reject"
                  ? `
              <p>While your manuscript was not accepted for publication in AMHSJ, we encourage you to consider the reviewer feedback for future submissions to other venues.</p>
              <p>Thank you for considering AMHSJ for your research publication.</p>
            `
                  : `
              <p>Your manuscript requires revisions before it can be considered for publication. Please address the reviewer comments and resubmit your revised manuscript.</p>
              <p><strong>Revision Guidelines:</strong></p>
              <ul>
                <li>Address all reviewer comments point-by-point</li>
                <li>Provide a detailed response letter</li>
                <li>Highlight changes in the revised manuscript</li>
                <li>Resubmit within 60 days to maintain priority</li>
              </ul>
            `
            }
            
            <p>The detailed reviewer reports are available in your AMHSJ dashboard.</p>
            
            <p>Best regards,<br>AMHSJ Editorial Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Questions? Contact us at editorial@amhsj.org</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Editorial Decision - AMHSJ\n\nDear ${authorName},\n\nDecision: ${decision.toUpperCase()}\nArticle: ${articleTitle}\nID: ${submissionId}\n\n${comments}\n\nDetailed reviews available in your dashboard.\n\nBest regards,\nAMHSJ Editorial Team`,
  }),

  // Payment Templates (for future subscription/APC features)
  paymentConfirmation: (
    userName: string,
    amount: string,
    transactionId: string,
    description: string,
  ): EmailTemplate => ({
    subject: "AMHSJ - Payment Confirmation",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .payment-box { background: #f0fdf4; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💳 AMHSJ</div>
            <p>Payment Confirmation</p>
          </div>
          <div class="content">
            <h2>Payment Successful</h2>
            <p>Dear ${userName},</p>
            <p>Thank you for your payment. We have successfully processed your transaction.</p>
            
            <div class="payment-box">
              <h3>Payment Details</h3>
              <p><strong>Amount:</strong> $${amount}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Status:</strong> Completed</p>
            </div>
            
            <p>This email serves as your receipt. Please keep it for your records.</p>
            
            <p>If you have any questions about this payment, please contact our support team with your transaction ID.</p>
            
            <p>Best regards,<br>AMHSJ Finance Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Questions? Contact us at finance@amhsj.org</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment Confirmation - AMHSJ\n\nDear ${userName},\n\nPayment successful!\nAmount: $${amount}\nTransaction ID: ${transactionId}\nDescription: ${description}\n\nKeep this receipt for your records.\n\nBest regards,\nAMHSJ Finance Team`,
  }),

  // System Notification Templates
  systemMaintenance: (userName: string, maintenanceDate: string, duration: string): EmailTemplate => ({
    subject: "AMHSJ - Scheduled System Maintenance",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Maintenance - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .maintenance-box { background: #fffbeb; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔧 AMHSJ</div>
            <p>System Maintenance Notice</p>
          </div>
          <div class="content">
            <h2>Scheduled Maintenance</h2>
            <p>Dear ${userName},</p>
            <p>We are writing to inform you about scheduled maintenance on the AMHSJ platform.</p>
            
            <div class="maintenance-box">
              <h3>Maintenance Details</h3>
              <p><strong>Date & Time:</strong> ${maintenanceDate}</p>
              <p><strong>Expected Duration:</strong> ${duration}</p>
              <p><strong>Impact:</strong> Platform will be temporarily unavailable</p>
            </div>
            
            <p><strong>What to expect:</strong></p>
            <ul>
              <li>Temporary inability to access the platform</li>
              <li>Submission and review processes will be paused</li>
              <li>Email notifications may be delayed</li>
            </ul>
            
            <p><strong>Improvements:</strong></p>
            <ul>
              <li>Enhanced system performance</li>
              <li>Security updates</li>
              <li>New features and bug fixes</li>
            </ul>
            
            <p>We apologize for any inconvenience and appreciate your patience as we work to improve your experience.</p>
            
            <p>Best regards,<br>AMHSJ Technical Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Questions? Contact us at support@amhsj.org</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `System Maintenance - AMHSJ\n\nDear ${userName},\n\nScheduled maintenance:\nDate: ${maintenanceDate}\nDuration: ${duration}\n\nPlatform will be temporarily unavailable.\n\nBest regards,\nAMHSJ Technical Team`,
  }),

  // Welcome email for new users
  welcomeEmail: (userName: string, userRole: string): EmailTemplate => ({
    subject: "Welcome to AMHSJ - Your Account is Ready!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .feature-box { background: #f8f9fa; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉 AMHSJ</div>
            <p>Welcome to the Community!</p>
          </div>
          <div class="content">
            <h2>Welcome to AMHSJ, ${userName}!</h2>
            <p>Congratulations! Your account has been successfully created and verified. You are now part of the Advancing Modern Hardware & Software Journal community.</p>
            
            <div class="feature-box">
              <h3>Your Role: ${userRole}</h3>
              <p>You have been granted <strong>${userRole}</strong> access to the platform with the following capabilities:</p>
              ${
                userRole === "Author"
                  ? `
                <ul>
                  <li>Submit research manuscripts</li>
                  <li>Track submission status</li>
                  <li>Respond to reviewer comments</li>
                  <li>Access published articles</li>
                </ul>
              `
                  : userRole === "Reviewer"
                    ? `
                <ul>
                  <li>Review assigned manuscripts</li>
                  <li>Provide expert feedback</li>
                  <li>Access reviewer dashboard</li>
                  <li>Track review history</li>
                </ul>
              `
                    : userRole === "Editor"
                      ? `
                <ul>
                  <li>Manage editorial workflow</li>
                  <li>Assign reviewers</li>
                  <li>Make editorial decisions</li>
                  <li>Oversee publication process</li>
                </ul>
              `
                      : `
                <ul>
                  <li>Browse and search articles</li>
                  <li>Download published content</li>
                  <li>Access journal archives</li>
                  <li>Submit manuscripts</li>
                </ul>
              `
              }
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Access Your Dashboard</a>
            </div>
            
            <p><strong>Getting Started:</strong></p>
            <ul>
              <li>Complete your profile information</li>
              <li>Explore the journal archives</li>
              <li>Familiarize yourself with submission guidelines</li>
              <li>Join our community of researchers</li>
            </ul>
            
            <p><strong>Need Help?</strong></p>
            <ul>
              <li>Visit our FAQ section for common questions</li>
              <li>Contact our support team at support@amhsj.org</li>
              <li>Check out our submission guidelines</li>
            </ul>
            
            <p>We're excited to have you as part of the AMHSJ community and look forward to your contributions to advancing research in hardware and software engineering.</p>
            
            <p>Best regards,<br>The AMHSJ Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>This email was sent to you because you created an account with AMHSJ.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to AMHSJ!\n\nDear ${userName},\n\nYour account is ready! Role: ${userRole}\n\nAccess your dashboard: ${process.env.NEXTAUTH_URL}/dashboard\n\nNeed help? Contact support@amhsj.org\n\nBest regards,\nThe AMHSJ Team`,
  }),

  // Editorial Board Application Templates
  editorialBoardApplicationReceived: (
    applicantName: string,
    position: string,
    applicationId: string
  ): EmailTemplate => ({
    subject: "AMHSJ - Editorial Board Application Received",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Editorial Board Application - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .highlight-box { background: #f8f9ff; border: 2px solid #4f46e5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .timeline { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AMHSJ</div>
            <p>Editorial Board Application</p>
          </div>
          <div class="content">
            <h2>Thank you for your application, ${applicantName}!</h2>
            <p>We have successfully received your application for the <strong>${position}</strong> position on the AMHSJ Editorial Board.</p>
            
            <div class="highlight-box">
              <h3>Application Details:</h3>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Position:</strong> ${position}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="timeline">
              <h3>What happens next?</h3>
              <ul>
                <li><strong>Review Process:</strong> Our editorial committee will review your application within 2-3 weeks</li>
                <li><strong>Initial Screening:</strong> We'll assess your qualifications and experience</li>
                <li><strong>Interview:</strong> Qualified candidates may be invited for a virtual interview</li>
                <li><strong>Decision:</strong> We'll notify you of the final decision via email</li>
              </ul>
            </div>
            
            <p>We appreciate your interest in contributing to AMHSJ's mission of advancing modern hardware and software research. Your expertise and dedication to academic excellence are valuable to our community.</p>
            
            <p>If you have any questions about your application or the process, please don't hesitate to contact our editorial office.</p>
            
            <p>Best regards,<br>The AMHSJ Editorial Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Application ID: ${applicationId} | Keep this for your records</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Thank you for your Editorial Board application!\n\nDear ${applicantName},\n\nWe have received your application for the ${position} position.\n\nApplication ID: ${applicationId}\nSubmitted: ${new Date().toLocaleDateString()}\n\nNext Steps:\n- Review Process: 2-3 weeks\n- Initial Screening\n- Possible Interview\n- Final Decision\n\nWe'll contact you with updates.\n\nBest regards,\nThe AMHSJ Editorial Team`,
  }),

  editorialBoardApplicationNotification: (
    applicantName: string,
    position: string,
    applicationId: string,
    applicantEmail: string
  ): EmailTemplate => ({
    subject: `New Editorial Board Application - ${position}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Editorial Board Application - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .applicant-info { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .action-button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AMHSJ Admin</div>
            <p>Editorial Board Application Alert</p>
          </div>
          <div class="content">
            <h2>New Editorial Board Application Received</h2>
            <p>A new application has been submitted for the Editorial Board position.</p>
            
            <div class="applicant-info">
              <h3>Application Details:</h3>
              <p><strong>Applicant:</strong> ${applicantName}</p>
              <p><strong>Email:</strong> ${applicantEmail}</p>
              <p><strong>Position:</strong> ${position}</p>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin/editorial-board/applications/${applicationId}" class="action-button">Review Application</a>
              <a href="${process.env.NEXTAUTH_URL}/admin/editorial-board/applications" class="action-button" style="background: #4f46e5;">View All Applications</a>
            </div>
            
            <p><strong>Action Required:</strong> Please review this application and provide feedback within 2 weeks to maintain our response time standards.</p>
            
            <p>Best regards,<br>AMHSJ System</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>This is an automated notification for administrators.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `New Editorial Board Application\n\nApplicant: ${applicantName}\nEmail: ${applicantEmail}\nPosition: ${position}\nApplication ID: ${applicationId}\nSubmitted: ${new Date().toLocaleString()}\n\nReview at: ${process.env.NEXTAUTH_URL}/admin/editorial-board/applications/${applicationId}\n\nPlease review within 2 weeks.\n\nAMHSJ System`,
  }),

  editorialBoardApplicationDecision: (
    applicantName: string,
    position: string,
    decision: 'approved' | 'rejected',
    comments: string,
    applicationId: string
  ): EmailTemplate => ({
    subject: `AMHSJ Editorial Board Application - ${decision === 'approved' ? 'Congratulations!' : 'Application Update'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Editorial Board Application Decision - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, ${decision === 'approved' ? '#059669 0%, #10b981 100%' : '#dc2626 0%, #ef4444 100%'}); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .decision-box { background: ${decision === 'approved' ? '#d1fae5' : '#fee2e2'}; border: 2px solid ${decision === 'approved' ? '#10b981' : '#ef4444'}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .comments-box { background: #f8f9ff; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; }
          .action-button { display: inline-block; background: ${decision === 'approved' ? '#059669' : '#4f46e5'}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AMHSJ</div>
            <p>Editorial Board Application Decision</p>
          </div>
          <div class="content">
            <h2>Dear ${applicantName},</h2>
            
            <div class="decision-box">
              <h3>${decision === 'approved' ? '🎉 Congratulations!' : 'Application Update'}</h3>
              <p><strong>Your application for ${position} has been ${decision}.</strong></p>
            </div>
            
            ${decision === 'approved' ? `
              <p>We are delighted to welcome you to the AMHSJ Editorial Board! Your expertise and commitment to advancing research in hardware and software will be invaluable to our journal.</p>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>You will receive separate credentials to access the editorial board portal</li>
                <li>Orientation materials will be sent within 48 hours</li>
                <li>Your first editorial assignment will be provided next week</li>
                <li>Welcome meeting scheduled within 2 weeks</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="action-button">Access Your Dashboard</a>
              </div>
            ` : `
              <p>Thank you for your interest in joining the AMHSJ Editorial Board. After careful consideration, we have decided not to move forward with your application at this time.</p>
              
              <p>This decision does not reflect on your qualifications or contributions to the field. We encourage you to continue your excellent work and consider applying for future opportunities.</p>
            `}
            
            ${comments ? `
              <div class="comments-box">
                <h3>Additional Comments:</h3>
                <p>${comments}</p>
              </div>
            ` : ''}
            
            <p>Thank you for your interest in AMHSJ and your commitment to advancing research in our field.</p>
            
            <p>Best regards,<br>The AMHSJ Editorial Committee</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Application ID: ${applicationId}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Editorial Board Application Decision\n\nDear ${applicantName},\n\nYour application for ${position} has been ${decision}.\n\n${decision === 'approved' ? 'Congratulations! Welcome to the AMHSJ Editorial Board.\n\nNext Steps:\n- Editorial portal access within 48 hours\n- Orientation materials coming soon\n- First assignment next week\n- Welcome meeting in 2 weeks' : 'Thank you for your interest. We encourage you to apply for future opportunities.'}\n\n${comments ? `Comments: ${comments}\n\n` : ''}Best regards,\nThe AMHSJ Editorial Committee\n\nApplication ID: ${applicationId}`,
  }),

  editorialBoardWelcome: (
    memberName: string,
    position: string,
    boardAccessUrl: string
  ): EmailTemplate => ({
    subject: "Welcome to the AMHSJ Editorial Board!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Editorial Board - AMHSJ</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .welcome-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .resources-box { background: #f8f9ff; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; }
          .action-button { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AMHSJ</div>
            <p>Editorial Board Welcome</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>🎉 Welcome to the Team, ${memberName}!</h2>
              <p><strong>Position: ${position}</strong></p>
            </div>
            
            <p>We are thrilled to have you join the AMHSJ Editorial Board. Your expertise will help shape the future of hardware and software research publication.</p>
            
            <div class="resources-box">
              <h3>Getting Started:</h3>
              <ul>
                <li><strong>Editorial Portal:</strong> Access your personalized dashboard</li>
                <li><strong>Review Guidelines:</strong> Familiarize yourself with our standards</li>
                <li><strong>Editorial Calendar:</strong> View upcoming deadlines and meetings</li>
                <li><strong>Contact Directory:</strong> Connect with fellow board members</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${boardAccessUrl}" class="action-button">Access Editorial Portal</a>
              <a href="${process.env.NEXTAUTH_URL}/editorial-board/guidelines" class="action-button" style="background: #4f46e5;">Review Guidelines</a>
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
              <li>Maintain confidentiality of all review materials</li>
              <li>Declare any conflicts of interest promptly</li>
              <li>Meet review deadlines to ensure timely publication</li>
              <li>Participate in monthly editorial board meetings</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our editorial office.</p>
            
            <p>Welcome aboard!</p>
            
            <p>Best regards,<br>The AMHSJ Editorial Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Advancing Modern Hardware & Software Journal. All rights reserved.</p>
            <p>Your journey as an editorial board member begins now!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to the AMHSJ Editorial Board!\n\nDear ${memberName},\n\nWelcome to your new position as ${position}!\n\nGetting Started:\n- Access Editorial Portal: ${boardAccessUrl}\n- Review Guidelines\n- Check Editorial Calendar\n- Connect with Board Members\n\nImportant:\n- Maintain confidentiality\n- Declare conflicts of interest\n- Meet review deadlines\n- Attend monthly meetings\n\nWelcome aboard!\n\nBest regards,\nThe AMHSJ Editorial Team`,
  }),
}
