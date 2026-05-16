import prisma from './prisma'

// Centralized error handling for DB operations
function handleDbError(error: any, operation: string) {
  console.error(`[DB_ERROR][${operation}]:`, error)
  // We could add more sophisticated error handling here (e.g., Prisma error codes)
  throw error
}

// User operations
export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true }
    })
  } catch (error) {
    return handleDbError(error, 'getUserById')
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
    return handleDbError(error, 'getUsersByDepartment')
  }
}

export async function updateUser(userId: string, updates: any) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: updates,
    })
  } catch (error) {
    return handleDbError(error, 'updateUser')
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
    return handleDbError(error, 'getDepartments')
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
    return handleDbError(error, 'getDepartmentById')
  }
}

export async function createDepartment(name: string, description?: string) {
  try {
    return await prisma.department.create({
      data: { name, description },
    })
  } catch (error) {
    return handleDbError(error, 'createDepartment')
  }
}

export async function updateDepartment(deptId: string, updates: any) {
  try {
    return await prisma.department.update({
      where: { id: deptId },
      data: updates,
    })
  } catch (error) {
    return handleDbError(error, 'updateDepartment')
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
    return handleDbError(error, 'getProjects')
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
    return handleDbError(error, 'getAllProjects')
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
    return handleDbError(error, 'getProjectById')
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
    return handleDbError(error, 'createProject')
  }
}

export async function updateProject(projectId: string, updates: any) {
  try {
    return await prisma.project.update({
      where: { id: projectId },
      data: updates,
    })
  } catch (error) {
    return handleDbError(error, 'updateProject')
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
    return handleDbError(error, 'getTasks')
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
    return handleDbError(error, 'getTaskById')
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
    return handleDbError(error, 'createTask')
  }
}

export async function updateTask(taskId: string, updates: any) {
  try {
    return await prisma.task.update({
      where: { id: taskId },
      data: updates,
    })
  } catch (error) {
    return handleDbError(error, 'updateTask')
  }
}

// Qualifications operations
export async function getQualifications() {
  try {
    return await prisma.qualification.findMany({
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    return handleDbError(error, 'getQualifications')
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
    return handleDbError(error, 'createQualification')
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
    return handleDbError(error, 'getActivityLogs')
  }
}
