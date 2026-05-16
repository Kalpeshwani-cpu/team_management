import prisma from './prisma'

// Centralized error handling for DB operations
function handleDbError(error: unknown, operation: string): never {
  console.error(`[DB_ERROR][${operation}]:`, error)
  throw error instanceof Error ? error : new Error(String(error))
}

// User operations
export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    })
  } catch (error) {
    handleDbError(error, 'getUserById')
  }
}

export async function getUsersByDepartment(departmentId: string) {
  try {
    return await prisma.user.findMany({
      where: {
        departmentId: departmentId,
        isActive: true,
      },
    })
  } catch (error) {
    handleDbError(error, 'getUsersByDepartment')
  }
}

export async function updateUser(userId: string, updates: any) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: updates,
    })
  } catch (error) {
    handleDbError(error, 'updateUser')
  }
}

// Department operations
export async function getDepartments() {
  try {
    return await prisma.department.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    handleDbError(error, 'getDepartments')
  }
}

export async function getDepartmentById(deptId: string) {
  try {
    return await prisma.department.findUnique({
      where: { id: deptId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })
  } catch (error) {
    handleDbError(error, 'getDepartmentById')
  }
}

export async function createDepartment(name: string, description?: string) {
  try {
    return await prisma.department.create({
      data: { name, description },
    })
  } catch (error) {
    handleDbError(error, 'createDepartment')
  }
}

export async function updateDepartment(deptId: string, updates: any) {
  try {
    return await prisma.department.update({
      where: { id: deptId },
      data: updates,
    })
  } catch (error) {
    handleDbError(error, 'updateDepartment')
  }
}

// Project operations
export async function getProjects(userId?: string) {
  try {
    return await prisma.project.findMany({
      where: userId
        ? {
            OR: [
              { ownerId: userId },
              { teamMembers: { some: { userId } } },
            ],
          }
        : {},
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        department: { select: { id: true, name: true } },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    handleDbError(error, 'getProjects')
  }
}

export async function getAllProjects() {
  try {
    return await prisma.project.findMany({
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        department: { select: { id: true, name: true } },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    handleDbError(error, 'getAllProjects')
  }
}

export async function getProjectById(projectId: string) {
  try {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        department: { select: { id: true, name: true } },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    })
  } catch (error) {
    handleDbError(error, 'getProjectById')
  }
}

export async function createProject(
  name: string,
  ownerId: string,
  description?: string,
  departmentId?: string
) {
  try {
    return await prisma.project.create({
      data: {
        name,
        ownerId,
        description,
        departmentId,
      },
    })
  } catch (error) {
    handleDbError(error, 'createProject')
  }
}

export async function updateProject(projectId: string, updates: any) {
  try {
    return await prisma.project.update({
      where: { id: projectId },
      data: updates,
    })
  } catch (error) {
    handleDbError(error, 'updateProject')
  }
}

// Task operations
export async function getTasks(projectId?: string, userId?: string) {
  try {
    return await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(userId && {
          OR: [{ assignedTo: userId }, { createdBy: userId }],
        }),
      },
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
  } catch (error) {
    handleDbError(error, 'getTasks')
  }
}

export async function getTaskById(taskId: string) {
  try {
    return await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true } },
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })
  } catch (error) {
    handleDbError(error, 'getTaskById')
  }
}

export async function createTask(
  projectId: string,
  title: string,
  createdBy: string,
  description?: string,
  priority?: string,
  assignedTo?: string
) {
  try {
    return await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority: priority || 'medium',
        createdBy,
        assignedTo,
      },
    })
  } catch (error) {
    handleDbError(error, 'createTask')
  }
}

export async function updateTask(taskId: string, updates: any) {
  try {
    return await prisma.task.update({
      where: { id: taskId },
      data: updates,
    })
  } catch (error) {
    handleDbError(error, 'updateTask')
  }
}

// Qualifications operations
export async function getQualifications() {
  try {
    return await prisma.qualification.findMany({
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    handleDbError(error, 'getQualifications')
  }
}

export async function createQualification(
  name: string,
  description?: string,
  level?: string
) {
  try {
    return await prisma.qualification.create({
      data: { name, description, level },
    })
  } catch (error) {
    handleDbError(error, 'createQualification')
  }
}

// Monitoring operations
export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
) {
  try {
    await prisma.monitoringLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // We don't throw here to avoid failing the main operation if logging fails
  }
}

export async function getActivityLogs(limit = 100) {
  try {
    return await prisma.monitoringLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    handleDbError(error, 'getActivityLogs')
  }
}

export async function getOwnedProjects(userId: string) {
  try {
    return await prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        department: { select: { id: true, name: true } },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    handleDbError(error, 'getOwnedProjects')
  }
}

export async function getTeamLeadProjects(userId: string) {
  try {
    return await prisma.project.findMany({
      where: {
        teamMembers: {
          some: {
            userId,
            role: { in: ['team_lead', 'project_lead'] },
          },
        },
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        department: { select: { id: true, name: true } },
        teamMembers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        tasks: { select: { id: true, status: true, assignedTo: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    handleDbError(error, 'getTeamLeadProjects')
  }
}

export async function getUnassignedTasks(projectIds?: string[]) {
  try {
    return await prisma.task.findMany({
      where: {
        assignedTo: null,
        ...(projectIds?.length ? { projectId: { in: projectIds } } : {}),
      },
      include: {
        project: { select: { id: true, name: true } },
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    handleDbError(error, 'getUnassignedTasks')
  }
}

export async function getProjectTasks(projectId: string) {
  try {
    return await prisma.task.findMany({
      where: { projectId },
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
  } catch (error) {
    handleDbError(error, 'getProjectTasks')
  }
}

export async function getCompanyStats() {
  try {
    const [users, projects, tasks, pendingApprovals, departments] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.project.count(),
        prisma.task.count(),
        prisma.roleRequest.count({ where: { status: 'pending' } }),
        prisma.department.count(),
      ])
    const completedTasks = await prisma.task.count({
      where: { status: 'completed' },
    })
    return {
      users,
      projects,
      tasks,
      completedTasks,
      pendingApprovals,
      departments,
      completionRate:
        tasks > 0 ? Math.round((completedTasks / tasks) * 100) : 0,
    }
  } catch (error) {
    handleDbError(error, 'getCompanyStats')
  }
}

export async function getDepartmentStats(departmentId?: string) {
  try {
    const where = departmentId ? { departmentId } : {}
    const users = await prisma.user.count({ where: { ...where, isActive: true } })
    const projects = await prisma.project.count({
      where: departmentId ? { departmentId } : {},
    })
    const tasks = await prisma.task.count({
      where: departmentId
        ? { project: { departmentId } }
        : {},
    })
    return { users, projects, tasks }
  } catch (error) {
    handleDbError(error, 'getDepartmentStats')
  }
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: string
) {
  try {
    return await prisma.projectTeamMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    })
  } catch (error) {
    handleDbError(error, 'addProjectMember')
  }
}
