# API Standardization Quick Reference Guide

## 🚀 Quick Start for Developers

### Before (Old Pattern) ❌
```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const data = await fetchData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
```

### After (New Pattern) ✅
```typescript
import { NextRequest } from "next/server"
import { 
  requireAuth, 
  createApiResponse, 
  withErrorHandler,
  ROLES 
} from "@/lib/api-utils"

async function getData(request: NextRequest) {
  const session = await requireAuth(request, [ROLES.ADMIN])
  const data = await fetchData()
  return createApiResponse(data, "Data retrieved successfully")
}

export const GET = withErrorHandler(getData)
```

## 🔧 Common Patterns

### 1. Authentication & Authorization
```typescript
// Single role
const session = await requireAuth(request, [ROLES.ADMIN])

// Multiple roles  
const session = await requireAuth(request, [ROLES.ADMIN, ROLES.EDITOR_IN_CHIEF])

// No specific role (just authenticated)
const session = await requireAuth(request)
```

### 2. Response Patterns
```typescript
// Success response
return createApiResponse(data, "Operation successful")

// Success with pagination
return createPaginatedResponse(
  items, 
  { page: 1, limit: 20, total: 100 },
  "Items retrieved"
)

// Error response (automatic with withErrorHandler)
throw new ValidationError("Invalid input")
throw new NotFoundError("Resource not found")
```

### 3. Input Validation
```typescript
import { z } from "zod"

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "reviewer"])
})

async function createUser(request: NextRequest) {
  const body = await request.json()
  const data = validateRequest(CreateUserSchema, body)
  // data is now type-safe and validated
}
```

### 4. Query Parameters
```typescript
const { page, limit, search, sort, order } = parseQueryParams(request)
// All parameters are parsed and validated with defaults
```

### 5. Error Handling
```typescript
// Wrap your handler
export const GET = withErrorHandler(getData)
export const POST = withErrorHandler(createData)

// Or handle specific errors
try {
  await databaseOperation()
} catch (error) {
  return handleDatabaseError(error)
}
```

## 📋 Available Utilities

### Authentication
- `requireAuth(request, roles?)` - Authenticate and authorize
- `ROLES` - Constants for all user roles
- `hasPermission(userRole, requiredRole)` - Check role hierarchy

### Responses
- `createApiResponse(data, message?, requestId?)` - Success response
- `createErrorResponse(error, requestId?)` - Error response  
- `createPaginatedResponse(data, pagination, message?, requestId?)` - Paginated response

### Validation
- `validateRequest(schema, data)` - Zod validation with error handling
- `parseQueryParams(request)` - Parse and validate query parameters
- `commonSchemas` - Reusable validation schemas

### Error Handling
- `withErrorHandler(handler)` - Wrap route handlers
- `handleDatabaseError(error)` - Handle DB-specific errors
- `ApiError`, `ValidationError`, `AuthenticationError`, etc. - Error classes

### Logging
- `logger.api(message, context)` - API-specific logging
- `logger.auth(message, userId, action)` - Authentication logging
- `logger.security(message, context)` - Security event logging
- `logger.error/warn/info/debug(message, context)` - Standard logging

## 🎯 Role Constants
```typescript
ROLES.ADMIN                // "admin"
ROLES.EDITOR_IN_CHIEF     // "editor-in-chief"
ROLES.MANAGING_EDITOR     // "managing-editor"
ROLES.SECTION_EDITOR      // "section-editor"
ROLES.GUEST_EDITOR        // "guest-editor"
ROLES.PRODUCTION_EDITOR   // "production-editor"
ROLES.ASSOCIATE_EDITOR    // "editor"
ROLES.REVIEWER            // "reviewer"
ROLES.AUTHOR              // "author"
```

## 📖 Common Schemas
```typescript
import { commonSchemas } from "@/lib/api-utils"

// Use pre-built schemas
const PaginationSchema = commonSchemas.pagination
const EmailSchema = commonSchemas.email
const RoleSchema = commonSchemas.role
const IdSchema = commonSchemas.id
```

## ⚡ Migration Checklist

When updating an existing API route:

### 1. Update Imports
- [ ] Replace auth imports with `@/lib/api-utils`
- [ ] Add necessary utilities (requireAuth, createApiResponse, etc.)
- [ ] Remove old imports (getServerSession, etc.)

### 2. Update Authentication
- [ ] Replace `getServerSession(authOptions)` with `requireAuth(request, [ROLES.X])`
- [ ] Remove manual role checking if statements
- [ ] Update role constants to use `ROLES.X`

### 3. Update Responses
- [ ] Replace `NextResponse.json({ success: true, ... })` with `createApiResponse(...)`
- [ ] Replace error responses with `throw new XError(...)` or `createErrorResponse(...)`
- [ ] Add pagination support if needed

### 4. Update Validation
- [ ] Create Zod schemas for input validation
- [ ] Use `validateRequest()` instead of manual validation
- [ ] Use `parseQueryParams()` for query parameters

### 5. Update Error Handling
- [ ] Wrap handler with `withErrorHandler()`
- [ ] Replace `console.error()` with `logger.error()`
- [ ] Use `handleDatabaseError()` for database operations

### 6. Test & Verify
- [ ] Test authentication flows
- [ ] Verify response structure matches API contracts
- [ ] Check error scenarios return proper status codes
- [ ] Ensure logging is working correctly

## 🛠️ Validation Tool
Run this command to check your progress:
```bash
node scripts/validate-api-standardization.cjs
```

## 📞 Need Help?

- Check existing updated files for examples:
  - `app/api/admin/users/route.ts`
  - `app/api/admin/news/route.ts` 
  - `app/api/admin/settings/route.ts`
- Review the full implementation report: `API-STANDARDIZATION-IMPLEMENTATION-REPORT.md`
- Use the validation script to identify remaining issues