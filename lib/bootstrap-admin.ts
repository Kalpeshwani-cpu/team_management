import prisma from '@/lib/prisma'

/** Comma-separated emails (case-insensitive) that always receive admin + approved on login. */
export function parseBootstrapAdminEmails(): string[] {
  const raw = process.env.BOOTSTRAP_ADMIN_EMAILS?.trim()
  if (!raw) return []
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
}

/**
 * If the signed-in user is listed in BOOTSTRAP_ADMIN_EMAILS,
 * removes all existing admin role assignments, then assigns admin + approval to every
 * bootstrap email that has a row in public.users (and always the current auth user id).
 */
export async function ensureBootstrapAdmin(user: { id: string; email?: string | null } | null): Promise<void> {
  if (!user?.email) return
  const bootstrapEmails = parseBootstrapAdminEmails()
  if (bootstrapEmails.length === 0) return

  const emailNorm = user.email.trim().toLowerCase()
  if (!bootstrapEmails.includes(emailNorm)) return

  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  })

  if (!adminRole) {
    console.error('ensureBootstrapAdmin: admin role not found')
    return
  }

  try {
    await prisma.userRole.deleteMany({
      where: { roleId: adminRole.id },
    })
  } catch (delErr) {
    console.error('ensureBootstrapAdmin: failed to clear admin roles', delErr)
    return
  }

  const userIds = new Set<string>()
  userIds.add(user.id)

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: bootstrapEmails,
        mode: 'insensitive'
      }
    },
    select: { id: true }
  })
  
  for (const row of users) {
    userIds.add(row.id)
  }

  for (const uid of Array.from(userIds)) {
    try {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: uid,
            roleId: adminRole.id
          }
        },
        create: {
          userId: uid,
          roleId: adminRole.id
        },
        update: {}
      })
    } catch (insErr: any) {
      console.error('ensureBootstrapAdmin: insert user_roles failed', insErr)
    }
  }

  const now = new Date()
  for (const uid of Array.from(userIds)) {
    await prisma.user.update({
      where: { id: uid },
      data: {
        approvalStatus: 'approved',
        approvedBy: user.id,
        approvedAt: now,
        requestedRole: 'admin',
      }
    })

    await prisma.roleRequest.updateMany({
      where: {
        userId: uid,
        status: 'pending'
      },
      data: {
        status: 'approved',
        reviewedBy: user.id,
        reviewedAt: now,
      }
    })
  }
}
