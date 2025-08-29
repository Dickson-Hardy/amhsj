# Editorial Assistant Login Redirect Fix

## Issue Summary
The editorial assistant login was redirecting to the general auth signin page (`/api/auth/signin?callbackUrl=%2Feditorial-assistant%2Flogin`) instead of using the dedicated editorial assistant login page.

## Root Cause
NextAuth was configured with a hardcoded `signIn: "/auth/login"` page, which meant that any unauthenticated request would always be redirected to the general login page, regardless of our middleware redirects.

## Solution Applied
Instead of trying to override NextAuth's signin page configuration, we implemented a client-side redirect in the general login page that detects when the callback URL is for editorial assistant routes and automatically redirects to the dedicated login page.

## Changes Made

### 1. Updated General Login Page (`app/auth/login/page.tsx`)
- Added `useEffect` hook to detect editorial assistant callback URLs
- Automatically redirects to `/editorial-assistant/login?callbackUrl=...` when appropriate
- Uses `router.replace()` for seamless redirection

```tsx
// Redirect to editorial assistant login if the callback URL is for editorial assistant
useEffect(() => {
  if (callbackUrl && callbackUrl.includes('/editorial-assistant')) {
    const redirectUrl = `/editorial-assistant/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    router.replace(redirectUrl)
  }
}, [callbackUrl, router])
```

### 2. Enhanced Editorial Assistant Login Component (`components/editorial-assistant-login.tsx`)
- Added `useSearchParams` to capture callback URL from query parameters
- Enhanced redirect logic to use callback URL after successful authentication
- Preserves the original intended destination

```tsx
const callbackUrl = searchParams.get('callbackUrl')
// ...
const targetUrl = redirectTo || callbackUrl || "/editorial-assistant"
router.push(targetUrl)
```

### 3. Maintained Middleware Protection (`middleware.ts`)
- Kept existing middleware logic for direct access protection
- Editorial assistant routes still redirect to dedicated login when accessed directly
- Role-based access control remains intact

## Flow After Fix

1. **User accesses** `/editorial-assistant` (unauthenticated)
2. **Middleware redirects** to `/editorial-assistant/login?callbackUrl=/editorial-assistant`
3. **Editorial assistant login page** loads with proper callback URL
4. **User authenticates** with editorial assistant credentials
5. **System validates** user has `editorial-assistant` role
6. **User redirected** to original destination (`/editorial-assistant`)

## Alternative Flow (via NextAuth)

1. **User accesses** `/editorial-assistant` (unauthenticated)
2. **NextAuth redirects** to `/api/auth/signin?callbackUrl=/editorial-assistant/login`
3. **General login page** loads and detects editorial assistant callback
4. **Client-side redirect** to `/editorial-assistant/login?callbackUrl=/editorial-assistant`
5. **Rest of flow** continues as above

## Benefits
- ✅ Preserves dedicated editorial assistant login experience
- ✅ Maintains role-based access control
- ✅ Works with both direct access and NextAuth redirects
- ✅ No changes required to NextAuth configuration
- ✅ Seamless user experience

## Testing
1. Navigate to `/editorial-assistant` when not logged in
2. Should be redirected to dedicated editorial assistant login page
3. Login with editorial assistant credentials
4. Should be redirected back to `/editorial-assistant` dashboard
5. Verify no 302 redirects to general signin page