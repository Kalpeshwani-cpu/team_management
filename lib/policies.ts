import { hasRole, hasPermission } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PERMISSIONS, ROLES, type SystemRole } from '@/lib/roles'

type UserWithRoles = {
  id: string
  roles?: { role: { name: string; permissions?: string[] } }[]
}

export async function canCreateProject(user: UserWithRoles): Promise<boolean> {
  return (
    (await hasPermission(user.id, PERMISSIONS.CREATE_PROJECT, user)) ||
    (await hasRole(user.id, ROLES.PROJECT_LEAD, user)) ||
    (await hasRole(user.id, ROLES.MANAGER, user)) ||
    (await hasRole(user.id, ROLES.ADMIN, user))
  )
}

export async function canViewAllProjects(user: UserWithRoles): Promise<boolean> {
  return (
    (await hasPermission(user.id, PERMISSIONS.VIEW_ALL_PROJECTS, user)) ||
    (await hasRole(user.id, ROLES.ADMIN, user)) ||
    (await hasRole(user.id, ROLES.MANAGER, user))
  )
}

export async function canManageProject(
  user: UserWithRoles,
  projectId: string
): Promise<boolean> {
  if (await hasRole(user.id, ROLES.ADMIN, user)) return true
  if (await hasRole(user.id, ROLES.MANAGER, user)) return true

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { teamMembers: true },
  })
  if (!project) return false

  if (project.ownerId === user.id) return true

  const membership = project.teamMembers.find((m) => m.userId === user.id)
  if (!membership) return false

  return (
    membership.role === ROLES.PROJECT_LEAD ||
    membership.role === ROLES.TEAM_LEAD ||
    (await hasRole(user.id, ROLES.PROJECT_LEAD, user)) ||
    (await hasRole(user.id, ROLES.TEAM_LEAD, user))
  )
}

export async function canAssignTask(
  user: UserWithRoles,
  projectId: string
): Promise<boolean> {
  if (await hasPermission(user.id, PERMISSIONS.ASSIGN_TASKS, user)) {
    if (await hasRole(user.id, ROLES.ADMIN, user)) return true
    if (await hasRole(user.id, ROLES.MANAGER, user)) return true
  }
  return canManageProject(user, projectId)
}

export async function canAssignTeamMember(
  user: UserWithRoles,
  projectId: string
): Promise<boolean> {
  if (await hasRole(user.id, ROLES.ADMIN, user)) return true
  if (await hasRole(user.id, ROLES.MANAGER, user)) return true
  return canManageProject(user, projectId)
}

export async function getAssignableUsers(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              departmentId: true,
            },
          },
        },
      },
      department: {
        include: {
          users: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              departmentId: true,
            },
          },
        },
      },
    },
  })

  if (!project) return []

  const memberIds = new Set(project.teamMembers.map((m) => m.user.id))
  const deptUsers = project.department?.users ?? []
  const teamUsers = project.teamMembers.map((m) => m.user)

  const combined = [...teamUsers]
  for (const u of deptUsers) {
    if (!memberIds.has(u.id)) combined.push(u)
  }
  return combined
}

export function userHasAnyRole(
  user: UserWithRoles,
  allowed: SystemRole[]
): boolean {
  const names = user.roles?.map((ur) => ur.role.name) ?? []
  return allowed.some((r) => names.includes(r))
}
