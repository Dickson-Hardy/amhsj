# API Standardization Refactoring Plan

## Overview
This document outlines the comprehensive refactoring plan to standardize all API inconsistencies in the AMHSJ project.

## Issues Identified

### 1. Authentication Import Inconsistencies
- **Files using correct pattern (`@/lib/auth`):** 42 files
- **Files using incorrect pattern (`@/app/api/auth/[...nextauth]/route`):** 24 files
- **Files using mixed auth methods:** 5 files

### 2. Response Structure Inconsistencies
- **Pattern 1 (success/error objects):** 18 files
- **Pattern 2 (direct responses):** 32 files
- **Pattern 3 (mixed approaches):** 16 files

### 3. Error Handling Inconsistencies
- **Files using `logError`:** 15 files
- **Files using `console.error`:** 28 files
- **Files using `logger.error`:** 8 files

## Refactoring Strategy

### Phase 1: Foundation (Completed)
- [x] Create `lib/api-utils.ts` with standardized utilities
- [x] Update `lib/logger.ts` with standardized logging

### Phase 2: Core API Routes (High Priority)
- [ ] Fix authentication imports in admin routes
- [ ] Standardize response patterns in user management APIs
- [ ] Unify error handling in submission workflows
- [ ] Consolidate validation patterns

### Phase 3: Secondary APIs (Medium Priority)
- [ ] Update analytics and monitoring routes
- [ ] Standardize archive and content management APIs
- [ ] Fix newsletter and notification patterns
- [ ] Unify search and filtering APIs

### Phase 4: Specialized APIs (Lower Priority)
- [ ] AI assessment and collaboration routes
- [ ] Integration and external service APIs
- [ ] Backup and maintenance utilities
- [ ] Development and testing utilities

## Implementation Steps

### Step 1: Authentication Standardization
**Target Files (24 files):**
```
app/api/admin/news/route.ts
app/api/admin/settings/route.ts
app/api/admin/issues/route.ts
app/api/admin/stats/route.ts
... (20 more files)
```

**Changes Required:**
1. Replace `import { authOptions } from "@/app/api/auth/[...nextauth]/route"`
2. With `import { requireAuth } from "@/lib/api-utils"`
3. Replace `getServerSession(authOptions)` with `requireAuth(request, allowedRoles)`

### Step 2: Response Pattern Standardization
**Changes Required:**
1. Replace direct `NextResponse.json()` calls
2. Use `createApiResponse()` for success responses
3. Use `createErrorResponse()` for error responses
4. Use `createPaginatedResponse()` for paginated data

### Step 3: Error Handling Standardization
**Changes Required:**
1. Replace `console.error()` with `logger.error()`
2. Use `withErrorHandler()` wrapper for route handlers
3. Use standardized error classes (ApiError, ValidationError, etc.)
4. Implement consistent database error handling

### Step 4: Validation Standardization
**Changes Required:**
1. Use `validateRequest()` for input validation
2. Standardize query parameter parsing with `parseQueryParams()`
3. Use common validation schemas from `commonSchemas`
4. Implement consistent role-based access control

## File-by-File Migration Plan

### High Priority Files (Core Functionality)

#### 1. Admin User Management
- `app/api/admin/users/route.ts`
  - Fix auth import: `@/app/api/auth/[...nextauth]/route` → `@/lib/api-utils`
  - Standardize responses: Direct responses → `createApiResponse/createErrorResponse`
  - Add role validation: Manual checks → `requireAuth(request, [ROLES.ADMIN])`

#### 2. Authentication Routes
- `app/api/auth/register/route.ts`
  - Standardize validation: Manual checks → `validateRequest()`
  - Unify error responses: Mixed patterns → `createErrorResponse()`
  - Add comprehensive logging: `console.error` → `logger.error`

#### 3. Submission Workflow
- `app/api/workflow/submit/route.ts`
  - Already uses good patterns, minor cleanup needed
  - Enhance error handling with new utilities
  - Add request ID tracking

### Medium Priority Files (Supporting Features)

#### 4. Content Management
- `app/api/admin/news/route.ts`
- `app/api/admin/settings/route.ts`
- `app/api/admin/issues/route.ts`

#### 5. Analytics and Monitoring
- `app/api/monitoring/route.ts`
- `app/api/analytics/*/route.ts`
- `app/api/metrics/route.ts`

### Lower Priority Files (Specialized Features)

#### 6. AI and Collaboration
- `app/api/ai/route.ts`
- `app/api/collaboration/route.ts`
- `app/api/ai-assessment/route.ts`

## Implementation Timeline

### Week 1: Foundation and High Priority
- Day 1-2: Admin and auth routes (8 files)
- Day 3-4: User management and submission workflows (6 files)
- Day 5: Testing and validation

### Week 2: Medium Priority
- Day 1-2: Content management APIs (8 files)
- Day 3-4: Analytics and monitoring (6 files)
- Day 5: Integration testing

### Week 3: Lower Priority and Cleanup
- Day 1-2: AI and specialized APIs (8 files)
- Day 3-4: Integration and utility APIs (4 files)
- Day 5: Final testing and documentation

## Quality Assurance Checklist

### For Each Updated File:
- [ ] Authentication uses `requireAuth()` with proper role validation
- [ ] Responses use standardized `createApiResponse()` patterns
- [ ] Errors use `createErrorResponse()` with proper status codes
- [ ] Input validation uses `validateRequest()` with Zod schemas
- [ ] Logging uses `logger.*()` methods instead of console
- [ ] Database errors handled with `handleDatabaseError()`
- [ ] Request parameters parsed with `parseQueryParams()`
- [ ] Route wrapped with `withErrorHandler()` if needed

### Testing Requirements:
- [ ] All existing tests pass
- [ ] API responses maintain backward compatibility
- [ ] Error responses include proper status codes
- [ ] Authentication and authorization work correctly
- [ ] Logging output is consistent and useful
- [ ] Performance is not degraded

## Benefits After Completion

### Developer Experience:
- Consistent patterns across all APIs
- Reduced cognitive load when working on different routes
- Better error messages and debugging
- Standardized validation and error handling

### Maintenance:
- Easier to update authentication logic
- Centralized response formatting
- Consistent logging for monitoring
- Simplified testing patterns

### Security:
- Standardized role-based access control
- Consistent input validation
- Better audit logging
- Reduced attack surface through consistency

### Monitoring:
- Structured logging for better insights
- Consistent error tracking
- Performance monitoring capabilities
- Better debugging information

## Risk Mitigation

### Backward Compatibility:
- All changes maintain existing API contracts
- Response structures remain compatible
- Authentication flows unchanged for users
- Database operations remain the same

### Testing Strategy:
- Update files in small batches
- Test each batch thoroughly before proceeding
- Maintain rollback capability
- Monitor production metrics after deployment

### Rollback Plan:
- Git commits for each file/batch
- Database migration scripts if needed
- Environment variable rollback procedures
- Quick deployment reversal capability