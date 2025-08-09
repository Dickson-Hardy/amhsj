# Email Templates (Plain Text)

## Authentication

### Email Verification
Subject: AMHSJ - Verify Your Email Address

Welcome to AMHSJ, {name}!

Please verify your email address by visiting: {verificationUrl}

This link expires in 24 hours.

Best regards,
The AMHSJ Team

---

### Password Reset
Subject: AMHSJ - Password Reset Request

Password Reset Request

Hello {name},

Reset your password by visiting: {resetUrl}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The AMHSJ Security Team

---

## Submission Workflow

### Submission Received
Subject: AMHSJ - Submission Received: {articleTitle}

Submission Received - AMHSJ

Dear {authorName},

Your manuscript "{articleTitle}" has been successfully submitted.

Submission ID: {submissionId}
Status: Under Initial Review

You will be notified of the review progress.

Best regards,
AMHSJ Editorial Team

---

### Reviewer Assignment
Subject: AMHSJ - Review Assignment: {articleTitle}

Review Assignment - AMHSJ

Dear Dr. {reviewerName},

You have been assigned to review: "{articleTitle}" by {authorName}

Deadline: {deadline}

Access the manuscript: {reviewUrl}

Thank you for your contribution.

Best regards,
AMHSJ Editorial Team

---

### Review Submitted
Subject: AMHSJ - Review Completed: {articleTitle}

Review Completed - AMHSJ

Dear {authorName},

The peer review for "{articleTitle}" (ID: {submissionId}) has been completed.

Status: Under Editorial Review
Expected Decision: 1-2 weeks

Best regards,
AMHSJ Editorial Team

---

### Editorial Decision
Subject: AMHSJ - Editorial Decision: {decisionUpper} - {articleTitle}

Editorial Decision - AMHSJ

Dear {authorName},

Decision: {decisionUpper}
Article: {articleTitle}
ID: {submissionId}

{comments}

Detailed reviews available in your dashboard.

Best regards,
AMHSJ Editorial Team

---

## Payments

### Payment Confirmation
Subject: AMHSJ - Payment Confirmation

Payment Confirmation - AMHSJ

Dear {userName},

Payment successful!
Amount: ${amount}
Transaction ID: {transactionId}
Description: {description}

Keep this receipt for your records.

Best regards,
AMHSJ Finance Team

---

## System Notifications

### System Maintenance
Subject: AMHSJ - Scheduled System Maintenance

System Maintenance - AMHSJ

Dear {userName},

Scheduled maintenance:
Date: {maintenanceDate}
Duration: {duration}

Platform will be temporarily unavailable.

Best regards,
AMHSJ Technical Team

---

## Onboarding

### Welcome Email
Subject: Welcome to AMHSJ - Your Account is Ready!

Welcome to AMHSJ!

Dear {userName},

Your account is ready! Role: {userRole}

Access your dashboard: {baseUrl}/dashboard

Need help? Contact support@amhsj.org

Best regards,
The AMHSJ Team

---

## Editorial Board

### Application Received
Subject: AMHSJ - Editorial Board Application Received

Thank you for your Editorial Board application!

Dear {applicantName},

We have received your application for the {position} position.

Application ID: {applicationId}
Submitted: {submittedDate}

Next Steps:
- Review Process: 2-3 weeks
- Initial Screening
- Possible Interview
- Final Decision

We'll contact you with updates.

Best regards,
The AMHSJ Editorial Team

---

### Application Notification (Admin)
Subject: New Editorial Board Application - {position}

New Editorial Board Application

Applicant: {applicantName}
Email: {applicantEmail}
Position: {position}
Application ID: {applicationId}
Submitted: {submittedDateTime}

Review at: {baseUrl}/admin/editorial-board/applications/{applicationId}

Please review within 2 weeks.

AMHSJ System

---

### Application Decision
Subject: AMHSJ Editorial Board Application - {decisionTitle}

Editorial Board Application Decision

Dear {applicantName},

Your application for {position} has been {decision}.

{approvedBlock}

{commentsBlock}

Best regards,
The AMHSJ Editorial Committee

Application ID: {applicationId}

---

### Editorial Board Welcome
Subject: Welcome to the AMHSJ Editorial Board!

Welcome to the AMHSJ Editorial Board!

Dear {memberName},

Welcome to your new position as {position}!

Getting Started:
- Access Editorial Portal: {boardAccessUrl}
- Review Guidelines
- Check Editorial Calendar
- Connect with Board Members

Important:
- Maintain confidentiality
- Declare conflicts of interest
- Meet review deadlines
- Attend monthly meetings

Welcome aboard!

Best regards,
The AMHSJ Editorial Team
