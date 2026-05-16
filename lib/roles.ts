/** System roles and dashboard routing */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  PROJECT_LEAD: 'project_lead',
  TEAM_LEAD: 'team_lead',
  DEVELOPER: 'developer',
} as const

export type SystemRole = (typeof ROLES)[keyof typeof ROLES]

export const ALL_ROLES: SystemRole[] = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.PROJECT_LEAD,
  ROLES.TEAM_LEAD,
  ROLES.DEVELOPER,
]

/** Higher index = higher priority when user has multiple roles */
const ROLE_PRIORITY: SystemRole[] = [
  ROLES.DEVELOPER,
  ROLES.TEAM_LEAD,
  ROLES.PROJECT_LEAD,
  ROLES.MANAGER,
  ROLES.ADMIN,
]

export const ROLE_LABELS: Record<SystemRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  project_lead: 'Project Lead',
  team_lead: 'Team Lead',
  developer: 'Developer',
}

export const ROLE_SLUG: Record<SystemRole, string> = {
  admin: 'admin',
  manager: 'manager',
  project_lead: 'project-lead',
  team_lead: 'team-lead',
  developer: 'developer',
}

export const SLUG_TO_ROLE: Record<string, SystemRole> = {
  admin: ROLES.ADMIN,
  manager: ROLES.MANAGER,
  'project-lead': ROLES.PROJECT_LEAD,
  'team-lead': ROLES.TEAM_LEAD,
  developer: ROLES.DEVELOPER,
}

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  APPROVE_ROLES: 'approve_roles',
  VIEW_ALL_PROJECTS: 'view_all_projects',
  CREATE_PROJECT: 'create_project',
  MANAGE_DEPARTMENTS: 'manage_departments',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_COMPLIANCE: 'view_compliance',
  ASSIGN_TEAM_MEMBERS: 'assign_team_members',
  ASSIGN_TASKS: 'assign_tasks',
  MANAGE_OWN_PROJECTS: 'manage_own_projects',
  MANAGE_TEAM_TASKS: 'manage_team_tasks',
  VIEW_OWN_TASKS: 'view_own_tasks',
  JOIN_PROJECTS: 'join_projects',
} as const

export const ROLE_PERMISSIONS: Record<SystemRole, string[]> = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.VIEW_ALL_PROJECTS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.MANAGE_DEPARTMENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_COMPLIANCE,
    PERMISSIONS.ASSIGN_TEAM_MEMBERS,
    PERMISSIONS.ASSIGN_TASKS,
    PERMISSIONS.MANAGE_OWN_PROJECTS,
    PERMISSIONS.MANAGE_TEAM_TASKS,
  ],
  project_lead: [
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.MANAGE_OWN_PROJECTS,
    PERMISSIONS.ASSIGN_TEAM_MEMBERS,
    PERMISSIONS.ASSIGN_TASKS,
    PERMISSIONS.MANAGE_TEAM_TASKS,
    PERMISSIONS.VIEW_OWN_TASKS,
  ],
  team_lead: [
    PERMISSIONS.ASSIGN_TASKS,
    PERMISSIONS.MANAGE_TEAM_TASKS,
    PERMISSIONS.VIEW_OWN_TASKS,
    PERMISSIONS.JOIN_PROJECTS,
  ],
  developer: [
    PERMISSIONS.VIEW_OWN_TASKS,
    PERMISSIONS.JOIN_PROJECTS,
  ],
}

export function isSystemRole(name: string): name is SystemRole {
  return ALL_ROLES.includes(name as SystemRole)
}

export function getPrimaryRole(
  roles: string[],
  fallback?: string | null
): SystemRole {
  const valid = roles.filter(isSystemRole)
  if (valid.length === 0) {
    if (fallback && isSystemRole(fallback)) return fallback
    return ROLES.DEVELOPER
  }
  let best: SystemRole = ROLES.DEVELOPER
  let bestIdx = -1
  for (const r of valid) {
    const idx = ROLE_PRIORITY.indexOf(r)
    if (idx > bestIdx) {
      bestIdx = idx
      best = r
    }
  }
  return best
}

export function roleToSlug(role: SystemRole): string {
  return ROLE_SLUG[role]
}

export function getDashboardPath(role: SystemRole): string {
  return `/dashboard/${roleToSlug(role)}`
}

export function getUserRoleNames(user: {
  roles?: { role: { name: string } }[]
  requestedRole?: string | null
}): string[] {
  const fromDb = user.roles?.map((ur) => ur.role.name) ?? []
  if (fromDb.length > 0) return fromDb
  if (user.requestedRole) return [user.requestedRole]
  return [ROLES.DEVELOPER]
}
