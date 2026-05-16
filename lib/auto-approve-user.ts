import prisma from '@/lib/prisma'
import { REQUIRE_ADMIN_APPROVAL } from '@/lib/approval-config'

/** Auto-approve user and assign requested role when admin approval is disabled */
export async function ensureUserApproved(userId: string): Promise<void> {
  if (REQUIRE_ADMIN_APPROVAL) return

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roleRequests: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!user) return

  const roleName =
    user.requestedRole || user.roleRequests[0]?.requestedRole || 'developer'

  await prisma.$transaction(async (tx) => {
    await tx.roleRequest.updateMany({
      where: { userId, status: 'pending' },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
      },
    })

    const role = await tx.role.findUnique({ where: { name: roleName } })
    if (role) {
      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId,
          roleId: role.id,
        },
      })
    }

    if (user.approvalStatus !== 'approved') {
      await tx.user.update({
        where: { id: userId },
        data: {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          requestedRole: roleName,
        },
      })
    }
  })
}
