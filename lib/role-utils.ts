import { Session } from "next-auth"

/**
 * Get the appropriate dashboard route based on user role
 */
export function getRoleBasedDashboard(role: string | undefined): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "editor-in-chief":
      return "/editor-in-chief"
    case "managing-editor":
      return "/managing-editor"
    case "section-editor":
      return "/section-editor"
    case "guest-editor":
      return "/guest-editor"
    case "production-editor":
      return "/production-editor"
    case "editor":
      return "/editor" // Associate editor
    case "reviewer":
      return "/reviewer"
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
  if (callbackUrl && callbackUrl.startsWith("/")) {
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
  // Admin routes - highest level access
  if (route.startsWith("/admin")) {
    return userRole === "admin"
  }

  // Editor-in-Chief routes - ultimate editorial authority
  if (route.startsWith("/editor-in-chief")) {
    return userRole === "editor-in-chief" || userRole === "admin"
  }

  // Managing Editor routes - operational management
  if (route.startsWith("/managing-editor")) {
    return ["managing-editor", "editor-in-chief", "admin"].includes(userRole || "")
  }

  // Section Editor routes - specialized editorial areas
  if (route.startsWith("/section-editor")) {
    return ["section-editor", "managing-editor", "editor-in-chief", "admin"].includes(userRole || "")
  }

  // Guest Editor routes - special issue management
  if (route.startsWith("/guest-editor")) {
    return ["guest-editor", "section-editor", "managing-editor", "editor-in-chief", "admin"].includes(userRole || "")
  }

  // Production Editor routes - post-acceptance workflow
  if (route.startsWith("/production-editor")) {
    return ["production-editor", "managing-editor", "editor-in-chief", "admin"].includes(userRole || "")
  }

  // Associate Editor routes
  if (route.startsWith("/editor")) {
    return ["editor", "section-editor", "managing-editor", "editor-in-chief", "admin"].includes(userRole || "")
  }

  // Reviewer routes
  if (route.startsWith("/reviewer")) {
    return ["reviewer", "editor", "section-editor", "managing-editor", "editor-in-chief", "admin"].includes(userRole || "")
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
      return "System Administrator"
    case "editor-in-chief":
      return "Editor-in-Chief"
    case "managing-editor":
      return "Managing Editor"
    case "section-editor":
      return "Section Editor"
    case "guest-editor":
      return "Guest Editor"
    case "production-editor":
      return "Production Editor"
    case "editor":
      return "Associate Editor"
    case "reviewer":
      return "Peer Reviewer"
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
      return "Welcome to the System Administration Dashboard. Manage technical infrastructure and user accounts."
    case "editor-in-chief":
      return "Welcome, Editor-in-Chief. Lead the journal's scientific direction and make final editorial decisions."
    case "managing-editor":
      return "Welcome to the Managing Editor Dashboard. Oversee editorial operations and workflow management."
    case "section-editor":
      return "Welcome to the Section Editor Dashboard. Manage submissions in your specialized field."
    case "guest-editor":
      return "Welcome to the Guest Editor Dashboard. Manage your special issue submissions and reviewers."
    case "production-editor":
      return "Welcome to the Production Dashboard. Handle copyediting, typesetting, and publication workflow."
    case "editor":
      return "Welcome to the Associate Editor Dashboard. Review and manage assigned submissions."
    case "reviewer":
      return "Welcome back! Your expert reviews help maintain the quality of published research."
    case "author":
    case "user":
      return "Welcome to your research dashboard. Track your submissions and explore published articles."
    default:
      return "Welcome to AMHSJ Medical Research Journal."
  }
}

/**
 * Get role hierarchy level (higher number = more authority)
 */
export function getRoleHierarchy(role: string | undefined): number {
  switch (role) {
    case "admin":
      return 100 // System level
    case "editor-in-chief":
      return 90 // Highest editorial authority
    case "managing-editor":
      return 80 // Operational authority
    case "section-editor":
      return 70 // Subject area authority
    case "production-editor":
      return 60 // Production authority
    case "guest-editor":
      return 50 // Special issue authority
    case "editor":
      return 40 // Associate editorial authority
    case "reviewer":
      return 30 // Review authority
    case "author":
      return 20 // Submission authority
    case "user":
      return 10 // Basic user
    default:
      return 0 // No authority
  }
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export function canManageUser(managerRole: string | undefined, targetRole: string | undefined): boolean {
  return getRoleHierarchy(managerRole) > getRoleHierarchy(targetRole)
}

/**
 * Get roles that a user can assign to others
 */
export function getAssignableRoles(userRole: string | undefined): string[] {
  const userLevel = getRoleHierarchy(userRole)
  const allRoles = [
    { role: "author", level: 20 },
    { role: "reviewer", level: 30 },
    { role: "editor", level: 40 },
    { role: "guest-editor", level: 50 },
    { role: "production-editor", level: 60 },
    { role: "section-editor", level: 70 },
    { role: "managing-editor", level: 80 },
    { role: "editor-in-chief", level: 90 },
  ]
  
  return allRoles
    .filter(({ level }) => level < userLevel)
    .map(({ role }) => role)
}

/**
 * Get role-specific permissions
 */
export function getRolePermissions(role: string | undefined): {
  canManageUsers: boolean
  canAssignRoles: boolean
  canManageSubmissions: boolean
  canAssignReviewers: boolean
  canMakeFinalDecisions: boolean
  canManageProduction: boolean
  canManageSpecialIssues: boolean
  canAccessAnalytics: boolean
  canManageSystem: boolean
} {
  const hierarchy = getRoleHierarchy(role)
  
  return {
    canManageUsers: hierarchy >= 70, // Section editor and above
    canAssignRoles: hierarchy >= 80, // Managing editor and above
    canManageSubmissions: hierarchy >= 40, // Editor and above
    canAssignReviewers: hierarchy >= 40, // Editor and above
    canMakeFinalDecisions: hierarchy >= 70, // Section editor and above
    canManageProduction: hierarchy >= 60, // Production editor and above
    canManageSpecialIssues: hierarchy >= 50, // Guest editor and above
    canAccessAnalytics: hierarchy >= 40, // Editor and above
    canManageSystem: hierarchy >= 100, // Admin only
  }
}
