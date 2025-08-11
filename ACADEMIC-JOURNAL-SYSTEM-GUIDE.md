# Academic Journal System - Complete Guide

## Overview

The American Medical Journal of Health Sciences (AMJHS) is a comprehensive academic journal management system built with Next.js, featuring role-based access control, manuscript submission workflows, peer review processes, and editorial management tools.

---

## System Architecture

### Technology Stack
- **Frontend**: Next.js 13+ with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon Cloud)
- **Authentication**: bcrypt with session management
- **Styling**: Tailwind CSS with shadcn/ui components
- **ORM**: Drizzle ORM with TypeScript

### Key Features
- ✅ Role-based dashboard system
- ✅ Manuscript submission and tracking
- ✅ Peer review workflow
- ✅ Editorial communication system
- ✅ User profile management
- ✅ ORCID integration
- ✅ Research interest tracking
- ✅ Application status management

---

## Role-Based System

### Role Hierarchy

The system supports a comprehensive academic journal role structure with four primary database roles that expand into specialized positions:

#### 1. **ADMIN ROLE**
**Database Role**: `admin`
**Permissions**: Full system access, user management, system configuration

**Positions**:
- System Administrator

#### 2. **EDITOR ROLE** 
**Database Role**: `editor`
**Permissions**: Editorial oversight, manuscript management, reviewer assignment

**Positions**:
- Editor-in-Chief (highest editorial authority)
- Managing Editor (daily operations)
- Section Editor (subject-specific oversight)
- Production Editor (publication quality)
- Guest Editor (special issues)
- Associate Editor (general editorial support)

#### 3. **REVIEWER ROLE**
**Database Role**: `reviewer`
**Permissions**: Manuscript review, evaluation, recommendations

**Positions**:
- Senior Reviewer
- Expert Reviewer
- Guest Reviewer

#### 4. **AUTHOR ROLE**
**Database Role**: `author`  
**Permissions**: Manuscript submission, revision, communication

**Positions**:
- Research Author
- Corresponding Author
- Contributing Author

---

## System Workflow

### 1. **User Registration & Authentication**
```
New User → Registration → Profile Setup → Admin Approval → Account Activation
```

### 2. **Manuscript Submission Process**
```
Author Login → Dashboard → Submit Manuscript → Upload Files → 
Metadata Entry → Initial Review → Editor Assignment → Peer Review
```

### 3. **Editorial Workflow**
```
Manuscript Received → Editor-in-Chief Review → Section Editor Assignment → 
Reviewer Selection → Peer Review Process → Editorial Decision → 
Author Notification → Revision/Acceptance → Production
```

### 4. **Peer Review Process**
```
Reviewer Invitation → Review Assignment → Manuscript Evaluation → 
Recommendation Submission → Editorial Consideration → Decision Making
```

### 5. **Publication Pipeline**
```
Accepted Manuscript → Production Editor → Copy Editing → 
Author Proofing → Final Approval → Publication → Archive
```

---

## User Accounts & Login Credentials

### Test Environment Access

**⚠️ IMPORTANT**: These are test credentials for development. Change all passwords in production!

**Default Password for All Accounts**: `password123`

### Admin Accounts

#### System Administrator
- **Email**: `admin@amhsj.org`
- **Name**: System Administrator
- **Role**: Admin
- **Affiliation**: AMHSJ Editorial Office
- **Access**: Full system administration, user management, configuration
- **Profile Completeness**: 100%

### Editorial Team

#### Editor-in-Chief
- **Email**: `eic@amhsj.org`
- **Name**: Dr. Sarah Johnson
- **Role**: Editor (Editor-in-Chief position)
- **Affiliation**: Harvard Medical School
- **ORCID**: 0000-0002-1825-0097
- **Expertise**: Cardiovascular Medicine, Editorial Leadership
- **Access**: Highest editorial authority, final decisions
- **Profile Completeness**: 100%

#### Managing Editor
- **Email**: `managing@amhsj.org`
- **Name**: Dr. Michael Chen
- **Role**: Editor (Managing Editor position)
- **Affiliation**: Johns Hopkins University
- **Expertise**: Editorial Management, Peer Review Coordination
- **Access**: Daily operations, workflow management
- **Profile Completeness**: 100%

#### Section Editor - Cardiology
- **Email**: `cardiology.editor@amhsj.org`
- **Name**: Dr. Elizabeth Williams
- **Role**: Editor (Section Editor position)
- **Affiliation**: Mayo Clinic
- **Expertise**: Cardiology, Clinical Research
- **Access**: Subject-specific manuscript oversight
- **Profile Completeness**: 100%

#### Production Editor
- **Email**: `production@amhsj.org`
- **Name**: Dr. Lisa Thompson
- **Role**: Editor (Production Editor position)
- **Affiliation**: Stanford University
- **Expertise**: Editorial Production, Quality Assurance
- **Access**: Publication quality control, technical editing
- **Profile Completeness**: 100%

#### Guest Editor
- **Email**: `guest.ai@amhsj.org`
- **Name**: Dr. Ahmed Hassan
- **Role**: Editor (Guest Editor position)
- **Affiliation**: University of California, San Francisco
- **Expertise**: AI in Healthcare, Special Issues
- **Access**: Special issue management, thematic editing
- **Profile Completeness**: 100%

#### Associate Editor
- **Email**: `associate1@amhsj.org`
- **Name**: Dr. James Wilson
- **Role**: Editor (Associate Editor position)
- **Affiliation**: Cleveland Clinic
- **Expertise**: Internal Medicine, Peer Review
- **Access**: General editorial support, manuscript evaluation
- **Profile Completeness**: 100%

### Review Team

