import {
  getAllProjects,
  getOwnedProjects,
  getProjects,
  getTasks,
  getTeamLeadProjects,
  getUnassignedTasks,
} from '@/lib/db'
import { getAssignableUsers } from '@/lib/policies'
import prisma from '@/lib/prisma'
import type { SystemRole } from '@/lib/roles'

export async function getProjectsForRole(userId: string, role: SystemRole) {
  switch (role) {
    case 'admin':
    case 'manager':
      return getAllProjects()
    case 'project_lead':
      return getOwnedProjects(userId)
    case 'team_lead':
      return getTeamLeadProjects(userId)
    default:
      return getProjects(userId)
  }
}

export async function getTasksForRole(userId: string, role: SystemRole) {
  switch (role) {
    case 'admin':
    case 'manager':
      return prisma.task.findMany({
        include: {
          project: { select: { id: true, name: true } },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    case 'project_lead': {
      const owned = await getOwnedProjects(userId)
      const ids = owned.map((p) => p.id)
      if (ids.length === 0) return []
      return prisma.task.findMany({
        where: { projectId: { in: ids } },
        include: {
          project: { select: { id: true, name: true } },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }
    case 'team_lead': {
      const projects = await getTeamLeadProjects(userId)
      const ids = projects.map((p) => p.id)
      if (ids.length === 0) return []
      return prisma.task.findMany({
        where: { projectId: { in: ids } },
        include: {
          project: { select: { id: true, name: true } },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }
    default:
      return getTasks(undefined, userId)
  }
}

export async function buildMembersByProject(projectIds: string[]) {
  const map: Record<
    string,
    { id: string; firstName?: string | null; lastName?: string | null; email?: string | null }[]
  > = {}
  for (const id of projectIds) {
    map[id] = await getAssignableUsers(id)
  }
  return map
}

export async function getAssignmentTasks(userId: string, role: SystemRole) {
  const projects = await getProjectsForRole(userId, role)
  const projectIds = projects.map((p) => p.id)
  if (projectIds.length === 0) return { tasks: [], membersByProject: {} }

  const tasks =
    role === 'admin' || role === 'manager'
      ? await prisma.task.findMany({
          where: { projectId: { in: projectIds } },
          include: {
            project: { select: { id: true, name: true } },
            assignee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : await getUnassignedTasks(projectIds).then((unassigned) =>
          prisma.task
            .findMany({
              where: { projectId: { in: projectIds } },
              include: {
                project: { select: { id: true, name: true } },
                assignee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            })
            .then((all) => {
              const unassignedIds = new Set(unassigned.map((t) => t.id))
              return all.filter(
                (t) => !t.assignedTo || unassignedIds.has(t.id)
              )
            })
        )

  const membersByProject = await buildMembersByProject(projectIds)
  return { tasks, membersByProject }
}
