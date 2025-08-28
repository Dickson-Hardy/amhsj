# 🔐 Editorial Assistant Login System Guide

## Overview

The Editorial Assistant Login System provides secure access to the AMHSJ manuscript screening and editorial workflow management platform. This system is designed specifically for editorial assistants who perform initial manuscript screening and manage the editorial workflow.

## 🏗️ System Architecture

### Components
1. **Database Schema** (`editorial-assistant-schema.sql`) - Complete database structure
2. **User Setup Script** (`create-editorial-assistant-user.sql`) - Creates user and profile
3. **Login Component** (`components/editorial-assistant-login.tsx`) - Specialized login UI
4. **Login Page** (`app/editorial-assistant/login/page.tsx`) - Dedicated login route
5. **Test Script** (`test-editorial-assistant-login.js`) - Verification and testing

### Database Tables
- `users` - User authentication and basic information
- `editorial_assistant_profiles` - Editorial assistant specific data
- `manuscript_screenings` - Screening records and results
- `screening_templates` - Configurable screening criteria
- `workflow_time_limits` - Workflow stage timeouts
- `communication_templates` - Email and notification templates
- `quality_metrics` - Performance tracking

## 🚀 Setup Instructions

### 1. Database Setup

First, run the complete database schema:

```bash
# Run the main schema
psql -d your_database_name -f editorial-assistant-schema.sql

# Create the editorial assistant user
psql -d your_database_name -f scripts/create-editorial-assistant-user.sql
```

### 2. Verify Setup

Test the database setup:

```bash
# Run the test script
node scripts/test-editorial-assistant-login.js
```

Expected output:
```
✅ Editorial Assistant User Found
✅ Editorial Assistant Profile Found
✅ Screening Template Found
✅ Workflow Time Limits Found
✅ Communication Template Found
✅ Editorial Assistant Indexes Found
✅ Role-Based Access Verified
```

### 3. Start Development Server

```bash
pnpm dev
```

## 🔑 Login Credentials

### Default Editorial Assistant Account
- **Email**: `editorial.assistant@amhsj.org`
- **Password**: `password123`
- **Role**: `editorial-assistant`
- **Dashboard**: `/editorial-assistant`

### Access URLs
- **Login Page**: `/editorial-assistant/login`
- **Dashboard**: `/editorial-assistant`
- **Screening**: `/editorial-assistant/screening/[id]`
- **Assignment**: `/editorial-assistant/assignment/[id]`

## 🎯 Features

### Editorial Assistant Capabilities
1. **Initial Manuscript Screening**
   - File completeness check
   - Plagiarism verification
   - Format compliance assessment
   - Ethical compliance review
   - Language quality evaluation

2. **Associate Editor Assignment**
   - Intelligent editor selection
   - Workload balancing
   - Specialization matching
   - Conflict of interest detection

3. **Workflow Management**
   - Status tracking
   - Time limit monitoring
   - Escalation handling
   - Performance metrics

4. **Quality Control**
   - Standardized screening templates
   - Quality scoring
   - Decision automation
   - Audit trails

## 🔒 Security Features

### Authentication
- JWT-based session management
- Role-based access control
- Password hashing with bcrypt
- Session timeout handling

### Authorization
- Route-level access control
- Role hierarchy enforcement
- API endpoint protection
- Middleware validation

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token validation

## 📱 User Interface

### Login Form
- Clean, professional design
- Role-specific branding
- Responsive layout
- Accessibility features

### Dashboard
- Manuscript queue management
- Screening statistics
- Performance metrics
- Quick action buttons

### Screening Interface
- Step-by-step screening process
- Quality assessment forms
- Decision point management
- Notes and comments

## 🔄 Workflow Integration

### Manuscript Lifecycle
1. **Submission** → Author submits manuscript
2. **Screening** → Editorial assistant performs initial review
3. **Assignment** → Associate editor assigned
4. **Review** → Content review and decision
5. **Revision** → Author revisions (if needed)
6. **Publication** → Final acceptance and production

