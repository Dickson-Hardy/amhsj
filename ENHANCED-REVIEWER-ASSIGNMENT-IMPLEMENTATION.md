# Enhanced Reviewer Assignment Implementation

## Overview
Successfully implemented an intelligent reviewer assignment system that combines author recommendations with system-found candidates using a sophisticated 5-step workflow.

## Implementation Summary

### 1. Database Enhancement
- **Table Created**: `recommended_reviewers`
  - Fields: `id`, `articleId`, `name`, `email`, `affiliation`, `expertise`, `status`, `userId`, `createdAt`, `updatedAt`
  - Proper indexes and foreign key relationships
  - Migration executed successfully

### 2. Submission Form Enhancement
- **Updated**: `app/submit/page.tsx`
  - Added **Step 3: Recommend Reviewers** between manuscript details and submission confirmation
  - Minimum 3 reviewers required (max 10)
  - Fields captured: Name, Email, Affiliation, Expertise
  - Integrated with existing validation system

### 3. Validation Schema Updates
- **Enhanced**: `lib/validations.ts`
  - `recommendedReviewerSchema`: Validates individual reviewer data
  - `articleSubmissionSchema`: Updated to include recommended reviewers array
  - Min 3, max 10 reviewer validation rules

### 4. Core Workflow Engine
- **Enhanced**: `lib/workflow.ts`
  - **New Method**: `assignReviewersWithRecommendations()` 
  - Implements sophisticated 5-step workflow:
    1. **Retrieve** author-recommended reviewers from database
    2. **Validate & Score** recommended reviewers (existing users vs new invitations)
    3. **Find** additional qualified reviewers using system algorithm
    4. **Rank** all candidates with 20% boost for author recommendations
    5. **Select** optimal mix of recommended and system-found reviewers

### 5. API Integration
- **Created**: `/api/workflow/assign-reviewers-enhanced/route.ts`
  - **POST**: Execute enhanced reviewer assignment
  - **GET**: Preview recommended vs system reviewers without assignment
  - Comprehensive error handling and workflow tracking
  - Detailed response with assignment breakdown

### 6. Editor Dashboard Integration
- **Enhanced**: `app/editor/page.tsx`
  - Added new **"Enhanced Assignments"** tab
  - Integrated `ReviewerAssignmentPanel` component
  - Shows workflow breakdown and assignment sources

### 7. Advanced UI Component
- **Created**: `components/editor/reviewer-assignment-panel.tsx`
  - Real-time preview of recommended vs system candidates
  - Interactive assignment interface with workflow visualization
  - Source breakdown (Author Recommended vs System Found)
  - Assignment result summary with detailed workflow steps

## Key Features

### Intelligent Scoring Algorithm
- **Recommended Reviewers**: Base score + expertise match + system validation
- **System Candidates**: Standard algorithm with expertise/workload/quality factors
- **20% Boost**: Author recommendations receive scoring advantage
- **Conflict Detection**: Automatic filtering of conflicted reviewers

### 5-Step Workflow Process
1. **Step 1**: Retrieve author recommendations from database
2. **Step 2**: Validate and score recommended reviewers
3. **Step 3**: Find additional system candidates using AI matching
4. **Step 4**: Rank all candidates with recommendation boost
5. **Step 5**: Select optimal mix ensuring quality and balance

### Comprehensive Tracking
- Workflow step completion tracking
- Assignment source identification (recommended vs system)
- Error collection and reporting
- Performance metrics and analytics

### Editor Experience Enhancement
- Side-by-side preview of recommended vs system reviewers
- Real-time assignment execution with progress tracking
- Detailed workflow summary and breakdown
- Integration with existing editorial tools

## Technical Specifications

### Database Schema
```sql
CREATE TABLE recommended_reviewers (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  expertise TEXT,
  status TEXT DEFAULT 'suggested',
  user_id TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints
- `POST /api/workflow/assign-reviewers-enhanced` - Execute assignment
- `GET /api/workflow/assign-reviewers-enhanced?articleId={id}` - Preview candidates

### Validation Rules
- **Minimum 3 reviewers** required in recommendations
- **Maximum 10 reviewers** allowed
- **Email validation** for all recommended reviewers
- **Required fields**: Name, Email, Affiliation

### Workflow Configuration
- **Target Reviewers**: 2-5 (configurable)
- **Recommendation Boost**: 20% scoring advantage
- **Quality Threshold**: 70% minimum score
- **Conflict Filtering**: Automatic author exclusion

## Usage Instructions

### For Authors (Submission Process)
1. Complete manuscript details in Steps 1-2
2. **Step 3**: Recommend minimum 3 reviewers
   - Provide full name, email, and institutional affiliation
   - Add expertise keywords (optional)
   - Ensure no conflicts of interest
4. Complete submission in Steps 4-5

### For Editors (Assignment Process)
1. Navigate to Editor Dashboard
2. Select **"Enhanced Assignments"** tab
3. Choose manuscript ready for assignment
4. Review recommended vs system candidates preview
5. Set target reviewer count (2-5)
6. Execute **"Assign Reviewers"** button
7. Review assignment results with source breakdown

## Benefits Achieved

### Quality Improvement
- **Author Expertise**: Leverages author knowledge of field experts
- **System Validation**: Ensures quality through algorithmic scoring
- **Balanced Selection**: Optimal mix of recommended and system-found reviewers

### Efficiency Enhancement
- **Automated Processing**: 5-step workflow executes automatically
- **Real-time Preview**: Immediate feedback on candidate pool
- **Integrated Workflow**: Seamless integration with existing editorial process

### Transparency & Control
- **Source Tracking**: Clear identification of reviewer sources
- **Workflow Visibility**: Step-by-step process transparency
- **Editor Override**: Full editorial control maintained

## Future Enhancements

### Phase 2 Considerations
- **Machine Learning**: Advanced reviewer-article matching algorithms
- **Conflict Detection**: Enhanced conflict of interest identification
- **Review History**: Reviewer performance integration
- **International Diversity**: Geographic and institutional diversity optimization

### Integration Opportunities
- **External Databases**: Integration with academic databases (ORCID, Scopus)
- **AI Recommendations**: LLM-powered reviewer suggestions
- **Performance Analytics**: Advanced reviewer performance tracking

## Technical Notes

### Backward Compatibility
- Original `assignReviewers()` method preserved
- Existing workflows continue to function
- Graceful fallback mechanisms implemented

### Error Handling
- Comprehensive error collection and reporting
- Graceful degradation for partial failures
- Detailed logging for debugging and monitoring

### Performance Considerations
- Efficient database queries with proper indexing
- Lazy loading for large reviewer pools
- Caching for repeated system candidate searches

This implementation successfully addresses the user's requirements for author-recommended reviewers while maintaining system intelligence and editorial control.
