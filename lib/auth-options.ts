import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import bcrypt from "bcryptjs"
import { ensureUserApproved } from "./auto-approve-user"
import { getPrimaryRole } from "./roles"
import { ensureBootstrapAdmin } from "./bootstrap-admin"

async function loadUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  })
  return userRoles.map((ur) => ur.role.name)
}

export const authOptions: NextAuthOptions = {
  // NOTE: PrismaAdapter is intentionally removed.
  // It conflicts with CredentialsProvider when using JWT sessions,
  // causing session creation to silently fail and redirect loops.
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        await ensureUserApproved(user.id)

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { approvalStatus: true },
        })

        const roles = await loadUserRoles(user.id)
        const primaryRole = getPrimaryRole(roles, user.requestedRole)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          approvalStatus: updatedUser?.approvalStatus ?? 'approved',
          roles,
          primaryRole,
        }
      },
    }),
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        nonce: { label: "Nonce", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.message || !credentials?.signature || !credentials?.nonce) {
          return null
        }

        const { address, message, signature, nonce } = credentials

        // Import web3 utils dynamically or directly
        const { verifyMessage, toChecksumAddress } = require("./web3-utils")
        
        // Verify the message contains the nonce
        if (!message.includes(nonce)) {
          return null
        }

        const checksumAddress = toChecksumAddress(address)

        // Find user and nonce
        const user = await prisma.user.findUnique({
          where: { walletAddress: checksumAddress },
          include: {
            nonces: {
              where: {
                value: nonce,
                used: false,
                expiresAt: { gt: new Date() }
              },
              take: 1
            }
          }
        })

        if (!user || user.nonces.length === 0) {
          return null
        }

        // Verify signature
        const recoveredAddress = await verifyMessage(message, signature)
        if (checksumAddress !== toChecksumAddress(recoveredAddress)) {
          return null
        }

        // Mark nonce as used
        await prisma.nonce.update({
          where: { id: user.nonces[0].id },
          data: { used: true }
        })

        await ensureUserApproved(user.id)

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { approvalStatus: true },
        })

        const roles = await loadUserRoles(user.id)
        const primaryRole = getPrimaryRole(roles, user.requestedRole)

        return {
          id: user.id,
          email: user.email,
          name: user.name || checksumAddress,
          approvalStatus: updatedUser?.approvalStatus ?? 'approved',
          roles,
          primaryRole,
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        await ensureBootstrapAdmin({
          id: user.id,
          email: user.email ?? undefined,
        })
        const roles = await loadUserRoles(user.id)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { requestedRole: true, approvalStatus: true },
        })
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.approvalStatus = dbUser?.approvalStatus ?? user.approvalStatus
        token.roles = roles
        token.primaryRole = getPrimaryRole(roles, dbUser?.requestedRole)
      }

      if ((trigger === 'update' || !token.roles) && token.id) {
        const roles = await loadUserRoles(token.id as string)
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { requestedRole: true },
        })
        token.roles = roles
        token.primaryRole = getPrimaryRole(roles, dbUser?.requestedRole)
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email
        session.user.name = token.name
        session.user.approvalStatus = token.approvalStatus as string
        session.user.roles = (token.roles as string[]) ?? []
        session.user.primaryRole = token.primaryRole
        session.user.role = token.primaryRole
      }
      return session
    },
  },
}
