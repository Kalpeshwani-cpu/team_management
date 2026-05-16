import prisma from './prisma'

// User operations
export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true }
  })
}

export async function getUsersByDepartment(departmentId: string) {
  return await prisma.user.findMany({
    where: {
      departmentId: departmentId,
      isActive: true,
    },
  })
}

export async function updateUser(userId: string, updates: any) {
  return await prisma.user.update({
    where: { id: userId },
    data: updates,
  })
}

// Department operations
export async function getDepartments() {
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
}

export async function getDepartmentById(deptId: string) {
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
}

export async function createDepartment(name: string, description?: string) {
  return await prisma.department.create({
    data: { name, description },
  })
}

export async function updateDepartment(deptId: string, updates: any) {
  return await prisma.department.update({
    where: { id: deptId },
    data: updates,
  })
}

// Project operations
export async function getProjects(userId?: string) {
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
}

export async function getAllProjects() {
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
}

export async function getProjectById(projectId: string) {
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
}

export async function createProject(
  name: string,
  ownerId: string,
  description?: string,
  departmentId?: string
) {
  return await prisma.project.create({
    data: {
      name,
      ownerId,
      description,
      departmentId,
    },
  })
}

export async function updateProject(projectId: string, updates: any) {
  return await prisma.project.update({
    where: { id: projectId },
    data: updates,
  })
}

// Task operations
export async function getTasks(projectId?: string, userId?: string) {
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
}

export async function getTaskById(taskId: string) {
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
}

export async function createTask(
  projectId: string,
  title: string,
  createdBy: string,
  description?: string,
  priority?: string,
  assignedTo?: string
) {
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
}

export async function updateTask(taskId: string, updates: any) {
  return await prisma.task.update({
    where: { id: taskId },
    data: updates,
  })
}

// Qualifications operations
export async function getQualifications() {
  return await prisma.qualification.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createQualification(
  name: string,
  description?: string,
  level?: string
) {
  return await prisma.qualification.create({
    data: { name, description, level },
  })
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
  }
}

export async function getActivityLogs(limit = 100) {
  return await prisma.monitoringLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}
