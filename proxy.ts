import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export default async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  })

  if (token) {
    return NextResponse.next()
  }

  const signInUrl = req.nextUrl.clone()
  signInUrl.pathname = "/auth/login"
  signInUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`
  )

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/projects/:path*",
    "/api/tasks/:path*",
    "/api/users/:path*",
  ],
}
