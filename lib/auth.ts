import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth-options"
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import prisma from "./prisma"
import bcrypt from "bcryptjs"

// Server-side authentication functions
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      roles: {
        include: {
          role: true
        }
      },
      department: true
    }
  })

  if (!user) {
    return null
  }

  return user
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions)
  return !!session
}

export async function getUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true }
  })

  return userRoles.map(ur => ({
    roles: {
      name: ur.role.name,
      permissions: ur.role.permissions
    }
  }))
}

export async function hasRole(userId: string, roleName: string) {
  const roles = await getUserRoles(userId)
  return roles.some((r: any) => r.roles?.name === roleName)
}

export async function hasPermission(
  userId: string,
  permission: string
) {
  const roles = await getUserRoles(userId)
  return roles.some((r: any) =>
    r.roles?.permissions?.includes(permission)
  )
}

// Client-side authentication functions (re-exporting from next-auth/react)
export const signInClient = async (email: string) => {
  // We use the email provider for passwordless login (magic links)
  // This avoids the "email limit" issue by using Resend
  return await nextAuthSignIn("email", { email, callbackUrl: "/dashboard" })
}

export const signOutClient = async () => {
  return await nextAuthSignOut({ callbackUrl: "/" })
}

export async function signUp(email: string, password: string, firstName?: string, lastName?: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null,
      approvalStatus: "pending",
      isActive: true,
    }
  })

  return { user }
}
