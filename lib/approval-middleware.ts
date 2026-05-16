import prisma from '@/lib/prisma'

export async function checkUserApprovalStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        approvalStatus: true,
        requestedRole: true,
      }
    })

    if (!user) {
      console.error('Error checking approval status: User not found')
      return null
    }

    return {
      approval_status: user.approvalStatus,
      requested_role: user.requestedRole,
    }
  } catch (error) {
    console.error('Error in checkUserApprovalStatus:', error)
    return null
  }
}

export function shouldRedirectToPendingApproval(
  pathname: string,
  approvalStatus: string
): boolean {
  // Pages that don't require approval
  const publicPaths = [
    '/auth',
    '/pending-approval',
    '/api',
    '/sign-out',
  ]

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // If user is not approved and trying to access dashboard (except pending-approval), redirect
  if (
    approvalStatus !== 'approved' &&
    pathname.startsWith('/dashboard') &&
    !pathname.includes('pending-approval')
  ) {
    return true
  }

  return false
}
