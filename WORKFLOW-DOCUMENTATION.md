# 📋 Academic Journal Workflow Documentation

## System Flow Overview

### 1. **User Onboarding Flow**

```mermaid
graph TD
    A[New User Visits Site] --> B[Registration Form]
    B --> C[Profile Setup]
    C --> D[ORCID Verification]
    D --> E[Application Submission]
    E --> F[Admin Review]
    F --> G{Approval Decision}
    G -->|Approved| H[Account Activated]
    G -->|Rejected| I[Rejection Notice]
    H --> J[Welcome Email]
    J --> K[Dashboard Access]
```

---

### 2. **Manuscript Submission Flow**

```mermaid
graph TD
    A[Author Login] --> B[Dashboard Access]
    B --> C[New Submission]
    C --> D[Manuscript Upload]
    D --> E[Metadata Entry]
    E --> F[Author Information]
    F --> G[Abstract & Keywords]
    G --> H[Supplementary Files]
    H --> I[Review & Submit]
    I --> J[Initial Screening]
    J --> K{Quality Check}
    K -->|Pass| L[Editor Assignment]
    K -->|Fail| M[Return to Author]
    L --> N[Peer Review Process]
```

---

### 3. **Editorial Decision Flow**

```mermaid
graph TD
    A[Manuscript Received] --> B[Editor-in-Chief Review]
    B --> C{Initial Assessment}
    C -->|Scope Match| D[Section Editor Assignment]
    C -->|Out of Scope| E[Desk Rejection]
    D --> F[Reviewer Selection]
    F --> G[Review Invitations]
    G --> H[Peer Review Phase]
    H --> I[Reviews Collected]
    I --> J[Editorial Discussion]
    J --> K{Final Decision}
    K -->|Accept| L[Production Phase]
    K -->|Minor Revision| M[Author Revision]
    K -->|Major Revision| N[Re-review Process]
    K -->|Reject| O[Rejection Notice]
    M --> P[Revised Submission]
    N --> P
    P --> Q[Editor Re-evaluation]
```

---

### 4. **Peer Review Process**

```mermaid
graph TD
    A[Reviewer Invitation] --> B{Accept Review?}
    B -->|Yes| C[Review Assignment]
    B -->|No| D[Find Alternative Reviewer]
    C --> E[Manuscript Access]
    E --> F[Evaluation Period]
    F --> G[Review Form Completion]
    G --> H[Recommendation Submission]
    H --> I[Editor Notification]
    I --> J[Review Aggregation]
    J --> K[Editorial Decision]
    D --> A
```

---

### 5. **Role-Based Access Control**

```mermaid
graph TD
    A[User Login] --> B{Role Check}
    B -->|Admin| C[Admin Dashboard]
    B -->|Editor| D[Editorial Dashboard]
    B -->|Reviewer| E[Reviewer Dashboard]
    B -->|Author| F[Author Dashboard]
    
    C --> C1[User Management]
    C --> C2[System Config]
    C --> C3[Analytics]
    
    D --> D1[Manuscript Overview]
    D --> D2[Review Management]
    D --> D3[Decision Tools]
    
    E --> E1[Review Assignments]
    E --> E2[Evaluation Forms]
    E --> E3[Review History]
    
    F --> F1[Submit Manuscript]
    F --> F2[Track Submissions]
    F --> F3[Revision Management]
```

---

## Role Responsibilities Matrix

### Administrative Roles

| Function | System Admin | Editor-in-Chief | Managing Editor |
|----------|-------------|-----------------|-----------------|
| User Management | ✅ Full Control | ✅ Editorial Team | ❌ |
| System Configuration | ✅ | ❌ | ❌ |
| Final Editorial Decisions | ❌ | ✅ | ✅ (Delegated) |
| Policy Setting | ✅ | ✅ | ✅ (Input) |
| Financial Oversight | ✅ | ✅ | ❌ |

### Editorial Roles

| Function | Section Editor | Production Editor | Guest Editor | Associate Editor |
|----------|----------------|-------------------|--------------|------------------|
| Manuscript Assignment | ✅ (In Field) | ❌ | ✅ (Special Issues) | ✅ (General) |
| Reviewer Selection | ✅ | ❌ | ✅ | ✅ |
| Quality Control | ✅ | ✅ | ✅ | ✅ |
| Production Oversight | ❌ | ✅ | ❌ | ❌ |
| Special Issues | ❌ | ❌ | ✅ | ❌ |

### Review & Author Roles