### Status Transitions
- `submitted` → `editorial_assistant_review`
- `editorial_assistant_review` → `associate_editor_assignment`
- `associate_editor_assignment` → `associate_editor_review`
- `associate_editor_review` → `reviewer_assignment`

## 📊 Performance Monitoring

### Metrics Tracked
- Screening completion rate
- Average screening time
- Quality accuracy scores
- Workload distribution
- Response times

### Reporting
- Daily screening reports
- Weekly performance summaries
- Monthly quality assessments
- Quarterly workflow analysis

## 🛠️ Customization

### Screening Templates
- Configurable quality criteria
- Adjustable thresholds
- Decision rule automation
- Category-specific settings

### Workflow Rules
- Time limit configuration
- Escalation triggers
- Notification preferences
- Auto-assignment rules

### Communication Templates
- Email customization
- Variable substitution
- Multi-language support
- Branding integration

## 🧪 Testing

### Manual Testing
1. **Login Test**
   - Valid credentials
   - Invalid credentials
   - Role verification
   - Session management

2. **Dashboard Test**
   - Route access
   - Data display
   - Navigation
   - Responsiveness

3. **Screening Test**
   - Form submission
   - Data validation
   - Workflow progression
   - Error handling

### Automated Testing
```bash
# Run test suite
npm test

# Run specific tests
npm test -- --grep "editorial assistant"

# Run with coverage
npm test -- --coverage
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Login Fails
- Check database connection
- Verify user exists in database
- Confirm password hash is correct
- Check role assignment

#### 2. Dashboard Access Denied
- Verify user role is `editorial-assistant`
- Check middleware configuration
- Confirm route permissions
- Validate session state

#### 3. Database Errors
- Check table existence
- Verify schema compatibility
- Confirm index creation
- Review constraint violations

### Debug Steps
1. Check browser console for errors
2. Review server logs
3. Verify database queries
4. Test API endpoints
5. Validate session data

## 📚 API Reference

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/session` - Session validation

### Editorial Assistant Endpoints
- `GET /api/editorial-assistant/manuscripts` - Manuscript list
- `POST /api/editorial-assistant/screening` - Screening submission
- `POST /api/editorial-assistant/assign-associate-editor` - Editor assignment
- `GET /api/editorial-assistant/stats` - Performance statistics

### Data Models
```typescript
interface EditorialAssistantProfile {
  id: string
  userId: string
  specializationAreas: string[]
  screeningCapacity: number
  currentDailyScreened: number
  averageScreeningTimeMinutes: number
  accuracyRate: number
  isAvailable: boolean
  availabilityStatus: string
}

interface ManuscriptScreening {
  id: string
  manuscriptId: string
  editorialAssistantId: string
  screeningStatus: string
  screeningDecision: string
  qualityScore: number
  completenessScore: number
  identifiedIssues: string[]
  screeningNotes: string
}
```

## 🔮 Future Enhancements

### Planned Features
1. **Multi-Factor Authentication**
   - TOTP support
   - SMS verification
   - Hardware key integration

2. **Advanced Analytics**
   - Machine learning insights
   - Predictive workload modeling
   - Quality trend analysis

3. **Mobile Application**
   - React Native app
   - Offline capability
   - Push notifications

4. **Integration APIs**
   - ORCID integration
   - CrossRef connectivity
   - External review systems

## 📞 Support

### Technical Support
- **Email**: `tech-support@amhsj.org`
- **Documentation**: `/docs/editorial-assistant`
- **Issues**: GitHub repository issues

### Editorial Support
- **Email**: `managing@amhsj.org`
- **Phone**: +1-555-0123
- **Hours**: Monday-Friday, 9 AM - 5 PM UTC

## 📄 License

This system is part of the AMHSJ Academic Journal Management Platform.
Copyright © 2024 AMHSJ Editorial Office. All rights reserved.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Compatibility**: Next.js 15+, PostgreSQL 12+
