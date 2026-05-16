import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Optional: Add custom logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all dashboard paths
     */
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/projects/:path*",
    "/api/tasks/:path*",
  ],
}