| Function | Reviewer | Author |
|----------|----------|---------|
| Manuscript Evaluation | ✅ | ❌ |
| Submission Rights | ❌ | ✅ |
| Revision Submission | ❌ | ✅ |
| Review Assignment | ✅ | ❌ |

---

## Communication Flow

### Internal Editorial Communication

```mermaid
graph LR
    A[Editor-in-Chief] <--> B[Managing Editor]
    B <--> C[Section Editor]
    C <--> D[Associate Editor]
    A <--> E[Production Editor]
    C <--> F[Guest Editor]
    
    G[Reviewer] --> C
    C --> G
    
    H[Author] --> B
    B --> H
```

### External Communication

```mermaid
graph TD
    A[Journal System] --> B[Email Notifications]
    A --> C[Dashboard Messages]
    A --> D[ORCID Integration]
    A --> E[Publisher Platform]
    
    B --> F[Status Updates]
    B --> G[Review Requests]
    B --> H[Decision Letters]
    
    C --> I[Internal Messaging]
    C --> J[Task Assignments]
    C --> K[Announcements]
```

---

## Status Tracking System

### Application Status Flow
```
Registration → Pending → Under Review → Approved/Rejected → Active
```

### Manuscript Status Flow
```
Submitted → Initial Review → Under Review → 
In Revision → Re-review → Decision → 
Accepted/Rejected → Production → Published
```

### Review Status Flow
```
Invited → Accepted → In Progress → 
Completed → Submitted → Reviewed by Editor
```

---

## Dashboard Features by Role

### Admin Dashboard Features
- 👥 **User Management**: Create, edit, deactivate accounts
- 📊 **System Analytics**: Performance metrics, usage stats
- ⚙️ **Configuration**: System settings, role permissions
- 🔒 **Security**: Access logs, security settings
- 📈 **Reports**: Custom reports, data exports

### Editor-in-Chief Dashboard Features
- 📋 **Editorial Oversight**: All manuscript tracking
- 👨‍💼 **Team Management**: Editorial team coordination
- 📊 **Performance Metrics**: Journal performance analytics
- 📝 **Policy Management**: Editorial policies and guidelines
- 🎯 **Strategic Planning**: Long-term journal direction

### Managing Editor Dashboard Features
- 📄 **Daily Operations**: Manuscript flow management
- ⏰ **Timeline Monitoring**: Deadline tracking and alerts
- 👥 **Reviewer Coordination**: Reviewer database management
- 📞 **Communication Hub**: Editorial team communication
- 🔄 **Workflow Optimization**: Process improvement tools

### Section Editor Dashboard Features
- 🔬 **Subject Expertise**: Field-specific manuscript handling
- 👨‍🔬 **Specialist Network**: Subject matter expert reviewers
- 📊 **Field Analytics**: Subject area performance metrics
- 🎯 **Expertise Matching**: Author-reviewer alignment tools

### Production Editor Dashboard Features
- 📖 **Publication Pipeline**: Production workflow management
- ✅ **Quality Assurance**: Final publication checks
- 📐 **Format Compliance**: Style and format validation
- 📅 **Schedule Management**: Publication timeline coordination

### Reviewer Dashboard Features
- 📝 **Active Reviews**: Current review assignments
- 📚 **Review History**: Past review track record
- ⭐ **Expertise Profile**: Research specialization management
- 📊 **Performance Metrics**: Review quality metrics

### Author Dashboard Features
- 📤 **Submission Portal**: Manuscript submission interface
- 📊 **Tracking System**: Submission status monitoring
- 🔄 **Revision Management**: Response to reviewer comments
- 📞 **Communication Center**: Editorial correspondence
- 📈 **Publication History**: Author publication record

---

## Data Flow Architecture

### User Authentication Flow
```
Login Request → Credential Validation → bcrypt Verification → 
Session Creation → Role Assignment → Dashboard Redirect
```

### Database Operations Flow
```
API Request → Input Validation → Role Authorization → 
Database Query → Data Processing → Response Formatting → 
Client Response
```

### File Upload Flow
```
File Selection → Validation (type/size) → Secure Upload → 
Database Reference → Storage Confirmation → User Notification
```

---

## Security & Privacy Flow

### Access Control
```
User Request → Authentication Check → Role Verification → 
Resource Authorization → Action Logging → Response
```

### Data Protection
```
Sensitive Data → Encryption → Secure Storage → 
Access Logging → Regular Backups → Audit Trail
```

---

**Document Version**: 1.0  
**Last Updated**: August 10, 2025  
**System Status**: ✅ Operational
