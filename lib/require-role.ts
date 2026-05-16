import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import {
  getDashboardPath,
  getPrimaryRole,
  getUserRoleNames,
  SLUG_TO_ROLE,
  type SystemRole,
} from '@/lib/roles'

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  return user
}

export async function requireRole(allowedRoles: SystemRole[]) {
  const user = await requireAuth()
  const roleNames = getUserRoleNames(user)
  const hasAccess = allowedRoles.some((r) => roleNames.includes(r))

  if (!hasAccess) {
    const primary = getPrimaryRole(roleNames, user.requestedRole)
    redirect(getDashboardPath(primary))
  }

  return {
    user,
    roles: roleNames,
    primaryRole: getPrimaryRole(roleNames, user.requestedRole),
  }
}

export async function requireRoleSlug(slug: string) {
  const role = SLUG_TO_ROLE[slug]
  if (!role) redirect('/dashboard')
  return requireRole([role])
}

/** Admin and manager can access manager routes */
export async function requireManagerOrAdmin() {
  return requireRole(['admin', 'manager'])
}

/** Leads who can assign work */
export async function requireAssignmentRole() {
  return requireRole(['admin', 'manager', 'project_lead', 'team_lead'])
}

export function getDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email?: string | null
}) {
  if (user.firstName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ')
  }
  return user.name || user.email?.split('@')[0] || 'User'
}
