# AMHSJ Editorial Workflow Implementation

## 🎯 Overview

This document describes the complete implementation of the AMHSJ (Advances in Medicine and Health Sciences Journal) editorial workflow system. The system has been built to match your exact specifications with the Editorial Assistant as the first gatekeeper.

## 🔄 Complete Workflow Flow

### **Stage 1: Author Submission**
```
Author → Submit Manuscript → Hits Editorial Assistant Email + Dashboard
```
- **Route**: `/submit`
- **Status**: `"submitted"`
- **Email**: `submission@amhsj.org` gets notification
- **Dashboard**: Editorial Assistant sees new submission

### **Stage 2: Editorial Assistant Review**
```
Editorial Assistant → Performs All Checks → Decision Point
```
**Checks Performed:**
- ✅ File completion (all required documents)
- ✅ Plagiarism check (offline verification)
- ✅ Basic quality assessment
- ✅ Format compliance

**Decision Options:**
- ✅ **Pass**: Move to associate editor assignment
- ❌ **Return to Author**: If errors/incomplete

**If Return to Author:**
- 📧 Email sent to author
- 📱 Dashboard updated for author
- 🔄 Author sees feedback and can resubmit

### **Stage 3: Associate Editor Assignment**
```
Editorial Assistant → Select Associate Editor → Email Sent
```
- **Route**: `/editorial-assistant/assignment/[id]`
- **Status**: `"associate_editor_review"`
- **Email**: Associate Editor gets assignment notification
- **Assignment**: Based on specialization/field

### **Stage 4: Associate Editor Review**
```
Associate Editor → Content Review + Questionnaire → Decision
```
**What Happens:**
1. Associate Editor reviews manuscript content
2. **Must fill questionnaire** confirming:
   - No affiliations with authors
   - No conflicts of interest
   - Professional objectivity
3. After review → Pushes to reviewer selection

### **Stage 5: Reviewer Assignment**
```
Associate Editor → Select Reviewer → Email Sent
```
- **Route**: `/editor/reviewer-assignment`
- **Status**: `"under_review"`
- **Email**: Reviewer gets invitation
- **Response**: Accept/decline with questionnaire

### **Stage 6: Reviewer Assessment**
```
Reviewer → Review + Questionnaire → Decision
```
**What Happens:**
1. Reviewer performs detailed manuscript review
2. **Must fill questionnaire** (similar to Associate Editor)
3. Makes decision with detailed comments:
   - ✅ **Accept**: Ready for publication
   - 🔄 **Minor Revision**: Small changes needed
   - 🔄 **Major Revision**: Significant changes required
   - ❌ **Reject**: Not suitable

### **Stage 7: Revision Process (If Applicable)**
```
Revision Requested → Author Response → Associate Editor Review
```
**Minor Revision Flow:**
1. Author receives revision request + comments
2. Author makes changes + resubmits
3. Manuscript goes back to Associate Editor
4. Associate Editor reviews revised version

**Major Revision Flow:**
1. Author receives major revision request
2. Author makes significant changes + resubmits
3. Goes back to Associate Editor for re-evaluation

### **Stage 8: Final Acceptance**
```
Associate Editor → Accept → Forward to Editor-in-Chief
```
- **Status**: `"accepted"`
- **System**: Forwards to Editor-in-Chief
- **Notification**: Editor-in-Chief gets manuscript

### **Stage 9: Editor-in-Chief Final Review**
```
Editor-in-Chief → Review → Forward to Production
```
- **Status**: `"accepted"` → `"published"`
- **Decision**: If satisfied → Production team

### **Stage 10: Production & Publication**
```
Production Team → Formatting → Proof → Author → Publication
```
- **Status**: `"published"`
- **Process**: Formatting, proof generation, author approval
- **Result**: Published in appropriate journal section

## 🏗️ Technical Implementation

### **New Database Tables**
1. **`conflict_questionnaires`** - Stores conflict of interest responses
2. **`workflow_time_limits`** - Configurable time limits for each stage

### **New API Endpoints**
1. **`/api/editorial-assistant/screening`** - Initial manuscript screening
2. **`/api/editorial-assistant/assign-associate-editor`** - Associate editor assignment
3. **`/api/questionnaire/conflict-check`** - Conflict of interest questionnaires
4. **`/api/editorial-assistant/manuscripts`** - Dashboard manuscript list
5. **`/api/editorial-assistant/stats`** - Dashboard statistics

### **New Workflow Statuses**
- `"editorial_assistant_review"` - Initial screening stage
- `"associate_editor_assignment"` - Ready for editor assignment
- `"associate_editor_review"` - Editor content review
- `"reviewer_assignment"` - Ready for reviewer assignment

### **New Role: Editorial Assistant**
- **Role ID**: `editorial-assistant`
- **Hierarchy Level**: 35 (between Associate Editor and Reviewer)
- **Permissions**: Initial screening, associate editor assignment
- **Dashboard**: `/editorial-assistant`

## 🚀 Getting Started

### **1. Setup Database Schema**
```bash
# Run the setup script
pnpm run setup-editorial-assistant

# This creates a SQL script that you need to run in your database
psql -d your_database_name -f scripts/setup-editorial-assistant.sql
```

