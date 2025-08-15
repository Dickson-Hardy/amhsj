# Status Definitions Update Summary

## Changes Made

### Status Name Changes
- `under_review` → `technical_check` (with display "Technical Check") 
- `peer_review` → `under_review` (with display "Under Review")

### Files Updated

#### Core Workflow Engine
1. **lib/workflow.ts**
   - Updated WorkflowStatus type definition
   - Updated WORKFLOW_TRANSITIONS state machine
   - Updated status assignments in submission and reviewer assignment logic
   - Updated default fallback status

#### Frontend Components
2. **app/dashboard/page.tsx**
   - Added technical_check status configuration with purple styling
   - Updated under_review to use Users icon (peer review metaphor)
   - Updated progress calculation (technical_check: 40%, under_review: 60%)
   - Updated priority calculation for faster technical check turnaround
   - Updated activity descriptions
   - Updated filter mappings and conditions
   - Updated submission filtering logic

3. **components/admin-submission-management.tsx**
   - Added technical_check status option
   - Updated status color coding

4. **app/editor/page.tsx**
   - Updated type definition for manuscript status
   - Added technical_check to status color mapping
   - Updated SelectItem options
   - Updated conditions for decision dialogs

5. **app/section-editor/page.tsx**
   - Updated mock submission status
   - Updated status color function with proper color coding

6. **app/guest-editor/page.tsx**
   - Updated mock submission status
   - Updated status color function

7. **app/editorial-board/application-status/page.tsx**
   - Added technical_check status with appropriate progress values
   - Updated conditions for review status display

8. **app/editor-in-chief/page.tsx**
   - Updated appeal status type definition

#### Analytics & Database
9. **lib/analytics.ts**
   - Updated query to include technical_check instead of peer_review

10. **create-submissions-table.cjs**
    - Updated CHECK constraint to include new status values

11. **update-status-definitions.cjs** (NEW FILE)
    - Database migration script to update existing records
    - Updates submissions, articles, and reviews tables
    - Updates status history in JSONB fields
    - Updates table constraints

#### Documentation & Tests
12. **docs/SUBMISSION-REVIEW-WORKFLOW.md**
    - Updated status definitions table
    - Updated workflow transition references

13. **__tests__/workflow.test.ts**
    - Updated test expectations for new workflow transitions

### Color Coding Standards
- **technical_check**: Purple (`bg-purple-100 text-purple-800`)
- **under_review**: Yellow (`bg-yellow-100 text-yellow-800`) 
- **published**: Indigo (changed from purple to avoid conflict)

### Progress Values
- submitted: 25%
- technical_check: 40%
- under_review: 60%
- revision_requested: 75%
- accepted/published: 100%

### Workflow State Machine
```
submitted → technical_check → under_review → [accepted/rejected/revision_requested]
```

### Next Steps
1. Run the database migration script when database is accessible:
   ```bash
   node update-status-definitions.cjs
   ```

2. Test the updated workflow in development environment

3. Update any additional frontend components that might reference the old status names

4. Update API documentation if it exists to reflect the new status definitions

### Benefits of Changes
- **technical_check**: More descriptive than "under_review" for editorial assessment phase
- **under_review**: Now clearly indicates peer review phase as intended
- **Better UX**: Clear distinction between editorial and peer review phases
- **Improved tracking**: Separate progress indicators for each phase
