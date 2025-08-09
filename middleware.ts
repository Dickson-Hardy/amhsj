import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { apiRateLimit, authRateLimit } from "@/lib/rate-limit"

export default withAuth(
  async function middleware(req) {
    try {
      // Maintenance Mode Check (Production Only)
      if (process.env.NODE_ENV === 'production' && process.env.MAINTENANCE_MODE === 'true') {
        const isMaintenancePage = req.nextUrl.pathname.startsWith('/maintenance')
        const isApiHealthCheck = req.nextUrl.pathname === '/api/health'
        const isStaticAsset = req.nextUrl.pathname.startsWith('/_next') || 
                             req.nextUrl.pathname.startsWith('/favicon') ||
                             req.nextUrl.pathname.startsWith('/images') ||
                             req.nextUrl.pathname.startsWith('/icons')

        // Skip maintenance redirect for excluded paths
        if (!isMaintenancePage && !isApiHealthCheck && !isStaticAsset) {
          const maintenanceUrl = req.nextUrl.clone()
          maintenanceUrl.pathname = '/maintenance'
          maintenanceUrl.searchParams.set('return', req.nextUrl.pathname)
          return NextResponse.redirect(maintenanceUrl)
        }
      }

      // Apply rate limiting
      if (req.nextUrl.pathname.startsWith("/api/")) {
        const rateLimit = req.nextUrl.pathname.startsWith("/api/auth/") ? authRateLimit : apiRateLimit
        
        try {
          const { allowed, remaining, resetTime } = await rateLimit.isAllowed(req)

          if (!allowed) {
            return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": resetTime.toString(),
              },
            })
          }

          // Add rate limit headers to successful responses
          const response = NextResponse.next()
          response.headers.set("X-RateLimit-Remaining", remaining.toString())
          response.headers.set("X-RateLimit-Reset", resetTime.toString())
          return response
        } catch (rateLimitError) {
          console.error("Rate limiting error:", rateLimitError)
          // Continue without rate limiting if there's an error
        }
      }

      // Security headers
      const response = NextResponse.next()
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("Referrer-Policy", "origin-when-cross-origin")
      response.headers.set("X-XSS-Protection", "1; mode=block")

      return response
    } catch (error) {
      console.error("Middleware error:", error)
      return NextResponse.next()
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin" || token?.role === "editor"
        }

        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }

        // Protect submission routes
        if (req.nextUrl.pathname.startsWith("/submit")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for maintenance page in dev mode
     * and health checks in production
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    "/admin/:path*", 
    "/dashboard/:path*", 
    "/submit/:path*", 
    "/api/:path*"
  ],
}