### **2. Start Development Server**
```bash
pnpm dev
```

### **3. Login as Editorial Assistant**
- **Email**: `editorial.assistant@amhsj.org`
- **Password**: `password123`
- **Role**: `editorial-assistant`

### **4. Navigate to Editorial Assistant Dashboard**
- **URL**: `/editorial-assistant`
- **Features**: Manuscript screening, statistics, assignment management

## 📧 Email Configuration

### **Required Email Addresses**
1. **① submission@amhsj.org** - Receives all new submissions
2. **② mcognue@amhsj.org** - Handles editorial assignments
3. **③ editor-in-chief@amhsj.org** - Makes final decisions
4. **④ proof&publication@amhsj.org** - Manages production

### **Email Templates**
The system includes email templates for:
- Submission notifications
- Editorial assignments
- Review invitations
- Decision notifications
- Production updates

## ⏰ Time Limits & Reminders

### **Configurable Deadlines**
- **Editorial Assistant Review**: 7 days
- **Associate Editor Review**: 14 days
- **Reviewer Review**: 21 days

### **Automated Reminders**
- **Before Deadline**: 7, 3, 1 days
- **After Deadline**: 7, 14, 21 days (escalation)

### **Overdue Handling**
- Automatic status updates
- Escalation notifications
- Dashboard highlighting

## 🔒 Conflict of Interest System

### **Questionnaire Requirements**
Both Associate Editors and Reviewers must complete questionnaires covering:
- **Affiliations**: Personal or professional connections
- **Collaborations**: Research partnerships
- **Financial Interests**: Funding or commercial interests
- **Personal Relationships**: Family or close personal ties
- **Institutional Conflicts**: University or organization conflicts

### **Automatic Detection**
- System automatically detects conflicts
- Prevents conflicted users from reviewing
- Generates detailed conflict reports

## 📊 Dashboard Features

### **Editorial Assistant Dashboard**
- **Statistics Cards**: Pending, screened today, average time, overdue
- **Manuscript Management**: Three-tab system (pending, screening, assignment)
- **Search & Filtering**: By title, author, status, priority
- **Action Buttons**: Screen manuscript, assign editor

### **Real-time Updates**
- Live status changes
- Instant notifications
- Progress tracking

## 🧪 Testing the Workflow

### **Test Scenario 1: Complete Flow**
1. Submit manuscript as author
2. Login as editorial assistant
3. Perform initial screening
4. Assign to associate editor
5. Login as associate editor
6. Complete questionnaire and review
7. Assign to reviewer
8. Login as reviewer
9. Complete questionnaire and review
10. Make decision (accept/reject/revise)

### **Test Scenario 2: Revision Flow**
1. Follow steps 1-9 above
2. Request minor revision
3. Login as author
4. Submit revision
5. Continue from associate editor review

### **Test Scenario 3: Conflict Detection**
1. Create user with conflicts
2. Attempt to assign as editor/reviewer
3. Verify system prevents assignment
4. Check conflict report generation

## 🔧 Configuration Options

### **Workflow Customization**
- Adjustable time limits per stage
- Configurable reminder schedules
- Customizable email templates
- Flexible role permissions

### **System Settings**
- Plagiarism check integration
- File format requirements
- Quality assessment criteria
- Notification preferences

## 📈 Monitoring & Analytics

### **Performance Metrics**
- Screening completion rates
- Average processing times
- Overdue manuscript counts
- User activity tracking

### **Quality Assurance**
- Review quality scores
- Editor performance metrics
- Conflict detection rates
- Decision consistency analysis

## 🚨 Troubleshooting

### **Common Issues**
1. **Manuscript stuck in screening**: Check editorial assistant assignments
2. **No associate editors available**: Verify user roles and specializations
3. **Questionnaire not working**: Check conflict_questionnaires table
4. **Email notifications failing**: Verify email service configuration

### **Debug Tools**
- Workflow status history
- User activity logs
- System error tracking
- Database query monitoring

## 🔮 Future Enhancements

### **Planned Features**
- AI-powered manuscript screening
- Automated conflict detection
- Advanced analytics dashboard
- Mobile app support
- Integration with external databases

### **Scalability Improvements**
- Microservices architecture
- Load balancing
- Database sharding
- CDN integration

## 📞 Support & Contact

### **Technical Support**
- Check system logs for errors
- Verify database connectivity
- Test API endpoints individually
- Review user permissions

### **Documentation**
- API documentation: `/api/docs`
- User guides: `/docs/user-guides`
- Admin manual: `/docs/admin-manual`
- Developer docs: `/docs/developer`

---

## ✨ Summary

The AMHSJ editorial workflow system has been completely implemented according to your specifications:

✅ **Editorial Assistant** as first gatekeeper  
✅ **Complete screening workflow** with file and plagiarism checks  
✅ **Associate Editor assignment** system  
✅ **Conflict of interest questionnaires** for all reviewers  
✅ **Configurable time limits** and automated reminders  
✅ **Full revision workflow** (minor/major)  
✅ **Production pipeline** integration  
✅ **Real-time dashboard** with statistics and monitoring  

The system is ready for testing and can be customized further based on your specific needs. All email addresses from your flowchart are supported, and the workflow follows the exact sequence you specified.
