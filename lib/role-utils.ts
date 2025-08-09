import { Session } from "next-auth"

/**
 * Get the appropriate dashboard route based on user role
 */
export function getRoleBasedDashboard(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "editor":
      return "/editor" // Dedicated editor dashboard
    case "reviewer":
      return "/reviewer" // Dedicated reviewer dashboard
    case "author":
    case "user":
    default:
      return "/dashboard"
  }
}

/**
 * Get the appropriate redirect URL after successful authentication
 */
export function getPostAuthRedirect(session: Session | null, callbackUrl?: string): string {
  // If there's a specific callback URL, use it (but validate it's safe)
  if (callbackUrl && (callbackUrl.startsWith("/") || callbackUrl.includes(window?.location?.hostname))) {
    return callbackUrl
  }

  // Otherwise, use role-based routing
  const userRole = session?.user?.role
  return getRoleBasedDashboard(userRole)
}

/**
 * Check if a user has access to a specific route based on their role
 */
export function hasRouteAccess(userRole: string | undefined, route: string): boolean {
  // Admin routes
  if (route.startsWith("/admin")) {
    return userRole === "admin"
  }

  // Editor routes
  if (route.startsWith("/editor")) {
    return userRole === "editor" || userRole === "admin"
  }

  // Reviewer routes
  if (route.startsWith("/reviewer")) {
    return userRole === "reviewer" || userRole === "editor" || userRole === "admin"
  }

  // Protected user routes
  if (route.startsWith("/dashboard") || route.startsWith("/submit")) {
    return !!userRole // Any authenticated user
  }

  // Public routes
  return true
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "Administrator"
    case "editor":
      return "Editor"
    case "reviewer":
      return "Reviewer"
    case "author":
      return "Author"
    case "user":
      return "User"
    default:
      return "Guest"
  }
}

/**
 * Get appropriate welcome message based on role
 */
export function getRoleWelcomeMessage(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "Welcome to the Admin Dashboard. Manage the journal, users, and submissions."
    case "editor":
      return "Welcome to the Editorial Dashboard. Review and manage submissions."
    case "reviewer":
      return "Welcome back! Your reviews help maintain the quality of our research."
    case "author":
    case "user":
      return "Welcome to your research dashboard. Track your submissions and explore published articles."
    default:
      return "Welcome to AMHSJ Medical Research Journal."
  }
}
