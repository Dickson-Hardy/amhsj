# Email Delivery Process & Submission Workflow

## Overview

The AMHSJ (Advances in Medicine & Health Sciences Journal) system uses a **hybrid email delivery architecture** that combines two email services for optimal delivery and professional communication:

- **Resend** - For user-facing notifications (authentication, general notifications)
- **Zoho Mail SMTP** - For editorial communications (peer review, editorial decisions)

## Email Delivery Architecture

### 1. Hybrid Email Service (`lib/email-hybrid.ts`)

The system automatically routes emails based on:
- **Email Category**: Authentication, user notifications, editorial, or system emails
- **Recipient Domain**: Verified domains use Zoho, others use Resend
- **Content Type**: Editorial communications prioritize professional delivery via Zoho

#### Email Categories:
```typescript
type EmailCategory = 
  | 'authentication'    // Resend: verification, password reset, welcome
  | 'user_notification' // Resend: payment reminders, success messages
  | 'editorial'         // Zoho: editorial decisions, reviewer assignments
  | 'system'           // Zoho: system alerts, admin notifications
```

#### Provider Selection Logic:
```typescript
function determineEmailProvider(category: EmailCategory, to: string): 'resend' | 'zoho' {
  // Verified domains (like amhsj.org) → Zoho
  // Editorial/System emails → Zoho
  // Authentication/User notifications → Resend
}
```

### 2. Email Queue System

- **Asynchronous Processing**: Emails are queued and processed every 5 seconds
- **Retry Logic**: Failed emails retry up to 3 times with exponential backoff
- **Priority Handling**: Critical emails (authentication) send immediately
- **Reliability**: Queue persists until successful delivery

## Submission Workflow & Email Triggers

### Step 1: Manuscript Submission (`/api/workflow/submit`)

When a user submits a manuscript through the submission form:

```typescript
// 1. Article data is validated and stored
const submissionData = {
  title: formData.title,
  abstract: formData.abstract,
  keywords: keywordArray,
  category: formData.category,
  authors: formData.authors,
  recommendedReviewers: formData.recommendedReviewers,
  funding: formData.funding,
  conflicts: formData.conflicts,
}

// 2. Workflow manager processes submission
const result = await workflowManager.submitArticle(articleData, authorId)
```

### Step 2: Email Notifications Triggered

#### A. Author Confirmation Email (Immediate)
```typescript
// Sent via Resend (user_notification category)
await sendWorkflowNotification(
  author.email,
  "Submission Received",
  `Your article "${articleData.title}" has been successfully submitted and is now under review.`,
  { articleId, submissionId }
)
```

**Template Used**: `submissionReceived`
**Content**: 
- Submission confirmation
- Submission ID and tracking info
- Timeline of review process
- Dashboard login link

#### B. Editor Assignment Email (If editor found)
```typescript
// Sent via Zoho (editorial category)
await sendWorkflowNotification(
  suitableEditor.email,
  "New Submission Assigned",
  `A new article "${articleData.title}" has been assigned to you for editorial review.`,
  { articleId, submissionId }
)
```

### Step 3: Editorial Workflow Email Chain

#### 1. Initial Screening Phase
- **Editorial Assistant** receives assignment notification
- System sends screening checklist emails
- Status updates trigger notifications

#### 2. Peer Review Assignment
```typescript
// Enhanced reviewer assignment with recommendations
const result = await reviewerAssignmentService.assignReviewersWithRecommendations(
  articleId, 
  editorId, 
  3, // target reviewer count
  deadline
)

// For each assigned reviewer:
await sendReviewInvitation(
  reviewer.email,
  {
    reviewerName: reviewer.name,
    articleTitle: article.title,
    invitationToken: reviewId,
    deadline: deadline,
    editorName: "Editorial Team"
  }
)
```

**Review Invitation Email** (via Zoho):
- Professional invitation to review
- Manuscript details (title, abstract)
- Review deadline
- Accept/Decline links
- Editorial contact information

#### 3. Review Submission Notifications
When reviewers submit reviews:
```typescript
// Notify editor
await createSystemNotification(
  editorId,
  "REVIEW_SUBMITTED",
  "Review Submitted",
  `A review has been submitted for: "${article.title}"`,
  articleId
)

// When all reviews complete → notify author
await createSystemNotification(
  authorId,
  "REVIEWS_COMPLETE",
  "Reviews Completed",
  `Reviews have been completed for your submission: "${article.title}"`,
  articleId
)
```

#### 4. Editorial Decision Emails
```typescript
await sendEditorialDecision(
  authorEmail,
  authorName,
  articleTitle,
  decision, // "accepted", "revision_requested", "rejected"
  comments,
  submissionId
)
```