#### Senior Reviewer
- **Email**: `reviewer1@amhsj.org`
- **Name**: Dr. David Kim
- **Role**: Reviewer
- **Affiliation**: University of Chicago
- **Expertise**: Oncology, Cancer Research
- **Access**: Manuscript review, evaluation, recommendations
- **Profile Completeness**: 100%

### Authors

#### Research Author
- **Email**: `author1@example.org`
- **Name**: Dr. Rachel Martinez
- **Role**: Author
- **Affiliation**: University of Texas MD Anderson
- **Expertise**: Pediatrics, Child Development
- **Access**: Manuscript submission, revision, communication
- **Profile Completeness**: 95%

---

## Dashboard Access by Role

### Admin Dashboard
**URL**: `/admin`
**Access**: Admin role only
**Features**:
- User management
- System configuration
- Database monitoring
- Security settings
- Role assignments

### Editor-in-Chief Dashboard
**URL**: `/dashboard` (with editor role + EIC permissions)
**Features**:
- Complete editorial oversight
- Final decision authority
- Strategic planning tools
- Performance analytics
- Policy management

### Managing Editor Dashboard
**URL**: `/dashboard` (with editor role + managing permissions)
**Features**:
- Daily workflow management
- Manuscript tracking
- Reviewer coordination
- Timeline monitoring
- Quality control

### Section Editor Dashboard
**URL**: `/dashboard` (with editor role + section permissions)
**Features**:
- Subject-specific manuscripts
- Specialized reviewer network
- Field expertise matching
- Section analytics

### Production Editor Dashboard
**URL**: `/dashboard` (with editor role + production permissions)
**Features**:
- Publication pipeline
- Technical editing tools
- Quality assurance
- Format compliance
- Production scheduling

### Reviewer Dashboard
**URL**: `/reviewer`
**Features**:
- Review assignments
- Evaluation forms
- Recommendation tracking
- Expertise matching
- Review history

### Author Dashboard
**URL**: `/dashboard` (with author role)
**Features**:
- Manuscript submission
- Submission tracking
- Revision management
- Communication center
- Publication status

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Session validation

### User Management
- `GET /api/users` - List users (admin only)
- `PUT /api/users/[id]` - Update user profile
- `GET /api/users/profile` - Get current user profile

### Manuscripts
- `POST /api/manuscripts` - Submit manuscript
- `GET /api/manuscripts` - List manuscripts (role-based)
- `PUT /api/manuscripts/[id]` - Update manuscript
- `GET /api/manuscripts/[id]` - Get manuscript details

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews` - List reviews
- `PUT /api/reviews/[id]` - Update review

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/mark-read` - Mark as read
- `GET /api/messages/conversations` - Get conversations

---

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- email (Unique)
- name
- password (bcrypt hashed)
- role (admin|editor|reviewer|author)
- affiliation
- orcid
- bio
- expertise (JSONB)
- research_interests (ARRAY)
- is_verified (Boolean)
- is_active (Boolean)
- application_status (pending|approved|rejected)
- profile_completeness (Integer)
- specializations (JSONB)
- created_at
- updated_at
```

### Key Constraints
- Role constraint: Only allows `admin`, `editor`, `reviewer`, `author`
- Email uniqueness
- ORCID format validation
- Password complexity requirements

---

## Security Features

### Authentication
- bcrypt password hashing (12 rounds)
- Session-based authentication
- Role-based access control
- CSRF protection

### Database Security
- PostgreSQL with SSL (Neon Cloud)
- Parameterized queries (SQL injection prevention)
- Role-based data access
- Environment variable protection

### API Security
- Request validation
- Rate limiting
- Input sanitization
- Error handling

---

## Setup Instructions

### 1. Environment Configuration
Create `.env.local`:
```env
DATABASE_URL=your_neon_postgres_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 2. Database Setup
```bash
# Install dependencies
pnpm install

# Run essential roles setup
npm run setup-roles

# Verify users created
node scripts/verify-users.cjs
```

### 3. Development Server
```bash
# Start development server
pnpm dev

# Access application
# http://localhost:3000
```

### 4. Production Deployment
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Testing Workflows

### 1. Admin Workflow Test
1. Login as `admin@amhsj.org`
2. Access admin dashboard
3. Manage users and system settings
4. Monitor system performance

### 2. Editorial Workflow Test
1. Login as `eic@amhsj.org` (Editor-in-Chief)
2. Review submitted manuscripts
3. Assign section editors
4. Make editorial decisions

### 3. Review Workflow Test
1. Login as `reviewer1@amhsj.org`
2. Accept review invitation
3. Evaluate manuscript
4. Submit recommendation

### 4. Author Workflow Test
1. Login as `author1@example.org`
2. Submit new manuscript
3. Track submission status
4. Respond to reviews

---

## Maintenance & Monitoring

### Regular Tasks
- User account management
- Database backups
- Security updates
- Performance monitoring
- Content moderation

### Monitoring Endpoints
- Database health checks
- API performance metrics
- User activity logs
- Error tracking
- Security audit logs

---

## Support & Documentation

### Technical Support
- **System Admin**: admin@amhsj.org
- **Editorial Support**: eic@amhsj.org
- **Technical Issues**: Contact system administrator

### Additional Resources
- API documentation: `/docs/API.md`
- Component library: `/components/`
- Database schema: Check migration files
- Contributing guidelines: `CONTRIBUTING.md`

---

## Version Information

- **System Version**: 1.0.0
- **Last Updated**: August 10, 2025
- **Database Schema**: v1.0
- **Node.js**: 22.15.0
- **Next.js**: 13+
- **PostgreSQL**: 14+

---

*This documentation covers the complete academic journal management system. For technical implementation details, refer to the codebase and API documentation.*