### Step 4: Status Update Notifications

Throughout the workflow, status changes trigger notifications:

```typescript
// System notifications for workflow tracking
const statusNotifications = {
  "submitted": "Submission received - initial review pending",
  "editorial_assistant_review": "Under initial editorial review",
  "associate_editor_assignment": "Assigning associate editor",
  "associate_editor_review": "Under associate editor review",
  "reviewer_assignment": "Selecting peer reviewers",
  "under_review": "Under peer review",
  "revision_requested": "Revision required",
  "accepted": "Manuscript accepted",
  "rejected": "Manuscript declined",
  "published": "Article published"
}
```

## Email Templates & Content

### 1. Authentication Emails (Resend)
- **Email Verification**: Welcome + email confirmation
- **Password Reset**: Secure reset link
- **Welcome Email**: Account setup completion

### 2. User Notification Emails (Resend)
- **Submission Received**: Detailed confirmation with timeline
- **Payment Confirmation**: For publication fees
- **Status Updates**: Workflow progress notifications

### 3. Editorial Emails (Zoho)
- **Reviewer Assignment**: Professional invitation to review
- **Editorial Decision**: Accept/reject/revision notifications
- **Deadline Reminders**: For overdue reviews
- **System Alerts**: Administrative notifications

## Configuration & Environment Variables

### Resend Configuration
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=AMHSJ <noreply@amhsj.org>
REPLY_TO_EMAIL=editorial@amhsj.org
```

### Zoho Mail SMTP Configuration
```bash
SMTP_HOST=smtppro.zoho.com
SMTP_PORT=587
SMTP_USER=editorial@amhsj.org
SMTP_PASSWORD=your_app_password
SMTP_FROM=editorial@amhsj.org
```

### Professional Email Setup
- **Domain**: amhsj.org (verified with both services)
- **Authentication**: SPF, DKIM, DMARC configured
- **Branding**: Professional templates with journal logo
- **Tracking**: Email delivery monitoring and analytics

## Error Handling & Reliability

### 1. Queue Processing
- Emails process every 5 seconds
- Failed emails retry with exponential backoff
- Maximum 3 retry attempts before failure logging

### 2. Fallback Mechanisms
- Provider failover (Resend ↔ Zoho)
- Template fallbacks for missing content
- Error notification to administrators

### 3. Monitoring
```typescript
// Health check endpoints
export async function checkEmailServiceHealth(): Promise<{
  resend: boolean
  zoho: boolean
  overall: boolean
}>

// Queue status monitoring
export function getEmailQueueStatus() {
  return {
    queueLength: emailQueue.length,
    isProcessing: isProcessingQueue,
    pendingEmails: emailQueue.map(job => ({...}))
  }
}
```

## Security & Compliance

### 1. Email Security
- **Encryption**: TLS 1.2+ for all SMTP connections
- **Authentication**: OAuth2 for Resend, App Passwords for Zoho
- **Validation**: Email address validation before sending

### 2. Privacy Compliance
- **GDPR**: Email preferences and opt-out mechanisms
- **CAN-SPAM**: Proper unsubscribe links and sender identification
- **Academic Ethics**: Confidential review process protection

### 3. Content Protection
- **Reviewer Anonymity**: Secure review invitation tokens
- **Manuscript Security**: No sensitive content in email subjects
- **Access Control**: Role-based email distribution

## Testing the Email System

### 1. Development Testing
```bash
# Start development server
npm run dev

# Test submission process
# Navigate to /submit and complete form

# Monitor email queue
# Check console logs for email delivery status
```

### 2. Email Service Health Check
```typescript
// API endpoint: /api/admin/email-health
const health = await checkEmailServiceHealth()
console.log("Email services status:", health)
```

### 3. Manual Email Testing
```typescript
// Send test emails via API
await sendEmail({
  to: "test@example.com",
  subject: "Test Email",
  html: "<p>Test content</p>",
  category: "user_notification",
  priority: true
})
```

## Cloudinary File Storage Integration

Files uploaded during submission are stored in Cloudinary and referenced in emails:

```typescript
// File upload creates Cloudinary URLs
const uploadResult = await cloudinary.uploader.upload(fileData, {
  folder: 'submissions',
  resource_type: 'auto',
  public_id: `${submissionId}_${fileName}`
})

// URLs included in editorial emails
const fileLinks = files.map(file => 
  `<a href="${file.cloudinaryUrl}">${file.originalName}</a>`
).join(', ')
```

This comprehensive email system ensures reliable, professional communication throughout the entire manuscript submission and review process, from initial submission to final publication decision.